var fs = require('fs'),
	markdown = require('markdown').markdown;

var Utils = require('./utils');

var repo = 'git://git.curseforge.net/wow/%s/mainline.git';

module.exports.fetchChangelog = function(details, callback){
	Utils.Clone(repo.replace('%s', details.curse), details.curse, function(err, path){
		if(err)
			callback(err);
		else {
			var filePath = path + '/' + details.changelogPath;
			if(!fs.existsSync(filePath))
				callback(new Error(Utils.Strings.CHANGELOG_MISSING.replace('%s', details.changelogPath)))
			else {
				fs.readFile(filePath, {encoding: details.encoding || 'utf8'}, function(err, data){
					if(err)
						callback(err);
					else
						callback(null, data);
				});
			}
		}
	});
}

module.exports.formatChangelog = function(data){
	return Utils.HTMLToBBCode(markdown.toHTML(data));
}

module.exports.getInterfaceVersion = function(details, callback){
	Utils.Clone(repo.replace('%s', details.curse), details.curse, function(err, path){
		if(err)
			callback(err);
		else {
			var filePath = path + '/' + details.path + '.toc';
			if(!fs.existsSync(filePath))
				callback(new Error(Utils.Strings.TOC_MISSING))
			else {
				fs.readFile(filePath, {encoding: details.encoding || 'utf8'}, function(err, data){
					if(err)
						callback(err);
					else {
						var interfaceVersion = data.match(/Interface: ?(.+)/);
						if(!interfaceVersion)
							callback(new Error(Utils.Strings.INTERFACE_VERSION_MISSING));
						else
							callback(interfaceVersion[1]);
					}
				});
			}
		}
	});
}
