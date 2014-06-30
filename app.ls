express = require 'express'
path = require 'path'
fs = require 'fs'
app = express()
exec = require('child_process').exec

app.use(express.static(path.join(__dirname, ''))) #  "public" off of current is root

#app.use(require('stylus').middleware(__dirname))

app.set 'view engine', 'jade'
app.set 'views', __dirname

app.locals.pretty = true

get_index = (req, res) ->
  res.render 'index', {}

app.get '/', get_index
app.get '/index.html', get_index

#app.get '/'


toSeconds = (time) ->
  if not time?
    return null
  if typeof time == 'number'
    return time
  if typeof time == 'string'
    timeParts = [parseInt(x) for x in time.split(':')]
    if timeParts.length == 0
      return null
    if timeParts.length == 1
      return timeParts[0]
    if timeParts.length == 2
      return timeParts[0]*60 + timeParts[1]
    if timeParts.legnth == 3
      return timeParts[0]*3600 + timeParts[1]*60 + timeParts[2]
  return null

servePng = (pngfile, res) ->
  img = fs.readFileSync(pngfile)
  res.writeHead(200, {'Content-Type': 'image/png'})
  res.end(img, 'binary')


makeSnapshot = (video, time, thumbnail_path, width, height, callback) ->
  command = 'avconv -ss ' + time + ' -i ' + video + ' -y -vframes 1 -s ' + width + 'x' + height + ' ' + thumbnail_path
  exec command, ->
    callback() if callback?

app.get '/thumbnail', (req, res) ->
  video = req.query.video
  time = toSeconds(req.query.time)
  width = parseInt(req.query.width)
  if not width? or isNaN(width)
    width = 400
  height = parseInt(req.query.height)
  if not height? or isNaN(height)
    height = 225
  if not video? or not time? or isNaN(time)
    res.send 'need video and time parameters'
  thumbnail_file = video + '_' + time + '_' + width + 'x' + height + '.png'
  thumbnail_path = 'thumbnails/' + thumbnail_file
  console.log thumbnail_path
  if fs.existsSync(thumbnail_path)
    servePng(thumbnail_path, res)
  else
    makeSnapshot video, time, thumbnail_path, width, height, ->
      servePng(thumbnail_path, res)

app.get '/overlay', (req, res) ->
  video = req.query.video
  time = toSeconds(req.query.time)
  width = parseInt(req.query.width)
  if not width? or isNaN(width)
    width = 400
  height = parseInt(req.query.height)
  if not height? or isNaN(height)
    height = 225
  if not video? or not time? or isNaN(time)
    res.send 'need video and time parameters'
  res.render 'overlay', {
    video: video
    time: time
    width: width
    height: height
  }

app.get '/mkoverlay', (req, res) ->
  video = req.query.video
  time = toSeconds(req.query.time)
  width = parseInt(req.query.width)
  if not width? or isNaN(width)
    width = 400
  height = parseInt(req.query.height)
  if not height? or isNaN(height)
    height = 225
  if not video? or not time? or isNaN(time)
    res.send 'need video and time parameters'
  res.render 'mkoverlay', {
    video: video
    time: time
    width: width
    height: height
  }

app.listen(8080, '0.0.0.0')
console.log('Listening on port 8080')

