var bl = require('bl'),
	crypto = require('crypto'),
	express = require('express'),
	request = require('request');

var app = express(),
	projects = {},
	workID = 0;

var Log = new require('./utils').Log(),
	Strings = require('./utils').Strings,
	Packager = require('./packager');

app.listen(process.env.PORT || 5000);

app.get('/', function(req, res){
	res.redirect('https://github.com/p3lim/addon-packager-proxy/wiki/Setup');
});

var regexParam = function(name, fn){
	return function(req, res, next, val){
		var captures;
		if(captures = fn.exec(String(val))){
			req.params[name] = captures[0];
			next();
		} else
			next('route');
	}
}

var fetchAddonList = function(){
	request({
		url: 'https://api.github.com/gists/' + process.env.GIST_ID,
		json: true,
		headers: {
			'User-Agent': 'addon-packager-proxy'
		}
	}, function(err, res, data){
		if(err)
			return Log.error(Strings.CONNECTION_ERROR.replace('%s', res.request.uri.href));

		if(!data.files)
			return Log.error(Strings.GIST_NOT_FOUND.replace('%s', process.env.GIST_ID));

		var file = data.files['addons.json'];
		if(!file)
			return Log.error(Strings.GIST_FILE_NOT_FOUND);

		var obj;
		try {
			obj = JSON.parse(file.content);
		} catch(err){
			return Log.error(Strings.GIST_SYNTAX_ERROR);
		}

		for(var index in obj)
			projects[obj[index].repo] = obj[index];

		Log.info(Strings.GIST_SUCCESSFUL);
	});
}

app.param('repo', regexParam('repo', /[\d\w\.-]+/));
app.param('tag', regexParam('tag', /.+/));

app.get('/updatelist', function(req, res){
	fetchAddonList();
	res.send(Strings.FORCED_GIST_UPDATE_MESSAGE);
	Log.info(Strings.FORCED_GIST_UPDATE_MESSAGE);
});

app.get('/force/:repo/:tag', function(req, res){
	var name = req.params.repo;
	var details = projects[name];
	if(!details){
		res.status(400).send(Strings.WEBHOOK_REPO_MISMATCH.replace('%s', name));
		return Log.info(Strings.WEBHOOK_REPO_MISMATCH.replace('%s', name));
	}

	var tag = req.params.tag;
	res.send(Strings.FORCED_CHECK_MESSAGE.replace('%s', name).replace('%s', tag));
	Log.info(Strings.FORCED_CHECK_MESSAGE.replace('%s', name).replace('%s', tag));

	details.tag = tag;
	new Packager(details, ++workID, true);
});

app.post('/', function(req, res, next){
	var secret, event, source;
	if(req.headers['x-github-event']){
		secret = req.headers['x-hub-signature'];
		event = req.headers['x-github-event'];
		source = 'GitHub';
	} else if(req.headers['x-gitlab-event']){
		secret = req.headers['x-gitlab-token']; // plain text
		event = req.headers['x-gitlab-event'];
		source = 'GitLab';
	} else if(req.headers['x-event-key']){
		secret = ''; // no secret
		event = req.headers['x-event-key'];
		source = 'Bitbucket'
	} else {
		res.status(400).end();
		return Log.error(Strings.WEBHOOK_NO_EVENT);
	}

	if(!secret){
		res.status(400).end();
		return Log.error(Strings.WEBHOOK_NO_SECRET);
	}

	req.pipe(bl(function(err, data){
		if(err){
			res.status(500).end();
			return Log.error(Strings.ERROR_MESSAGE.replace('%s', 'Webhook').replace('%s', err.message));
		}

		if(source === 'GitHub'){
			if(!signatureMatch(secret, data, source)){
				res.status(401).end();
				return Log.error(Strings.WEBHOOK_SIGN_MISMATCH);
			}
		} else if(source === 'GitLab'){
			// GitLab doesn't encrypt the signature :/
			if(secret !== process.env.SECRET_KEY){
				res.status(401).end();
				return Log.error(Strings.WEBHOOK_SIGN_MISMATCH);
			}
		}

		try {
			res.payload = JSON.parse(data.toString());
		} catch(err){
			res.status(400).end()
			return Log.error(Strings.WEBHOOK_SYNTAX_ERROR);
		}

		res.event = event;
		res.source = source;

		next()
	}));
}, function(req, res){
	if(res.event === 'ping'){
		res.status(200).end();
		return Log.info(Strings.WEBHOOK_PING_MESSAGE.replace('%s', res.payload.zen));
	}

	var name, source, tag;
	if(res.source === 'GitHub'){
		if(res.event !== 'create'){
			res.status(204).end();
			return;
		}

		if(res.payload.ref_type !== 'tag'){
			res.status(204).end();
			return Log.info(Strings.WEBHOOK_REF_MISMATCH.replace('%s', res.payload.ref_type));
		}

		name = res.payload.repository.name;
		source = res.payload.repository.git_url;
		tag = res.payload.ref;
	} else if(res.source === 'GitLab'){
		if(res.event !== 'Tag Push Hook'){
			res.status(204).end();
			return Log.info(Strings.WEBHOOK_REF_MISMATCH.replace('%s', res.event));
		}

		name = res.payload.project.name;
		source = res.payload.project.git_ssh_url;
		tag = res.payload.ref.split('/').pop();
	} else if(res.source === 'Bitbucket'){
		if(res.event !== 'repo:push' || res.payload.push.changes[0].new.type === 'tag'){
			res.status(204).end();
			return Log.info(Strings.WEBHOOK_REF_MISMATCH.replace('%s', res.event + '-' + res.payload.push.changes[0].new.type))
		}

		name = res.payload.repository.name;
		source = 'https://bitbucket.org/' + res.payload.repository.full_name;
		tag = res.payload.push.changes[0].new.name;
	}

	var details = projects[name];
	if(!details){
		res.status(204).end();
		return Log.info(Strings.WEBHOOK_REPO_MISMATCH.replace('%s', name));
	}

	Log.info(Strings.WEBHOOK_RECEIVED_MESSAGE.replace('%s', name).replace('%s', res.payload.ref));

	details.source = source;
	details.tag = tag;
	new Packager(details, ++workID);

	res.status(202).end();
});

function signatureMatch(signature, data, source){
	var computed = 'sha1=' + crypto.createHmac('sha1', process.env.SECRET_KEY).update(data).digest('hex');
	if(computed === signature)
		return true;
	else {
		Log.info(Strings.SIGN_PROVIDED.replace('%s', signature));
		Log.info(Strings.SIGN_COMPUTED.replace('%s', computed));
	}
}

fetchAddonList();
