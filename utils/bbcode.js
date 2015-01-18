module.exports = function(str){
	// Welcome to regex hell
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
