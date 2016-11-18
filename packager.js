var fs = require('fs'),
	request = require('request');

var Utils = require('./utils'),
	Strings = Utils.Strings,
	Log = new Utils.Log(),
	Files = require('./files');

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
	else if(res && res.statusCode.toString()[0] != 2)
		Log.error(Strings.RESPONSE_INCORRECT.replace('%s', res.request.uri.href).replace('%s', res.statusCode).replace('%s', body || 'null'));
	else
		return true;
}

var curseURL = 'https://wow.curseforge.com';

function queryCurse(details, interval){
	request(curseURL + '/projects/' + details.curse + '/files', function(err, res, body){
		if(!handleErrors(err, res))
			return;

		var fileID = body.match('/projects/' + details.curse + '/files/(.+)">' + details.tag + '</a>');
		if(!fileID)
			return Log.error(Strings.CURSE_TAG_NOT_FOUND);

		Log.info(Strings.CURSE_TAG_FOUND);

		var fileName = details.path + '-' + details.tag + '.zip'
		request(curseURL + '/projects/' + details.curse + '/files/' + fileID[1] + '/download').on('response', function(res){
			if(!handleErrors(null, res))
				return;

			Log.info(Strings.CURSE_FILE_DOWNLOADED);

			if(interval)
				clearInterval(interval);

			queryWowi(details, fileName);
		}).on('error', function(err){
			handleErrors(err);
		}).pipe(fs.createWriteStream(fileName));
	});
}

var wowiAPI = 'https://api.wowinterface.com';

function queryWowi(details, filePath){
	var headers = {'X-API-Token': process.env.WOWI_API_TOKEN}

	request({
		url: wowiAPI + '/addons/details/' + details.wowi + '.json',
		headers: headers,
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
			headers: headers,
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
}

function updateWowi(details, postData){
	Files.getInterfaceVersion(details, function(err, version){
		if(err)
			return Log.error(err);

		request({
			url: wowiAPI + '/addons/compatible.json',
			headers: postData.headers,
			json: true
		}, function(err, res, data){
			if(!handleErrors(err, res, data))
				return;

			Log.info(Strings.COMPATIBLE_FETCHED);

			var defaultID, id;
			for(obj in data){
				if(data[obj].default)
					defaultID = data[obj].id;

				if(data[obj].interface == version)
					id = data[obj].id;
			}

			if(!id){
				Log.info(Strings.COMPATIBLE_DEFAULT.replace('%s', version).replace('%s', defaultID));
				id = defaultID;
			} else
				Log.info(Strings.COMPATIBLE.replace('%s', id).replace('%s', version));

			postData.formData.compatible = id;

			Log.info(Strings.ADDON_UPLOADING);

			request.post(postData, function(err, res, body){
				if(!handleErrors(err, res, body))
					return;

				Log.info(Strings.ADDON_UPLOADED.replace('%s', details.path).replace('%s', details.tag));
			});
		});
	});
}
