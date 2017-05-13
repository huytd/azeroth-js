var fs = require('fs');
var path = require('path');
var marked = require('./js/marked.js');

function getDirectories (srcpath) {
  return fs.readdirSync(srcpath)
    .filter(file => fs.statSync(path.join(srcpath, file)).isDirectory())
}

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

console.log('Loading template...');
templateHtml = fs.readFileSync('template.html', { encoding: 'utf8' });
console.log('Loading index template...');
indexTemplateHtml = fs.readFileSync('indexTemplate.html', { encoding: 'utf8' });

console.log(process.argv);

console.log('Generating static files...');
fs.readdir(__dirname + '/posts/', function(err, files) {
    if (err) return;
    files.forEach(function(f) {
        if (f.indexOf('.md') != -1) {
        	var htmlOutput = __dirname + '/posts/' + f.replace('.md', '.html');
	        var postContent = '';
	        var htmlContent = '';
	        var metaData = '';
	        fs.readFile(__dirname + '/posts/' + f, function (err, data) {
			  if (err)
			    throw err;
        console.log("Reading: ", f);
			  if (data) {
			  	var markdownPost = data.toString('utf8');
			  	var lines = markdownPost.split('\n');
			  	var title = '';
			  	if (lines.length > 0) {
			  		title = lines[0].replace(/#/g, '').replace("\r\n", '').replace("\n", '');
			  		if (lines[lines.length - 6].indexOf('<meta') == 0) {
			  			metaData = lines.slice(lines.length - 6).join('\n');
			  			markdownPost = markdownPost.split('\n');
			  			markdownPost.splice(markdownPost.length - 6);
			  			markdownPost = markdownPost.join('\n');
			  		}
			  	}          


        // Custom components
			  	markdownPost = markdownPost.replace(/<cover>/g, '<div class="cover" style="background-image:url(');
			  	markdownPost = markdownPost.replace(/<\/cover>/g, '"></div><div class="cover-holder"></div>');
			  	markdownPost = markdownPost.replace(/<math>/g, '<pre class="math">$$');
			  	markdownPost = markdownPost.replace(/<\/math>/g, '$$</pre>');
          markdownPost = markdownPost.replace(/--@TAGS.*\n/g, generateTags(markdownPost));

			  	postContent = marked(markdownPost);
			  	htmlContent = templateHtml.replace('{%content%}', postContent);
			  	htmlContent = htmlContent.replace('{%title%}', title);
			  	htmlContent = htmlContent.replace('{%meta%}', metaData);
			  	htmlContent = htmlContent.replace('{%posturl%}', 'http://huytd.github.io/posts/' + f.replace('.md', '.html'));
			  	htmlContent = htmlContent.replace('{%postslug%}', f.replace('.md', ''));

			  	fs.writeFile(htmlOutput, htmlContent, function (err) {
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

var subfolders = getDirectories(__dirname + '/posts/');
for (var i = 0; i < subfolders.length; i++) {
  if (!subfolders) return;
  if (subfolders[i] === 'img') continue;
  var currentSubFolder = subfolders[i];
  // Generate sub folders
  generateForSubFolder(currentSubFolder);
}

function generateTags(post) {
  let html = "";
  let matches = post.match(/--@TAGS:(.*)\n/i);
  if (matches) {
    let tags = matches[1].split(",");
    html = tags.reduce((str, tag) => {
      let t = tag.trim();
      if (t) {
        str += "<a class='topic-tag' href='https://huytd.github.io/tags/" + t + ".html'>" + t + "</a>";
      }
      return str;
    }, "<div class='other-tags'><b>Tags:</b> ") + "</div>";
  }
  return html;
}

function generateForSubFolder(currentSubFolder) {
  fs.readdir(__dirname + '/posts/' + currentSubFolder, function(err, files) {
    if (err) return;
    files.forEach(function(f) {
      if (f.indexOf('.md') != -1) {
        var htmlOutput = __dirname + '/posts/' + currentSubFolder + '/' + f.replace('.md', '.html');
        var postContent = '';
        var htmlContent = '';
        var metaData = '';
        fs.readFile(__dirname + '/posts/' + currentSubFolder + '/' + f, function (err, data) {
          if (err)
            throw err;
          console.log("Reading: ", f);
          if (data) {
            var markdownPost = data.toString('utf8');
            var lines = markdownPost.split('\n');
            var title = '';
            if (lines.length > 0) {
              title = lines[0].replace(/#/g, '').replace("\r\n", '').replace("\n", '');
              if (lines[lines.length - 6].indexOf('<meta') == 0) {
                metaData = lines.slice(lines.length - 6).join('\n');
                markdownPost = markdownPost.split('\n');
                markdownPost.splice(markdownPost.length - 6);
                markdownPost = markdownPost.join('\n');
              }
            }          


            // Custom components
            markdownPost = markdownPost.replace(/<cover>/g, '<div class="cover" style="background-image:url(');
            markdownPost = markdownPost.replace(/<\/cover>/g, '"></div><div class="cover-holder"></div>');
            markdownPost = markdownPost.replace(/<math>/g, '<pre class="math">$$');
            markdownPost = markdownPost.replace(/<\/math>/g, '$$</pre>');
            markdownPost = markdownPost.replace(/--@TAGS.*\n/g, generateTags(markdownPost));

            postContent = marked(markdownPost);
            htmlContent = templateHtml.replace('{%content%}', postContent);
            htmlContent = htmlContent.replace('{%title%}', title);
            htmlContent = htmlContent.replace('{%meta%}', metaData);
            htmlContent = htmlContent.replace('{%posturl%}', 'http://huytd.github.io/posts/' + f.replace('.md', '.html'));
            htmlContent = htmlContent.replace('{%postslug%}', f.replace('.md', ''));

            htmlContent = htmlContent.replace(/\.\.\//g, '../../');
            htmlContent = htmlContent.replace(/\.\.\/\.\.\/img/g, '../img');

            fs.writeFile(htmlOutput, htmlContent, function (err) {
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
}

console.log('Generating index page...');
var publishedPosts = Array.from(require('./publish.json').published);
var publishYears = Array.from(require('./publish.json').years);
var htmlOutput = __dirname + '/index.html';
var postContent = "";
var htmlContent = '';

console.log('Posts: ', publishedPosts.length, ' Years: ', publishYears.length);
for (var y = 0; y < publishYears.length; y++) {
  var year = publishYears[y];
  console.log('Processing year: ', year);
  postContent += "\n# " + year + "\n";
  var posts = publishedPosts.filter(function(item) {
    return parseInt(item.year) === parseInt(year);
  });
  console.log('Found', posts.length, 'posts!');
  for (var i = posts.length - 1; i >= 0; i--) {
    postContent += "\n&#8211; [" + posts[i].title  + "](" + posts[i].url + ")\n";
  }
}

htmlContent = indexTemplateHtml.replace('{%content%}', marked(postContent));
htmlContent = htmlContent.replace('{%title%}', 'Nơi tổng hợp những ghi chép linh tinh');
htmlContent = htmlContent.replace('{%meta%}', '');
htmlContent = htmlContent.replace('{%posturl%}', 'http://huytd.github.io');

fs.writeFile(htmlOutput, htmlContent, function (err) {
  if (err)
    throw err;
  else
    console.log('>>', htmlOutput);
});
