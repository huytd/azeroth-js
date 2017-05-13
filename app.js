const fs = require('fs');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const preview = require('./preview');
const socketio = require('socket.io');

let currentSocket = null;

let logOptions = {
    weekday: "long", year: "numeric", month: "short",
    day: "numeric", hour: "2-digit", minute: "2-digit"
};

let yearList = ['2017', '2016', '2015'];

app.use(bodyParser());
app.use(express.static("admin"));
app.use(express.static("."));

app.get('/preview', function(req, res) {
  fs.watch(req.query.url, (event) => {
    console.log('Change detected');
    if (currentSocket) {
      currentSocket.emit('reload');
    }
  });

  preview(req.query.url, res);
});

app.get('/published', function (req, res) {
  let posts = require('./publish.json');
  if (!posts.years) {
    posts.years = yearList;
  }
  console.log('GET /published', (new Date()).toLocaleTimeString("en-US",logOptions));
  res.json(posts);
});

app.post('/update', function(req, res) {
  console.log('POST /update', (new Date()).toLocaleTimeString("en-US",logOptions));
  let saveData = { published: req.body.data };
  if (!saveData.years) {
    saveData.years = yearList;
  }
  fs.writeFile('./publish.json', JSON.stringify(saveData), function(err) {
    if (err) console.log("FAILED!", err);
    else console.log("UPDATE SUCCESS!");
    res.json({ error: err });
  });
});

app.get('/unpublished', function(req, res) {
  console.log('GET /unpublished', (new Date()).toLocaleTimeString("en-US",logOptions));
  let publishedPosts = Array.from(require('./publish.json').published);
  let posts = [];
  fs.readdir(__dirname + '/posts/', function(err, files) {
    if (err) return;
    files.forEach(function(f) {
      if (f.indexOf('.md') != -1) {
        let postUrl = 'posts/' + f.replace(/\.md/, '.html');
        let isPublished = publishedPosts.findIndex((e) => {
          return e.url === postUrl;
        });
        if (isPublished == -1) {
          let fileData = fs.readFileSync(__dirname + '/posts/' + f, { encoding: 'utf8' });
          if (fileData) {
            let lines = fileData.split('\n');
            if (lines.length > 0) {
              let title = lines[0].replace(/#/g, '').replace("\r\n", '').replace("\n", '').trim();
              posts.push({
                title: title,
                url: postUrl,
                year: "" + (new Date()).getFullYear()
              });
            }
          }
        }
      }
    });
    res.json({ unpublished: posts });
  });
});

console.log("Server is running at: http://localhost:3000");
let http = app.listen(3000);
let io = socketio(http);

io.on('connect', (socket) => {
  console.log('client connected');
  currentSocket = socket;
});
