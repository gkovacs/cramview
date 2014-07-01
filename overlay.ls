root = exports ? this

$(document).ready ->
  ox = root.overlayx * width / 100.0
  oy = root.overlayy * height / 100.0
  ow = root.overlayw * width / 100.0
  oh = root.overlayh * height / 100.0
  #$('#overlay').width(ow).height(oh).offset({left: ox, top: oy})
  $('#overlay').css {
    width: ow
    height: oh
    left: ox
    top: oy
  }
