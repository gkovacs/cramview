(function(){
  var root, toSeconds, processAnnotations, isInElement, getSectionByIdx, getSlideByIdx, getSectionIdxByTime, getSlideIdxByTime, setThumbnailEmpty, setThumbnailWhiteNoBorder, setSeekThumbnailEmpty, setThumbnailNoBorder, setReviewThumbnailsToSectionIdx, setPreviewThumbnailsToSectionIdx, setThumbnail, setSeekThumbnail, setSeekThumbnailsToSectionIdx, getCssWidth, getScrollbarWidth, addTicksToProgressBar, markViewedSegments, getFractionHoverInScrollbar, setSeekProgressTickToFraction, setProgressTickToFraction, isPlaying, setPlaying, setVideoTime, getVideoTime, getVideoFraction, showReview, showPreview, hideReview, hidePreview, showingReview, showingPreview, setReviewCountdown, setPreviewCountdown, seekTo, continueClicked, watchClicked, togglePlay, getWatchedSegments, setupViewer, getUrlParameters;
  root = typeof exports != 'undefined' && exports !== null ? exports : this;
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
  processAnnotations = function(data){
    var output, i$, len$, child;
    output = [];
    for (i$ = 0, len$ = data.length; i$ < len$; ++i$) {
      child = data[i$];
      if (child.start != null) {
        child.start = toSeconds(child.start);
      }
      if (child.end != null) {
        child.end = toSeconds(child.end);
      }
      if (child.thumbnail_time != null) {
        child.thumbnail_time = toSeconds(child.thumbnail_time);
      }
      if (child.slides != null) {
        child.slides = processAnnotations(child.slides);
      }
      output.push(child);
    }
    return output;
  };
  root.annotations = null;
  isInElement = function(evt, element){
    var isInX, ref$, isInY;
    isInX = element.offset().left <= (ref$ = evt.clientX) && ref$ <= element.offset().left + element.width();
    isInY = element.offset().top <= (ref$ = evt.clientY) && ref$ <= element.offset().top + element.height();
    return isInX && isInY;
  };
  root.annotations = null;
  getSectionByIdx = function(idx){
    return root.annotations[idx];
  };
  getSlideByIdx = function(idx){
    var slide_idx, i$, ref$, len$, section, j$, ref1$, len1$, slide;
    slide_idx = 0;
    for (i$ = 0, len$ = (ref$ = root.annotations).length; i$ < len$; ++i$) {
      section = ref$[i$];
      for (j$ = 0, len1$ = (ref1$ = section.slides).length; j$ < len1$; ++j$) {
        slide = ref1$[j$];
        if (slide_idx === idx) {
          return slide;
        }
        slide_idx += 1;
      }
    }
  };
  getSectionIdxByTime = function(time){
    var i$, ref$, len$, idx, section;
    for (i$ = 0, len$ = (ref$ = root.annotations).length; i$ < len$; ++i$) {
      idx = i$;
      section = ref$[i$];
      if (section.start <= time && time <= section.end) {
        return idx;
      }
    }
    return 0;
  };
  getSlideIdxByTime = function(time){
    var slide_idx, i$, ref$, len$, section, j$, ref1$, len1$, slide;
    slide_idx = 0;
    for (i$ = 0, len$ = (ref$ = root.annotations).length; i$ < len$; ++i$) {
      section = ref$[i$];
      for (j$ = 0, len1$ = (ref1$ = section.slides).length; j$ < len1$; ++j$) {
        slide = ref1$[j$];
        if (slide.start <= time && time <= slide.thumbnail_time) {
          return slide_idx;
        }
        slide_idx += 1;
      }
    }
    return 0;
  };
  setThumbnailEmpty = function(thumbnail){
    thumbnail.attr('src', '/black_thumbnail.png');
    return thumbnail.css('border', 'solid 3px black');
  };
  setThumbnailWhiteNoBorder = function(thumbnail){
    return thumbnail.attr('src', '/white_thumbnail.png');
  };
  setSeekThumbnailEmpty = function(thumbnail_idx){
    var thumbnail;
    thumbnail = $('#thumbnail_' + thumbnail_idx);
    return setThumbnailEmpty(thumbnail);
  };
  setThumbnailNoBorder = function(thumbnail, time){
    var thumbnail_src;
    thumbnail_src = '/thumbnail?' + $.param({
      video: root.video_file,
      time: Math.round(time),
      width: 640,
      height: 360
    });
    thumbnail.attr('src', thumbnail_src);
    return thumbnail.css('border', 'solid 3px black').css('border-radius', '3px');
  };
  setReviewThumbnailsToSectionIdx = function(section_idx){
    var section_metadata, i$, ref$, len$, idx, slide, thumbnail_time, results$ = [];
    section_metadata = getSectionByIdx(section_idx);
    for (i$ = 0, len$ = (ref$ = section_metadata.slides).length; i$ < len$; ++i$) {
      idx = i$;
      slide = ref$[i$];
      thumbnail_time = slide.thumbnail_time;
      setThumbnailNoBorder($('#review_thumbnail_' + idx), thumbnail_time);
    }
    for (i$ = 0, len$ = (ref$ = (fn$())).length; i$ < len$; ++i$) {
      idx = ref$[i$];
      results$.push(setThumbnailWhiteNoBorder($('#review_thumbnail_' + idx)));
    }
    return results$;
    function fn$(){
      var i$, results$ = [];
      for (i$ = section_metadata.slides.length; i$ < 2; ++i$) {
        results$.push(i$);
      }
      return results$;
    }
  };
  setPreviewThumbnailsToSectionIdx = function(section_idx){
    var section_metadata, i$, ref$, len$, idx, slide, thumbnail_time, results$ = [];
    section_metadata = getSectionByIdx(section_idx);
    for (i$ = 0, len$ = (ref$ = section_metadata.slides).length; i$ < len$; ++i$) {
      idx = i$;
      slide = ref$[i$];
      thumbnail_time = slide.thumbnail_time;
      setThumbnailNoBorder($('#preview_thumbnail_' + idx), thumbnail_time);
    }
    for (i$ = 0, len$ = (ref$ = (fn$())).length; i$ < len$; ++i$) {
      idx = ref$[i$];
      results$.push(setThumbnailWhiteNoBorder($('#preview_thumbnail_' + idx)));
    }
    return results$;
    function fn$(){
      var i$, results$ = [];
      for (i$ = section_metadata.slides.length; i$ < 2; ++i$) {
        results$.push(i$);
      }
      return results$;
    }
  };
  setThumbnail = function(thumbnail, time, highlight){
    var thumbnail_src;
    thumbnail_src = '/thumbnail?' + $.param({
      video: root.video_file,
      time: Math.round(time)
    });
    thumbnail.attr('src', thumbnail_src);
    if (highlight) {
      return thumbnail.css('border', 'solid 3px yellow').css('border-radius', '3px');
    } else {
      return thumbnail.css('border', 'solid 3px black').css('border-radius', '3px');
    }
  };
  setSeekThumbnail = function(thumbnail_idx, time, highlight){
    var thumbnail;
    thumbnail = $('#thumbnail_' + thumbnail_idx);
    return setThumbnail(thumbnail, time, highlight);
  };
  setSeekThumbnailsToSectionIdx = function(section_idx, current_time){
    var section_metadata, i$, ref$, len$, idx, slide, thumbnail_time, highlight, results$ = [];
    $('#thumbnails').attr('section_idx', section_idx);
    section_metadata = getSectionByIdx(section_idx);
    for (i$ = 0, len$ = (ref$ = section_metadata.slides).length; i$ < len$; ++i$) {
      idx = i$;
      slide = ref$[i$];
      thumbnail_time = slide.thumbnail_time;
      highlight = false;
      if (slide.start <= current_time && current_time <= slide.end) {
        thumbnail_time = current_time;
        highlight = true;
      }
      setSeekThumbnail(idx, thumbnail_time, highlight);
    }
    for (i$ = 0, len$ = (ref$ = (fn$())).length; i$ < len$; ++i$) {
      idx = ref$[i$];
      results$.push(setSeekThumbnailEmpty(idx));
    }
    return results$;
    function fn$(){
      var i$, results$ = [];
      for (i$ = section_metadata.slides.length; i$ < 2; ++i$) {
        results$.push(i$);
      }
      return results$;
    }
  };
  getCssWidth = function(elem){
    return elem.css('width').split('px').join('');
  };
  getScrollbarWidth = function(){
    return parseInt(getCssWidth($('#scrollbar')));
  };
  addTicksToProgressBar = function(){
    var addMarker, i$, ref$, len$, idx, section, fraction, results$ = [];
    addMarker = function(idx, fraction){
      var marker;
      $('#scrollbar').append('<div id="section_progress_marker_' + idx + '">');
      marker = $('#section_progress_marker_' + idx);
      return marker.addClass('sectionProgressBarMarker').attr('fraction', fraction).attr('section_idx', idx).css('left', getScrollbarWidth() * fraction - getCssWidth(marker) / 2);
    };
    for (i$ = 0, len$ = (ref$ = root.annotations).length; i$ < len$; ++i$) {
      idx = i$;
      section = ref$[i$];
      fraction = section.start / root.videoDuration;
      results$.push(addMarker(idx, fraction));
    }
    return results$;
  };
  markViewedSegments = root.markViewedSegments = function(){
    var addViewedMarker, updateViewedMarker, i$, ref$, len$, idx, segment, segment_start, segment_end, existing_marker, results$ = [];
    addViewedMarker = function(idx, fraction_start, fraction_end){
      $('#historybar').append('<div id="watched_marker_' + idx + '" class="watchedMarker" section_idx="' + idx + '">');
      return updateViewedMarker($('#watched_marker_' + idx), fraction_start, fraction_end);
    };
    updateViewedMarker = function(marker, fraction_start, fraction_end){
      console.log('updateViewedMarker');
      return marker.attr('fraction_start', fraction_start).attr('fraction_end', fraction_end).css('left', getScrollbarWidth() * fraction_start).css('width', getScrollbarWidth() * (fraction_end - fraction_start));
    };
    for (i$ = 0, len$ = (ref$ = getWatchedSegments()).length; i$ < len$; ++i$) {
      idx = i$;
      segment = ref$[i$];
      segment_start = segment[0], segment_end = segment[1];
      segment_start = segment_start / root.videoDuration;
      segment_end = segment_end / root.videoDuration;
      existing_marker = $('#watched_marker_' + idx);
      if (existing_marker.length > 0) {
        results$.push(updateViewedMarker(existing_marker, segment_start, segment_end));
      } else {
        results$.push(addViewedMarker(idx, segment_start, segment_end));
      }
    }
    return results$;
  };
  root.videoDuration = null;
  getFractionHoverInScrollbar = function(evt){
    return evt.offsetX / getScrollbarWidth();
  };
  setSeekProgressTickToFraction = function(fraction){
    return $('#seekprogresstick').css('left', fraction * getScrollbarWidth() - getCssWidth($('#seekprogresstick')) / 2);
  };
  setProgressTickToFraction = function(fraction){
    return $('#progresstick').css('left', fraction * getScrollbarWidth() - getCssWidth($('#progresstick')) / 2);
  };
  isPlaying = function(){
    return !$('#viewer')[0].paused;
  };
  setPlaying = function(isplaying){
    if (isplaying) {
      $('#playpause').attr('src', 'pause.png');
      return $('#viewer')[0].play();
    } else {
      $('#playpause').attr('src', 'play.png');
      return $('#viewer')[0].pause();
    }
  };
  setVideoTime = function(time){
    return $('#viewer')[0].currentTime = time;
  };
  getVideoTime = function(){
    return $('#viewer')[0].currentTime;
  };
  getVideoFraction = function(){
    return getVideoTime() / root.videoDuration;
  };
  root.current_section_idx = 0;
  root.review_start_time = 0;
  root.review_end_time = 0;
  root.preview_start_time = 0;
  root.preview_end_time = 0;
  showReview = root.showReview = function(section_idx){
    var section;
    if (section_idx == null) {
      console.log('need section_idx');
      return;
    }
    if (root.current_section_idx === section_idx && $('#review_area').is(':visible')) {
      return;
    }
    setPlaying(false);
    root.current_section_idx = section_idx;
    root.review_start_time = new Date().getTime() / 1000.0;
    root.review_end_time = root.review_start_time + 15.0;
    $('#continue_button').text($('#continue_button').attr('buttontext'));
    section = getSectionByIdx(section_idx);
    setVideoTime(section.end);
    $('#review_area').show();
    $('#reviewquestion').text(section.summary);
    return setReviewThumbnailsToSectionIdx(section_idx);
  };
  showPreview = root.showPreview = function(section_idx){
    var section;
    if (section_idx == null) {
      console.log('need section_idx');
      return;
    }
    if (root.current_section_idx === section_idx && $('#preview_area').is(':visible')) {
      return;
    }
    section = getSectionByIdx(section_idx);
    if (section == null) {
      return;
    }
    console.log('showpreview');
    setPlaying(false);
    root.current_section_idx = section_idx;
    root.preview_start_time = new Date().getTime() / 1000.0;
    root.preview_end_time = root.preview_start_time + 15.0;
    $('#watch_button').text($('#watch_button').attr('buttontext'));
    setVideoTime(section.start);
    $('#preview_area').show();
    $('#previewquestion').text(section.summary);
    setPreviewThumbnailsToSectionIdx(section_idx);
    if (section_idx === root.annotations.length - 1) {
      return $('#skip_button').hide();
    } else {
      return $('#skip_button').show();
    }
  };
  hideReview = function(){
    root.review_start_time = 0;
    root.review_end_time = 0;
    return $('#review_area').hide();
  };
  hidePreview = function(){
    root.preview_start_time = 0;
    root.preview_end_time = 0;
    return $('#preview_area').hide();
  };
  showingReview = function(){
    return $('#review_area').is(':visible');
  };
  showingPreview = function(){
    return $('#preview_area').is(':visible');
  };
  setReviewCountdown = function(){
    var curtime, time_until_end, time_until_end_str;
    curtime = new Date().getTime() / 1000.0;
    time_until_end = root.review_end_time - curtime;
    time_until_end_str = Math.round(time_until_end).toString();
    if (time_until_end_str.length === 1) {
      time_until_end_str = '0' + time_until_end_str;
    }
    $('#continue_button').text($('#continue_button').attr('buttontext') + ' (' + time_until_end_str + ')');
    $('#continue_button').css('width', Math.max(parseInt($('#continue_button').css('width')), $('#continue_button').outerWidth()));
  };
  setPreviewCountdown = function(){
    var curtime, time_until_end, time_until_end_str;
    curtime = new Date().getTime() / 1000.0;
    time_until_end = root.preview_end_time - curtime;
    time_until_end_str = Math.round(time_until_end).toString();
    if (time_until_end_str.length === 1) {
      time_until_end_str = '0' + time_until_end_str;
    }
    $('#watch_button').text($('#watch_button').attr('buttontext') + ' (' + time_until_end_str + ')');
    $('#watch_button').css('width', Math.max(parseInt($('#watch_button').css('width')), $('#watch_button').outerWidth()));
  };
  root.automaticSeeking = false;
  seekTo = function(time){
    var fraction;
    root.automaticSeeking = true;
    root.current_section_idx = getSectionIdxByTime(time);
    setVideoTime(time);
    fraction = time / root.videoDuration;
    setProgressTickToFraction(fraction);
    hideReview();
    hidePreview();
    return root.automaticSeeking = false;
  };
  continueClicked = function(){
    root.automaticSeeking = true;
    console.log('continue button clicked');
    hideReview();
    root.current_section_idx = getSectionIdxByTime(getVideoTime() + 1.0);
    showPreview(root.current_section_idx);
    return root.automaticSeeking = false;
  };
  watchClicked = function(){
    $('#preview_area').hide();
    return setPlaying(true);
  };
  togglePlay = function(){
    if (showingReview()) {
      return continueClicked();
    } else if (showingPreview()) {
      return watchClicked();
    } else if (isPlaying()) {
      return setPlaying(false);
    } else {
      return setPlaying(true);
    }
  };
  root.watched = null;
  getWatchedSegments = root.getWatchedSegments = function(){
    var output, start, i$, ref$, len$, i, elem;
    output = [];
    start = -1;
    for (i$ = 0, len$ = (ref$ = root.watched).length; i$ < len$; ++i$) {
      i = i$;
      elem = ref$[i$];
      if (start !== -1) {
        if (!elem) {
          if (i - start >= 4) {
            output.push([start, i]);
          }
          start = -1;
        }
      } else {
        if (elem) {
          start = i;
        }
      }
    }
    return output;
  };
  setupViewer = function(){
    var res$, i$, ref$, len$, i;
    res$ = [];
    for (i$ = 0, len$ = (ref$ = (fn$())).length; i$ < len$; ++i$) {
      i = ref$[i$];
      res$.push(false);
    }
    root.watched = res$;
    addTicksToProgressBar();
    $('#rewatch_button').click(function(){
      var section;
      root.automaticSeeking = true;
      console.log('rewatch button clicked');
      hideReview();
      section = getSectionByIdx(root.current_section_idx);
      setVideoTime(section.start);
      setPlaying(true);
      return root.automaticSeeking = false;
    });
    $('#continue_button').click(function(){
      return continueClicked();
    });
    $('#watch_button').click(function(){
      return watchClicked();
    });
    $('#skip_button').click(function(){
      var section;
      root.automaticSeeking = true;
      setPlaying(false);
      hidePreview();
      if (root.current_section_idx + 1 >= root.annotations.length) {
        setPlaying(true);
        root.automaticSeeking = false;
        return;
      }
      root.current_section_idx += 1;
      section = getSectionByIdx(root.current_section_idx);
      setVideoTime(section.start);
      root.automaticSeeking = false;
      return showPreview(root.current_section_idx);
    });
    setInterval(function(){
      return markViewedSegments();
    }, 1000);
    setInterval(function(){
      var videoTime, fraction;
      videoTime = getVideoTime();
      root.watched[Math.round(videoTime)] = true;
      if (root.automaticSeeking) {
        return;
      }
      fraction = videoTime / root.videoDuration;
      return setProgressTickToFraction(fraction);
    }, 100);
    $('#playpause').click(function(evt){
      return togglePlay();
    });
    $('#scrollbar').click(function(evt){
      var fraction, at_boundary, section_idx, i$, ref$, len$, progress_marker, marker_fraction, marker_section, time_in_video;
      fraction = getFractionHoverInScrollbar(evt);
      at_boundary = false;
      section_idx = -1;
      for (i$ = 0, len$ = (ref$ = $('.sectionProgressBarMarker')).length; i$ < len$; ++i$) {
        progress_marker = ref$[i$];
        marker_fraction = parseFloat($(progress_marker).attr('fraction'));
        marker_section = parseInt($(progress_marker).attr('section_idx'));
        if (marker_fraction - 0.01 <= fraction && fraction <= marker_fraction + 0.01) {
          fraction = marker_fraction;
          section_idx = marker_section;
          at_boundary = true;
        }
      }
      if (false) {
        return showPreview(section_idx);
      } else {
        time_in_video = root.videoDuration * fraction;
        root.current_section_idx = getSectionIdxByTime(time_in_video);
        $('#viewer')[0].currentTime = time_in_video;
        hideReview();
        hidePreview();
        return setPlaying(true);
      }
    });
    $('#historybar').click(function(evt){
      var fraction, i$, ref$, len$, watched_marker, marker_fraction, time_in_video;
      fraction = getFractionHoverInScrollbar(evt);
      for (i$ = 0, len$ = (ref$ = $('.watchedMarker')).length; i$ < len$; ++i$) {
        watched_marker = ref$[i$];
        marker_fraction = parseFloat($(watched_marker).attr('fraction_end'));
        if (marker_fraction - 0.005 <= fraction && fraction <= marker_fraction + 0.005) {
          fraction = marker_fraction - 0.001;
        }
      }
      time_in_video = root.videoDuration * fraction;
      root.current_section_idx = getSectionIdxByTime(time_in_video);
      $('#viewer')[0].currentTime = time_in_video;
      hideReview();
      hidePreview();
      return setPlaying(true);
    });
    $('#scrollbar').mousemove(function(evt){
      var fraction, i$, ref$, len$, progress_marker, marker_fraction, time_in_video, section_idx, section_metadata;
      fraction = getFractionHoverInScrollbar(evt);
      for (i$ = 0, len$ = (ref$ = $('.sectionProgressBarMarker')).length; i$ < len$; ++i$) {
        progress_marker = ref$[i$];
        marker_fraction = parseFloat($(progress_marker).attr('fraction'));
        if (marker_fraction - 0.005 <= fraction && fraction <= marker_fraction + 0.005) {
          fraction = marker_fraction;
        }
      }
      time_in_video = root.videoDuration * fraction;
      section_idx = getSectionIdxByTime(time_in_video);
      section_metadata = getSectionByIdx(section_idx);
      $('#questionbar').text(section_metadata.summary);
      $('#questionbar').show();
      $('#thumbnails').show();
      setSeekThumbnailsToSectionIdx(section_idx, time_in_video);
      return setSeekProgressTickToFraction(fraction);
    });
    $('#historybar').mousemove(function(evt){
      var fraction, i$, ref$, len$, watched_marker, marker_fraction, time_in_video, section_idx, section_metadata;
      console.log('historybar');
      fraction = getFractionHoverInScrollbar(evt);
      for (i$ = 0, len$ = (ref$ = $('.watchedMarker')).length; i$ < len$; ++i$) {
        watched_marker = ref$[i$];
        marker_fraction = parseFloat($(watched_marker).attr('fraction_end'));
        if (marker_fraction - 0.005 <= fraction && fraction <= marker_fraction + 0.005) {
          fraction = marker_fraction - 0.001;
        }
      }
      time_in_video = root.videoDuration * fraction;
      section_idx = getSectionIdxByTime(time_in_video);
      section_metadata = getSectionByIdx(section_idx);
      $('#questionbar').text(section_metadata.summary);
      $('#questionbar').show();
      $('#thumbnails').show();
      setSeekThumbnailsToSectionIdx(section_idx, time_in_video);
      return setSeekProgressTickToFraction(fraction);
    });
    $(document).mousemove(function(evt){
      if (isInElement(evt, $('#scrollbar')) || isInElement(evt, $('#historybar'))) {
        $('#questionbar').show();
        return $('#seekprogresstick').show();
      } else {
        if (false) {
          return $('#seekprogresstick').hide();
        } else {
          $('#questionbar').hide();
          $('#thumbnails').hide();
          return $('#seekprogresstick').hide();
        }
      }
    });
    return $(document).keydown(function(evt){
      var key;
      console.log(evt.which);
      key = evt.which;
      if (key === 13) {
        if (showingReview()) {
          continueClicked();
        } else if (showingPreview()) {
          watchClicked();
        }
      }
      if (key === 32) {
        togglePlay();
      }
      if (key === 37) {
        seekTo(getVideoTime() - 5);
      }
      if (key === 39) {
        return seekTo(getVideoTime() + 5);
      }
    });
    function fn$(){
      var i$, to$, results$ = [];
      for (i$ = 0, to$ = Math.round(root.videoDuration + 0.5); i$ <= to$; ++i$) {
        results$.push(i$);
      }
      return results$;
    }
  };
  root.video_file = null;
  getUrlParameters = function(){
    var output, parts;
    output = {};
    parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value){
      return output[key] = decodeURI(value);
    });
    return output;
  };
  $(document).ready(function(){
    var params, video_file, metadata_file;
    params = getUrlParameters();
    video_file = '3-1.mp4';
    if (params.video != null) {
      video_file = params.video;
    }
    root.video_file = video_file;
    metadata_file = '3-1.json';
    if (params.metadata != null) {
      metadata_file = params.metadata;
    }
    $('#viewer').attr('src', video_file);
    return $('#viewer').on('loadedmetadata', function(){
      return $.get(metadata_file, function(data){
        var annotations;
        root.videoDuration = $('#viewer')[0].duration;
        root.annotations = annotations = processAnnotations(data);
        return setupViewer();
      });
    });
  });
}).call(this);
