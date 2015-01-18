var fs = require('fs'),
	zip = require('adm-zip'),
	request = require('request'),
	markdown = require('markdown');

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

function markdownToBBCode(str){
	var doc = markdown.toHTML(str);

	// Welcome to rexex hell
	doc = doc.replace(/<\/li><li>/gm, '\n[*]');
	doc = doc.replace(/<li>/gm, '[*]');
	doc = doc.replace(/<\/li>/gm, '');
	doc = doc.replace(/<ul>/gm, '[list]');
	doc = doc.replace(/<ol>/gm, '[list=1]');
	doc = doc.replace(/<\/[uo]l>/gm, '[/list]');
	doc = doc.replace(/<(\/?)em>/gm, '[$1i]');
	doc = doc.replace(/<(\/?)strong>/gm, '[$1b]');
	doc = doc.replace(/<h1>/gm, '[size=6]');
	doc = doc.replace(/<h2>/gm, '[size=5]');
	doc = doc.replace(/<h3>/gm, '[size=4]');
	doc = doc.replace(/<h4>/gm, '[size=3]');
	doc = doc.replace(/<h5>/gm, '[size=2]');
	doc = doc.replace(/<h6>/gm, '[size=1]');
	doc = doc.replace(/<\/h\d>/gm, '[/size]');
	doc = doc.replace(/<(\/?)blockquote>/gm, '[$1quote]');
	doc = doc.replace(/<pre><code>/gm, '[code]');
	doc = doc.replace(/<\/code><\/pre>/gm, '[/code]');
	doc = doc.replace(/<\/?code>/gm, '`');
	doc = doc.replace(/<img.+?src="(\S+)?"\/>/gm, '[img]$1[/img]');
	doc = doc.replace(/<a href=("(\S+)?")>/gm, '[url=$1]');
	doc = doc.replace(/<a href=("(\S+)?") title=".+?">/gm, '[url=$1]');
	doc = doc.replace(/<\/a>/gm, '[/url]');

	// Remove unsupported stuff if we can
	doc = doc.replace(/<hr\/>([^\n])/gm, '\n$1'); // horizontal rule without leading newline
	doc = doc.replace(/<hr\/>/gm, ''); // horizontal rule
	doc = doc.replace(/<\/p>([^\n])/gm, '\n$1'); // paragraph without leading newline
	doc = doc.replace(/<\/?p>/gm, ''); // paragraph
	doc = doc.replace(/<br\/>/gm, '\n'); // linebreaks

	// Unescape
	doc = doc.replace(/&amp/gm, '&');
	doc = doc.replace(/&lt;/gm, '<');
	doc = doc.replace(/&gt;/gm, '>');
	doc = doc.replace(/&quot;/gm, '"');
	doc = doc.replace(/&#39;/gm, '\'');

	return doc;
}
