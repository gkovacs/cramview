(function(){
  var root, isInElement;
  root = typeof exports != 'undefined' && exports !== null ? exports : this;
  $(document).mousemove(function(evt){
    var overlayw, overlayh, xp, yp, wp, hp, urlparams, linkurl;
    if (!isInElement(evt, $('#slide')) || !root.isMouseDown) {
      return;
    }
    console.log(evt.clientX + ',' + evt.clientY);
    overlayw = evt.clientX - root.startX;
    overlayh = evt.clientY - root.startY;
    if (overlayw > 0 && overlayh > 0) {
      $('#overlay').show();
      $('#overlay').show();
      $('#overlay').width(overlayw);
      $('#overlay').height(overlayh);
      xp = 100 * root.startX / root.width;
      yp = 100 * root.startY / root.height;
      wp = 100 * overlayw / root.width;
      hp = 100 * overlayh / root.height;
      urlparams = {
        width: root.width,
        height: root.height,
        overlayx: xp,
        overlayy: yp,
        overlayw: wp,
        overlayh: hp,
        video: video,
        time: time
      };
      linkurl = 'overlay?' + $.param(urlparams);
      return $('#urldisplay').text(linkurl).attr('href', linkurl);
    } else {
      $('#overlay').hide();
      $('#overlay').hide();
      return $('#urldisplay').text('');
    }
  });
  root.startX = 0;
  root.endX = 0;
  root.isMouseDown = false;
  $(document).mousedown(function(evt){
    root.isMouseDown = true;
    if (!isInElement(evt, $('#slide'))) {
      return;
    }
    evt.preventDefault();
    console.log('mousedown');
    root.startX = evt.clientX;
    root.startY = evt.clientY;
    return $('#overlay').css({
      width: 0,
      height: 0,
      left: root.startX,
      top: root.startY
    });
  });
  $(document).mouseup(function(evt){
    root.isMouseDown = false;
    if (!isInElement(evt, $('#slide'))) {
      return;
    }
    evt.preventDefault();
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
    return $('#overlay').css({
      width: ow,
      height: oh,
      left: ox,
      top: oy
    });
  });
}).call(this);
