root = exports ? this

$(document).ready ->
  ox = root.overlayx * width / 100
  oy = root.overlayy * height / 100
  ow = root.overlayw * width / 100
  oh = root.overlayh * height / 100
  $('#overlay').css('position', 'absolute').css('z-index', '3').css('background-color', 'blue').css('left', ox).css('top', oy).css('width', ow).css('height', oh)
