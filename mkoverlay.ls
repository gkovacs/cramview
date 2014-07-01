root = exports ? this

$(document).mousemove (evt) ->
  if not isInElement evt, $('#slide') or not root.isMouseDown
    return
  console.log evt.clientX + ',' + evt.clientY
  overlayw = evt.clientX - root.startX
  overlayh = evt.clientY - root.startY
  if overlayw > 0 and overlayh > 0
    $('#overlay').show()
    $('#overlay').show()
    $('#overlay').width(overlayw)
    $('#overlay').height(overlayh)
    xp = 100 * root.startX / root.width
    yp = 100 * root.startY / root.height
    wp = 100 * overlayw / root.width
    hp = 100 * overlayh / root.height
    urlparams = {
      width: root.width
      height: root.height
      overlayx: xp
      overlayy: yp
      overlayw: wp
      overlayh: hp
      video: video
      time: time
    }
    linkurl = 'overlay?' + $.param(urlparams)
    $('#urldisplay').text(linkurl).attr('href', linkurl)
  else
    $('#overlay').hide()
    $('#overlay').hide()
    $('#urldisplay').text('')

root.startX = 0
root.endX = 0

root.isMouseDown = false

$(document).mousedown (evt) ->
  root.isMouseDown = true
  if not isInElement evt, $('#slide')
    return
  evt.preventDefault()
  console.log 'mousedown'
  root.startX = evt.clientX
  root.startY = evt.clientY
  #$('#overlay').width(0)
  #$('#overlay').height(0)
  #$('#overlay').offset({left: root.startX, top: root.startY})
  $('#overlay').css {
    width: 0
    height: 0
    left: root.startX
    top: root.startY
  }

$(document).mouseup (evt) ->
  root.isMouseDown = false
  if not isInElement evt, $('#slide')
    return
  evt.preventDefault()
  console.log 'mouseup'

isInElement = (evt, element) ->
  isInX = element.offset().left <= evt.clientX <= element.offset().left + element.width()
  isInY = element.offset().top <= evt.clientY <= element.offset().top + element.height()
  #console.log 'isInX:' + isInX
  #console.log 'isInY:' + isInY
  #console.log element.offset().top + ',' + evt.clientY + ',' + (element.offset().top + element.height())
  return isInX and isInY

$(document).ready ->
  ox = root.overlayx * width / 100
  oy = root.overlayy * height / 100
  ow = root.overlayw * width / 100
  oh = root.overlayh * height / 100
  #$('#overlay').width(ow).height(oh).offset({left: ox, top: oy})
  $('#overlay').css {
    width: ow
    height: oh
    left: ox
    top: oy
  }
