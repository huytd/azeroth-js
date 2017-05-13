var fs = require('fs');
var marked = require('./js/marked.js');

marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false, // IMPORTANT, because we do MathJax before markdown,
  //            however we do escaping in 'CreatePreview'.
  smartLists: true,
  smartypants: false
});

var templateHtml = '';
var indexTemplateHtml = '';

templateHtml = fs.readFileSync('preview.html', { encoding: 'utf8' });

var genPreview = function(f, res) {
  if (f.indexOf('.md') != -1) {
    var postContent = '';
    var htmlContent = '';
    var metaData = '';
    var additionalPath = '';
    if (f.match(/\//g) === null) { 
      additionalPath = 'posts/';
    }
    fs.readFile(__dirname + '/' + additionalPath + f, function (err, data) {
      if (err)
        throw err;
      if (data) {
        var markdownPost = data.toString('utf8');
        var lines = markdownPost.split('\n');
        var title = '';
        if (lines.length > 0) {
          title = lines[0].replace(/#/g, '').replace("\r\n", '').replace("\n", '');
        }          


        // Custom components
			  	markdownPost = markdownPost.replace(/<cover>/g, '<div class="cover" style="background-image:url(');
			  	markdownPost = markdownPost.replace(/<\/cover>/g, '"></div><div class="cover-holder"></div>');
			  	markdownPost = markdownPost.replace(/<math>/g, '<pre class="math">$$');
			  	markdownPost = markdownPost.replace(/<\/math>/g, '$$</pre>');
          markdownPost = markdownPost.replace(/img\//g, 'posts/img/');

        postContent = marked(markdownPost);
        htmlContent = templateHtml.replace('{%content%}', postContent);
        htmlContent = htmlContent.replace('../', '');
        htmlContent = htmlContent.replace('{%title%}', title);
        htmlContent = htmlContent.replace('{%meta%}', metaData);
        htmlContent = htmlContent.replace('{%posturl%}', 'http://huytd.github.io/posts/' + f.replace('.md', '.html'));

        //res.writeHead('Content-Type', 'text/html');
        res.write(htmlContent);
        res.end();
      }
    });
  }
}

module.exports = genPreview;
