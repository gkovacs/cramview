(function(){
  var root, isInElement;
  root = typeof exports != 'undefined' && exports !== null ? exports : this;
  $(document).mousemove(function(evt){
    if (!isInElement(evt, $('#slide'))) {
      return;
    }
    return console.log(evt.clientX + ',' + evt.clientY);
  });
  $(document).mousedown(function(evt){
    if (!isInElement(evt, $('#slide'))) {
      return;
    }
    return console.log('mosuedown');
  });
  $(document).mouseup(function(evt){
    if (!isInElement(evt, $('#slide'))) {
      return;
    }
    return console.log('mouseup');
  });
  isInElement = function(evt, element){
    var isInX, ref$, isInY;
    isInX = element.offset().left <= (ref$ = evt.clientX) && ref$ <= element.offset().left + element.width();
    isInY = element.offset().top <= (ref$ = evt.clientY) && ref$ <= element.offset().top + element.height();
    return isInX && isInY;
  };
  $(document).ready(function(){
    var ox, oy, ow, oh;
    ox = root.overlayx * width / 100;
    oy = root.overlayy * height / 100;
    ow = root.overlayw * width / 100;
    oh = root.overlayh * height / 100;
    return $('#overlay').css('position', 'absolute').css('z-index', '3').css('background-color', 'blue').css('left', ox).css('top', oy).css('width', ow).css('height', oh);
  });
}).call(this);
