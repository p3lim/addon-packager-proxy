var fs = require('fs'),
	zip = require('adm-zip'),
	request = require('request');

var Log = require('./utils').Log,
	Strings = require('./utils').Strings;

var cookies = request.jar();

var queryMaxAttempts = Math.max(Math.min(+process.env.QUERY_MAX_ATTEMPTS || 3, 10), 2);
var queryDelaySeconds = Math.max(Math.min(+process.env.QUERY_DELAY_SECONDS || 60, 300), 30);

module.exports = function(details){
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

function handleErrors(err, res){
	if(err)
		Log.error(Strings.CONNECTION_ERROR.replace('%s', res.request.uri.href));
	else if(res && res.statusCode != 200)
		Log.error(Strings.RESPONSE_INCORRECT.replace('%s', res.request.uri.href).replace('%s', res.statusCode));
	else
		return true;
}

var curseURL = 'http://wow.curseforge.com';
var curseCDN = 'http://addons.cursecdn.com';

function queryCurse(details, interval){
	request(curseURL + '/addons/' + details.curse + '/files', function(err, res, body){
		if(handleErrors(err, res)){
			var tagPath = body.match('(/addons/' + details.curse + '/files/.+/)">' + details.tag + '</a>');
			if(tagPath){
				Log.info(Strings.CURSE_TAG_FOUND);

				request(curseURL + tagPath[1], function(err, res, body){
					if(handleErrors(err, res)){
						var filePath = body.match('http://.+/media(/files/.+/.+/(.+\-' + details.tag + '.zip))');
						if(filePath){
							Log.info(Strings.CURSE_FILE_FOUND);

							request(curseCDN + filePath[1]).on('response', function(res){
								if(handleErrors(null, res)){
									Log.info(Strings.CURSE_FILE_DOWNLOADED);
									clearInterval(interval);
									queryWowi(details, filePath[2]);
								}
							}).on('error', function(err){
								handleErrors(err);
							}).pipe(fs.createWriteStream(filePath[2]));
						} else
							Log.error(Strings.CURSE_FILE_NOT_FOUND);
					}
				});
			} else
				Log.error(Strings.CURSE_TAG_NOT_FOUND);
		}
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
		if(handleErrors(err, res)){
			Log.info(Strings.AUTH_SUCCESSFUL);

			request({
				url: wowiAPI + '/addons/details/' + details.wowi + '.json',
				jar: cookies,
				json: true
			}, function(err, res, data){
				if(handleErrors(err, res)){
					if(details.tag != data[0].version){
						Log.info(Strings.ADDON_DETAILS.replace('%s', data[0].version));

						var formData = {
							id: +details.wowi,
							version: details.tag,
							updatefile: fs.createReadStream(filePath)
						};

						var changelog = getChangelog(details, filePath);
						if(changelog)
							formData.changelog = markdownToBBCode(changelog);

						request.post({
							url: wowiAPI + '/addons/update',
							jar: cookies,
							formData: formData
						}, function(err, res, body){
							if(handleErrors(err, res))
								Log.info(Strings.ADDON_UPLOADED.replace('%s', details.path).replace('%s', details.tag));
						});
					} else
						Log.info(Strings.ADDON_EXISTS.replace('%s', data.version));
				}
			});
		}
	});
}

function getChangelog(details, file){
	var archive = new zip(file);
	return archive.readAsText(archive.getEntry(details.path + '/CHANGELOG.md'));
}

// TODO: flex out a bit, this is too barebone
function markdownToBBCode(str){
	str = str.replace(/^## (.+)$/gm, '[/list][b]$1[/b][list]');
	str = str.replace(/^- (.+$)/gm, '[*]$1').replace(/\n\n/g, '\n');
	return str.replace(/^\[\/list\]/g, '') + '[/list]';
}
