/* GLOBALS
========================================================================== */
var express = require('express'),
    app = express(),
    http = require('http'),
    https = require('https'),
    server = http.createServer(app),
    jade = require('jade'),
    cron = require('cron'),
    fs = require('fs'),
    path = require('path'),
    url = require('url'),
    reddit = require('redwrap');


/* EXPRESS
========================================================================== */
app.use('/', express.static(__dirname + '/public'));



/* JADE
========================================================================== */
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');



/* ACTION
========================================================================== */
var getImage = cron.job("*/10 * * * * *", function(){
  reddit.r('random', function(err, data, response){
    if (err) throw err;

    for (var i = 0; i < data.data.children.length; i++) {
      var gif = data.data.children[i].data.url;
      var preview = data.data.children[i].data.preview;
      var r = data.data.children[0].data.subreddit;
      
      if (gif.endsWith('.gif')) {
        downloadImage(gif, r);
        break;
      } else if (typeof preview !== 'undefined') {
        downloadImage(preview.images[0].source.url, r);
        break;
      } else if (i == data.data.children.length - 1) {
        console.log('No images found at r/' + r + '.');
        break;
      }
    };
  });
});



/* API
========================================================================== */
app.get('/api/start', function (req, res) {
  getImage.start();
  res.send('<h1>API started.</h1>');
});

app.get('/api/end', function (req, res) {
  getImage.end();
  res.send('<h1>API ended.</h1>');
});

app.get('/', function (req, res) {
  var images = getFiles('public/images');
  res.render('index', { images: images });
});



/* FUNCTIONS
========================================================================== */
function downloadImage(img_url, subreddit) {
  if (stringStartsWith(img_url, 'https')) {
    protocol = https;
  } else {
    protocol = http;
  }
  var request = protocol.get(img_url, function(res){
      var imagedata = '';
      res.setEncoding('binary');

      res.on('data', function(chunk){
          imagedata += chunk;
      })

      res.on('end', function(){
          fs.writeFile('public/images/' + subreddit + path.extname(url.parse(img_url).pathname), imagedata, 'binary', function(err){
              if (err) throw err;
              console.log('File saved.');
          });
      });
  });
};

function getFiles (dir, files_){
    files_ = files_ || [];
    var files = fs.readdirSync(dir);
    for (var i in files){
        var name = dir + '/' + files[i];
        if (fs.statSync(name).isDirectory()){
            getFiles(name, files_);
        } else {
            files_.push({file: path.basename(name), sub: path.basename(name, path.extname(name)) });
        }
    }
    return files_;
}

function stringStartsWith (string, prefix) {
    return string.slice(0, prefix.length) == prefix;
}

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

/* SERVER
========================================================================== */
console.log('Listening on port http://localhost:8000');
server.listen(8000, '0.0.0.0');