/* GLOBALS
========================================================================== */
var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    jade = require('jade'),
    reddit = require('redwrap');


/* EXPRESS
========================================================================== */
app.use('/', express.static(__dirname + '/public'));

/* JADE
========================================================================== */
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.get('/r', function (req, res) {
  reddit.r('random', function(err, data, response){
    if (err) {
      res.send(err);
      console.log(err);
    }

    for (var i = 0; i < data.data.children.length; i++) {
      console.log(i);
      var gif = data.data.children[i].data.url;
      var preview = data.data.children[i].data.preview;
      var r = data.data.children[0].data.subreddit;
      
      if (gif.endsWith('.gif')) {
        res.render('index', { data: gif, r: r });
        break;
      } else if (typeof preview !== 'undefined') {
        res.render('index', { data: data.data.children[i].data.preview.images[0].source.url, r: r });
        break;
      } else if (i == data.data.children.length - 1) {
        res.send('No images found at r/' + r + '.');
        break;
      }
    };
  });
});

app.get('/json', function (req, res) {
  reddit.r('funny', function(err, data, response){
    res.send(data.data.children[0].data.subreddit);
  });
});

app.get('/api', function (req, res) {
  res.send('wokdeod');
});

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

console.log('Listening on port http://localhost:8000');
server.listen(8000, '0.0.0.0');