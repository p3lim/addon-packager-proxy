var bl = require('bl'),
	crypto = require('crypto'),
	express = require('express'),
	request = require('request');

var app = express(),
	projects = {};

var Log = require('./utils').Log,
	Strings = require('./utils').Strings,
	Packager = require('./packager');

app.get('/', function(req, res){
	res.send('Nothing to see here, move along!');
});

app.post('/webhook', function(req, res, next){
	if(!req.headers['x-github-delivery'])
		return Log.error(Strings.WEBHOOK_NO_DELIVERY);

	var signature = req.headers['x-hub-signature'],
		event = req.headers['x-github-event'];

	if(!signature)
		return Log.error(Strings.WEBHOOK_NO_SECRET);

	if(!event)
		return Log.error(Strings.WEBHOOK_NO_EVENT);

	req.pipe(bl(function(err, data){
		if(err)
			return Log.error(Strings.ERROR_MESSAGE.replace('%s', 'Webhook').replace('%s', err.message));

		if(signatureMatch(signature, data))
			return Log.error(Strings.WEBHOOK_SIGN_MISMATCH);

		try {
			res.payload = JSON.parse(data.toString());
		} catch(err){
			return Log.error(Strings.WEBHOOK_SYNTAX_ERROR);
		}

		res.event = event;

		next();
	}));
}, function(req, res){
	if(res.event === 'ping')
		return Log.info(Strings.WEBHOOK_PING_MESSAGE.replace('%s', res.payload.zen));

	if(res.event !== 'create')
		return Log.info(Strings.WEBHOOK_EVENT_MISMATCH.replace('%s', res.event));

	if(res.payload.ref_type !== 'tag')
		return Log.info(Strings.WEBHOOK_REF_MISMATCH.replace('%s', res.payload.ref_type));

	var name = res.payload.repository.name;
	var details = projects[name];
	if(!details)
		return Log.info(Strings.WEBHOOK_REPO_MISMATCH.replace('%s', name));

	Log.info(Strings.WEBHOOK_RECEIVED_MESSAGE.replace('%s', name).replace('%s', res.payload.ref));

	details.tag = res.payload.ref;
	new Packager(details);
});

function signatureMatch(signature, data){
	var computed = 'sha1=' + crypto.createHmac('sha1', process.env.SECRET_KEY).update(data).digest('hex');
	return computed === signature;
}

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
