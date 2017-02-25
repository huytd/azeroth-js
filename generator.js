var fs = require('fs'),
  marked = require('./js/marked.js');

marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false, // IMPORTANT, because we do MathJax before markdown,
                   //           however we do escaping in 'CreatePreview'.
  smartLists: true,
  smartypants: false
});

var templateHtml = '';
fs.readFile('template.html', (err, data) => {
  if (err)
    throw err;
  if (data)
    templateHtml = data.toString('utf8');
});

fs.readdir(__dirname + '/posts/', (err, files) => {
  if (err) return;
  files.forEach(f => {
    if (f.indexOf('.md') > -1 && f != 'home.md') {
      //- [Markdown Test Page](#lorem-ipsum)
      fs.readFile(__dirname + '/posts/' + f, 'utf8', (err, data) => {
        if (err) throw err;
        let firstLine = data.split("\n")[0], // READ FIRST LINE
          title = firstLine.slice(2, firstLine.length - 1), // REMOVE "# " and "\n"
          markAnchor = '- [' + title + '](#' + f + ')';

        fs.appendFile('routes.md', markAnchor + "\n", err => {
          if (err) throw err;
          console.log(markAnchor + ' is saved in routes.md');
        });

      });
    }
  });
});


fs.readdir(__dirname + '/posts/', (err, files) => {
  if (err) return;
  files.forEach(f => {
    if (f.indexOf('.md') > -1) {
      let htmlOutput = __dirname + '/posts/' + f.replace('.md', '.html'),
        postContent = '',
        htmlContent = '',
        metaData = '';

      fs.readFile(__dirname + '/posts/' + f, (err, data) => {
        if (err)
          throw err;
        if (data) {
          let markdownPost = data.toString('utf8'),
            lines = markdownPost.split('\n'),
            title = '';
          
          if (lines.length > 0) {
            title = lines[0].replace(/#/g, '').replace("\r\n", '').replace("\n", '');
            if (lines.length > 6 && lines[lines.length - 6].indexOf('<meta') === 0) {
              metaData = lines.slice(lines.length - 6).join('\n');
              markdownPost = markdownPost.split('\n');
              markdownPost.splice(markdownPost.length - 6);
              markdownPost = markdownPost.join('\n');
            }
          }
          postContent = marked(markdownPost);
          htmlContent = templateHtml.replace('{%content%}', postContent);
          htmlContent = htmlContent.replace('{%title%}', title);
          htmlContent = htmlContent.replace('{%meta%}', metaData);
          fs.writeFile(htmlOutput, htmlContent, err => {
            if (err)
              throw err;
            else
              console.log('>>', htmlOutput);
          });
        }
      });
    }
  });
});
