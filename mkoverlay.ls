root = exports ? this

$(document).mousemove (evt) ->
  if not isInElement evt, $('#slide')
    return
  console.log evt.clientX + ',' + evt.clientY

$(document).mousedown (evt) ->
  if not isInElement evt, $('#slide')
    return
  console.log 'mosuedown'

$(document).mouseup (evt) ->
  if not isInElement evt, $('#slide')
    return
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
  $('#overlay').css('position', 'absolute').css('z-index', '3').css('background-color', 'blue').css('left', ox).css('top', oy).css('width', ow).css('height', oh)
