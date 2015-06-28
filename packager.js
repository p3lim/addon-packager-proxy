var fs = require('fs'),
	request = require('request');

var Utils = require('./utils'),
	Strings = Utils.Strings,
	Log = new Utils.Log(),
	Files = require('./files');

var cookies = request.jar();

var queryMaxAttempts = Math.max(Math.min(+process.env.QUERY_MAX_ATTEMPTS, 10), 2);
var queryDelaySeconds = Math.max(Math.min(+process.env.QUERY_DELAY_SECONDS, 300), 30);

module.exports = function(details, id, forced){
	Log.setID(id);
	Log.info(Strings.WORK_ORDER_STARTED.replace('%s', id));

	if(forced)
		queryCurse(details);
	else {
		var numPolls = 0;
		var interval = setInterval(function(){
			++numPolls;
			if(numPolls > queryMaxAttempts){
				Log.error(Strings.LOOP_EXCEEDED_ATTEMPTS.replace('%s', queryMaxAttempts));
				clearInterval(interval);
			} else {
				Log.info(Strings.LOOP_ATTEMPT.replace('%s', numPolls));
				queryCurse(details, interval);
			}
		}, queryDelaySeconds * 1000);
	}
}

function handleErrors(err, res, body){
	if(err)
		Log.error(Strings.CONNECTION_ERROR.replace('%s', res.request.uri.href));
	else if(res && res.statusCode != 200)
		Log.error(Strings.RESPONSE_INCORRECT.replace('%s', res.request.uri.href).replace('%s', res.statusCode).replace('%s', body || 'null'));
	else
		return true;
}

var curseURL = 'http://wow.curseforge.com';
var curseCDN = 'http://addons.cursecdn.com';

function queryCurse(details, interval){
	request(curseURL + '/addons/' + details.curse + '/files', function(err, res, body){
		if(!handleErrors(err, res))
			return;

		var tagPath = body.match('(/addons/' + details.curse + '/files/.+/)">' + details.tag + '</a>');
		if(!tagPath)
			return Log.error(Strings.CURSE_TAG_NOT_FOUND);

		Log.info(Strings.CURSE_TAG_FOUND);

		request(curseURL + tagPath[1], function(err, res, body){
			if(!handleErrors(err, res))
				return;

			var filePath = body.match('http://.+/media(/files/.+/.+/(.+\-' + details.tag + '.zip))');
			if(!filePath)
				return Log.error(Strings.CURSE_FILE_NOT_FOUND);

			Log.info(Strings.CURSE_FILE_FOUND);

			request(curseCDN + filePath[1]).on('response', function(res){
				if(!handleErrors(null, res))
					return;

				Log.info(Strings.CURSE_FILE_DOWNLOADED);

				if(interval)
					clearInterval(interval);

				queryWowi(details, filePath[2]);
			}).on('error', function(err){
				handleErrors(err);
			}).pipe(fs.createWriteStream(filePath[2]));
		});
	});
}

var wowiLogin = 'https://secure.wowinterface.com/forums/login.php';
var wowiAPI = 'http://api.wowinterface.com';

function queryWowi(details, filePath){
	request.post({
		url: wowiLogin,
		jar: cookies,
		formData: {
			'cookieuser': 1,
			'vb_login_username': process.env.WOWI_USERNAME,
			'vb_login_password': process.env.WOWI_PASSWORD,
			'do': 'login'
		}
	}, function(err, res, body){
		if(!handleErrors(err, res, body))
			return;

		Log.info(Strings.AUTH_SUCCESSFUL);

		request({
			url: wowiAPI + '/addons/details/' + details.wowi + '.json',
			jar: cookies,
			json: true
		}, function(err, res, data){
			if(!handleErrors(err, res, data))
				return;

			var currentVersion = data[0].version;
			if(details.tag == currentVersion)
				return Log.info(Strings.ADDON_EXISTS.replace('%s', currentVersion));

			Log.info(Strings.ADDON_DETAILS.replace('%s', currentVersion));

			var postData = {
				url: wowiAPI + '/addons/update',
				jar: cookies,
				formData: {
					id: +details.wowi,
					version: details.tag,
					updatefile: fs.createReadStream(filePath)
				}
			}

			if(details.changelog){
				if(!details.changelogPath)
					details.changelogPath = 'CHANGELOG.md';

				Log.info(Strings.CHANGELOG_FETCH.replace('%s', details.changelogPath));

				Files.fetchChangelog(details, function(err, data){
					if(err)
						return Log.error(err);

					Log.info(Strings.CHANGELOG_FETCHED.replace('%s', details.changelogPath));

					postData.formData.changelog = Files.formatChangelog(data);

					updateWowi(details, postData);
				});
			} else
				updateWowi(details, postData);
		});
	});
}

function updateWowi(details, postData){
	Files.getInterfaceVersion(details, function(err, version){
		if(err)
			return Log.error(err);

		postData.formData.compatible = version.charAt(0) + '.' + version.charAt(2);

		Log.info(Strings.ADDON_UPLOADING);

		request.post(postData, function(err, res, body){
			if(!handleErrors(err, res, body))
				return;

			Log.info(Strings.ADDON_UPLOADED.replace('%s', details.path).replace('%s', details.tag));
		});
	});
}
