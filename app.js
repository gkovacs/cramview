(function(){
  var express, path, fs, app, exec, get_index, toSeconds, servePng, makeSnapshot;
  express = require('express');
  path = require('path');
  fs = require('fs');
  app = express();
  exec = require('child_process').exec;
  app.use(express['static'](path.join(__dirname, '')));
  app.set('view engine', 'jade');
  app.set('views', __dirname);
  app.locals.pretty = true;
  get_index = function(req, res){
    return res.render('index', {});
  };
  app.get('/', get_index);
  app.get('/index.html', get_index);
  toSeconds = function(time){
    var timeParts, res$, i$, ref$, len$, x;
    if (time == null) {
      return null;
    }
    if (typeof time === 'number') {
      return time;
    }
    if (typeof time === 'string') {
      res$ = [];
      for (i$ = 0, len$ = (ref$ = time.split(':')).length; i$ < len$; ++i$) {
        x = ref$[i$];
        res$.push(parseInt(x));
      }
      timeParts = res$;
      if (timeParts.length === 0) {
        return null;
      }
      if (timeParts.length === 1) {
        return timeParts[0];
      }
      if (timeParts.length === 2) {
        return timeParts[0] * 60 + timeParts[1];
      }
      if (timeParts.legnth === 3) {
        return timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
      }
    }
    return null;
  };
  servePng = function(pngfile, res){
    var img;
    img = fs.readFileSync(pngfile);
    res.writeHead(200, {
      'Content-Type': 'image/png'
    });
    return res.end(img, 'binary');
  };
  makeSnapshot = function(video, time, thumbnail_path, width, height, callback){
    var command;
    command = 'avconv -ss ' + time + ' -i ' + video + ' -y -vframes 1 -s ' + width + 'x' + height + ' ' + thumbnail_path;
    return exec(command, function(){
      if (callback != null) {
        return callback();
      }
    });
  };
  app.get('/thumbnail', function(req, res){
    var video, time, width, height, thumbnail_file, thumbnail_path;
    video = req.query.video;
    time = toSeconds(req.query.time);
    width = parseInt(req.query.width);
    if (width == null || isNaN(width)) {
      width = 400;
    }
    height = parseInt(req.query.height);
    if (height == null || isNaN(height)) {
      height = 450;
    }
    if (video == null || time == null || isNaN(time)) {
      res.send('need video and time parameters');
    }
    thumbnail_file = video + '_' + time + '_' + width + 'x' + height + '.png';
    thumbnail_path = 'thumbnails/' + thumbnail_file;
    console.log(thumbnail_path);
    if (fs.existsSync(thumbnail_path)) {
      return servePng(thumbnail_path, res);
    } else {
      return makeSnapshot(video, time, thumbnail_path, width, height, function(){
        return servePng(thumbnail_path, res);
      });
    }
  });
  app.get('/overlay', function(req, res){
    var video, time, width, height, overlayx, overlayy, overlayw, overlayh;
    video = req.query.video;
    time = toSeconds(req.query.time);
    width = parseFloat(req.query.width);
    if (width == null || isNaN(width)) {
      width = 800;
    }
    height = parseFloat(req.query.height);
    if (height == null || isNaN(height)) {
      height = 450;
    }
    if (video == null || time == null || isNaN(time)) {
      res.send('need video and time parameters');
    }
    overlayx = parseFloat(req.query.overlayx);
    if (overlayx == null || isNaN(overlayx)) {
      res.send('need overlayx parameter');
    }
    overlayy = parseFloat(req.query.overlayy);
    if (overlayy == null || isNaN(overlayy)) {
      res.send('need overlayy parameter');
    }
    overlayw = parseFloat(req.query.overlayw);
    if (overlayw == null || isNaN(overlayw)) {
      res.send('need overlayw parameter');
    }
    overlayh = parseFloat(req.query.overlayh);
    if (overlayh == null || isNaN(overlayh)) {
      res.send('need overlayh parameter');
    }
    return res.render('overlay', {
      video: video,
      time: time,
      width: width,
      height: height,
      overlayx: overlayx,
      overlayy: overlayy,
      overlayw: overlayw,
      overlayh: overlayh
    });
  });
  app.get('/mkoverlay', function(req, res){
    var video, time, width, height;
    video = req.query.video;
    time = toSeconds(req.query.time);
    width = parseFloat(req.query.width);
    if (width == null || isNaN(width)) {
      width = 800;
    }
    height = parseFloat(req.query.height);
    if (height == null || isNaN(height)) {
      height = 450;
    }
    if (video == null || time == null || isNaN(time)) {
      res.send('need video and time parameters');
    }
    return res.render('mkoverlay', {
      video: video,
      time: time,
      width: width,
      height: height
    });
  });
  app.listen(8080, '0.0.0.0');
  console.log('Listening on port 8080');
}).call(this);
