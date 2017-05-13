const fs = require('fs');

let tagIndex = [];

fs.readdir(__dirname + '/posts/', function(err, files) {
  if (err) return;
  files.forEach(function(f) {
    if (f.indexOf('.md') != -1) {
      let contentBuffer = fs.readFileSync(__dirname + '/posts/' + f);
      let content = String(contentBuffer, 'utf8');
      let titleMatcher = content.match(/# (.*)\n/i);
      let matches = content.match(/--@TAGS:(.*)\n/i);
      if (titleMatcher && matches) {
        let title = titleMatcher[1];
        let keywords = matches[1].split(',');
        keywords.forEach((key) => {
          let keyword = key.trim();
          if (!tagIndex[keyword]) {
            tagIndex[keyword] = [];
          }
          let content = title + "%%%" + f;
          if (tagIndex[keyword].indexOf(content) === -1) {
            tagIndex[keyword].push(content);
          }
        });
      }
    }
  });

  console.log('Result', tagIndex);
  let keys = Object.keys(tagIndex);
  let templateBuffer = fs.readFileSync('./indexTemplate.html');
  let templateSrc = String(templateBuffer, 'utf8');
  let otherTags = "<h1>Browse more topics</h1>" + keys.reduce((str, tag) => {
    str += "<a class='topic-tag' href='https://huytd.github.io/tags/" + tag + ".html'>" + tag + "</a>";
    return str;
  }, "<div class='other-tags'>") + "</div>";

  keys.forEach((key) => {
    let posts = tagIndex[key];

    let urls = posts.reduce((str, post) => {
      let title = post.split('%%%')[0];
      let fn = post.split('%%%')[1];
      let url = "https://huytd.github.io/posts/" + fn.replace(".md", ".html");
      str += "<li><a href='" + url + "'>" + title + "</a></li>";
      return str;
    }, "<ul>") + "</ul>";

    let html = templateSrc + "";
    html = html.replace("{%title%}", key);
    html = html.replace("{%meta%}", '');

    html = html.replace(/"css/g, '"../css');
    html = html.replace(/"js/g, '"../js');

    let links = "<h1>" + key + "</h1>" + urls + "<br/>" + otherTags;
    html = html.replace("{%content%}", links);

    fs.writeFileSync("./tags/" + key + ".html", html);
  });
});

