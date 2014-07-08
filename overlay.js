(function(){
  var root;
  root = typeof exports != 'undefined' && exports !== null ? exports : this;
  $(document).ready(function(){
    var ox, oy, ow, oh;
    ox = root.overlayx * width / 100.0;
    oy = root.overlayy * height / 100.0;
    ow = root.overlayw * width / 100.0;
    oh = root.overlayh * height / 100.0;
    return $('#overlay').css({
      width: ow,
      height: oh,
      left: ox,
      top: oy
    });
  });
}).call(this);
