(function(){
  var express, path, fs, app, exec, get_index, toSeconds, spawn, callCommand, makeSegment, serverRootStatic, segmentVideo, makeSnapshot;
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
  spawn = require('child_process').spawn;
  fs = require('fs');
  callCommand = function(command, options, callback){
    var ffmpeg;
    ffmpeg = spawn(command, options);
    ffmpeg.stdout.on('data', function(data){
      return console.log('stdout:' + data);
    });
    ffmpeg.stderr.on('data', function(data){
      return console.log('stderr:' + data);
    });
    return ffmpeg.on('exit', function(code){
      console.log('exited with code:' + code);
      if (callback != null) {
        return callback();
      }
    });
  };
  makeSegment = function(video, start, end, output, callback){
    var extra_options, command, options;
    extra_options = [];
    if (output.indexOf('.webm') !== -1) {
      extra_options = ['-c:v', 'libvpx', '-b:v', '1M', '-c:a', 'libvorbis', '-cpu-used', '-5', '-deadline', 'realtime'];
    }
    if (output.indexOf('.mp4') !== -1) {
      extra_options = ['-codec:v', 'libx264', '-profile:v', 'high', '-preset', 'ultrafast', '-threads', '0', '-strict', '-2', '-codec:a', 'aac'];
    }
    command = './ffmpeg';
    options = ['-ss', start, '-t', end - start, '-i', video].concat(extra_options.concat(['-y', output]));
    return callCommand(command, options, callback);
  };
  serverRootStatic = 'http://10.172.99.34:80/';
  segmentVideo = function(req, res){
    var video, start, end, video_base, video_path, output_file, output_path;
    console.log('segmentvideo');
    video = req.query.video;
    start = req.query.start;
    end = req.query.end;
    video_base = video.split('.')[0];
    video_path = video;
    output_file = video_base + '_' + start + '_' + end + '.webm';
    output_path = 'static/' + output_file;
    if (fs.existsSync(output_path)) {
      console.log(serverRootStatic + output_path);
      return res.redirect(serverRootStatic + output_path);
    } else {
      return makeSegment(video_path, start, end, output_path, function(){
        return res.redirect(serverRootStatic + output_path);
      });
    }
  };
  app.get('/segmentvideo', segmentVideo);
  makeSnapshot = function(video, time, thumbnail_path, width, height, callback){
    var command;
    command = './ffmpeg -ss ' + time + ' -i ' + video + ' -y -vframes 1 -s ' + width + 'x' + height + ' ' + thumbnail_path;
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
      return res.sendfile(thumbnail_path);
    } else {
      return makeSnapshot(video, time, thumbnail_path, width, height, function(){
        return res.sendfile(thumbnail_path);
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
