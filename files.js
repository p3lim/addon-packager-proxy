var fs = require('fs'),
	zip = require('adm-zip'),
	markdown = require('markdown').markdown;

var Utils = require('./utils');

module.exports.fetchChangelog = function(details, callback){
/*
	Utils.Clone(details.github_repo, details.curse, function(err, path){
		if(err)
			callback(err);
		else {
			var filePath = path + '/' + details.changelogPath;
			fs.stat(filePath, function(err, stats){
				if(stats && stats.isFile()){
					fs.readFile(filePath, {encoding: details.encoding || 'utf8'}, function(rerr, data){
						if(rerr)
							callback(rerr);
						else
							callback(null, data);
					});
				} else
					callback(new Error(Utils.Strings.CHANGELOG_MISSING.replace('%s', details.changelogPath)));
			});
		}
	});
*/

	var archive = new zip(details.path + '-' + details.tag + '.zip');
	var file = archive.getEntry(details.path + '/' + (details.changelogPath || 'CHANGELOG.md'));
	if(file)
		callback(null, archive.readAsText(file));
	else
		callback(new Error(Utils.Strings.CHANGELOG_MISSING.replace('%s', details.changelogPath)));
}

module.exports.formatChangelog = function(data){
	return Utils.HTMLToBBCode(markdown.toHTML(data));
}

module.exports.getInterfaceVersion = function(details, callback){
/*
	Utils.Clone(details.github_repo, details.curse, function(err, path){
		if(err)
			callback(err);
		else {
			var filePath = path + '/' + details.path + '.toc';
			fs.stat(filePath, function(err, stats){
				if(stats && stats.isFile()){
					fs.readFile(filePath, {encoding: details.encoding || 'utf8'}, function(rerr, data){
						if(rerr)
							callback(rerr);
						else {
							var interfaceVersion = data.match(/Interface: ?(.+)/);
							if(!interfaceVersion)
								callback(new Error(Utils.Strings.INTERFACE_VERSION_MISSING));
							else
								callback(null, interfaceVersion[1]);
						}
					});
				} else
					callback(new Error(Utils.Strings.TOC_MISSING));
			});
		}
	});
*/

	var archive = new zip(details.path + '-' + details.tag + '.zip');
	var file = archive.getEntry(details.path + '/' + details.path + '.toc');
	if(file){
		var contents = archive.readAsText(file);

		var interfaceVersion = contents.match(/Interface: ?(.+)/);
		if(!interfaceVersion)
			callback(new Error(Utils.Strings.INTERFACE_VERSION_MISSING));
		else
			callback(null, interfaceVersion[1]);
	} else
		callback(new Error(Utils.Strings.TOC_MISSING));
}
