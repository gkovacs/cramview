(function(){
  var root, J, toSeconds, processAnnotations, isInElement, getSectionByIdx, getSlideByIdx, getSectionIdxByTime, getSlideIdxByTime, setThumbnailEmpty, setThumbnailWhiteNoBorder, setSeekThumbnailEmpty, setThumbnailNoBorder, setReviewThumbnailsToSectionIdx, setPreviewThumbnailsToSectionIdx, setThumbnail, setSeekThumbnail, setSeekThumbnailsToSectionIdx, setSeekThumbnailsToTime, getCssWidth, getScrollbarWidth, addTicksToProgressBar, markViewedSegments, getFractionHoverInScrollbar, setSeekProgressTickToFraction, setProgressTickToFraction, isPlaying, setPlaying, setVideoTime, getVideoTime, getVideoFraction, hideReview, hidePreview, showingQuiz, showingReview, showingPreview, setReviewCountdown, setPreviewCountdown, seekTo, continueClicked, watchClicked, togglePlay, getWatchedSegments, selectText, Priorities, Modes, showPreview, showReview, setSectionPriorityMarker, nextIdxLoop, setSectionPriority, skipToNextSection, priority_button_clicked, jumpButtonClicked, setupViewer, nanToZero, review_clicked, setupViewer2, getUrlParameters;
  root = typeof exports != 'undefined' && exports !== null ? exports : this;
  J = $.jade;
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
    var output, prev_end, i$, len$, child;
    output = [];
    prev_end = 0;
    for (i$ = 0, len$ = data.length; i$ < len$; ++i$) {
      child = data[i$];
      if (child.start != null) {
        child.start = toSeconds(child.start);
      }
      if (child.end != null) {
        child.end = toSeconds(child.end);
        if (child.start == null) {
          child.start = prev_end;
          prev_end = child.end;
        }
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
  root.thumbnail_width = 640;
  root.thumbnail_height = 360;
  setThumbnailNoBorder = function(thumbnail, time){
    var thumbnail_src;
    thumbnail_src = '/thumbnail?' + $.param({
      video: root.video_file,
      time: Math.round(time),
      width: root.thumbnail_width,
      height: root.thumbnail_height
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
  setSeekThumbnailsToTime = function(current_time){
    var i$, ref$, len$, idx, results$ = [];
    setSeekThumbnail(0, current_time, true);
    for (i$ = 0, len$ = (ref$ = [1]).length; i$ < len$; ++i$) {
      idx = ref$[i$];
      results$.push(setSeekThumbnailEmpty(idx));
    }
    return results$;
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
      root.mode = Modes.VIEW;
      $('#view_area').show();
      hideReview();
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
  /*
  showReview = root.showReview = (section_idx) ->
    if not section_idx?
      console.log 'need section_idx'
      return
    if root.current_section_idx == section_idx and $('#review_area').is(':visible')
      return
    setPlaying(false)
    root.current_section_idx = section_idx
    root.review_start_time = new Date().getTime() / 1000.0
    root.review_end_time = root.review_start_time + 15.0
    $('#continue_button').text $('#continue_button').attr('buttontext')
    #$('#continue_button').text $('#continue_button').attr('buttontext') + ' (' + Math.round(root.review_end_time - root.review_start_time) + ')'
    section = getSectionByIdx(section_idx)
    setVideoTime section.end
    $('#review_area').show()
    $('#reviewquestion').text(section.summary)
    setReviewThumbnailsToSectionIdx(section_idx)
  */
  /*
  showPreview = root.showPreview = (section_idx) ->
    if not section_idx?
      console.log 'need section_idx'
      return
    if root.current_section_idx == section_idx and $('#preview_area').is(':visible')
      return
    section = getSectionByIdx(section_idx)
    if not section?
      return
    console.log 'showpreview'
    setPlaying(false)
    root.current_section_idx = section_idx
    root.preview_start_time = new Date().getTime() / 1000.0
    root.preview_end_time = root.preview_start_time + 15.0
    $('#watch_button').text $('#watch_button').attr('buttontext')
    #$('#watch_button').text $('#watch_button').attr('buttontext') + ' (' + Math.round(root.preview_end_time - root.preview_start_time) + ')'
    setVideoTime section.start
    $('#preview_area').show()
    $('#previewquestion').text(section.summary)
    setPreviewThumbnailsToSectionIdx(section_idx)
    if section_idx == root.annotations.length - 1
      $('#skip_button').hide()
    else
      $('#skip_button').show()
  */
  hideReview = root.hideReview = function(){
    root.review_start_time = 0;
    root.review_end_time = 0;
    return $('#review_area').hide();
  };
  hidePreview = root.hidePreview = function(){
    root.preview_start_time = 0;
    root.preview_end_time = 0;
    return $('#review_area').hide();
  };
  showingQuiz = function(){
    return $('#review_area').is(':visible');
  };
  showingReview = function(){
    return root.mode === Modes.REVIEW;
  };
  showingPreview = function(){
    return root.mode === Modes.PREVIEW;
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
    root.automaticSeeking = false;
    return priority_button_clicked(Priorities.SOON);
  };
  watchClicked = function(){
    return priority_button_clicked(Priorities.NOW);
  };
  togglePlay = function(){
    if (root.mode === Modes.REVIEW) {
      return continueClicked();
    } else if (root.mode === Modes.PREVIEW) {
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
  selectText = root.selectText = function(element){
    var doc, text, range, selection;
    doc = document;
    text = doc.getElementById(element);
    range = null;
    selection = null;
    if (doc.body.createTextRange) {
      range = doc.body.createTextRange();
      range.moveToElementText(text);
      return range.select();
    } else if (window.getSelection) {
      selection = window.getSelection();
      range = doc.createRange();
      range.selectNodeContents(text);
      selection.removeAllRanges();
      return selection.addRange(range);
    }
  };
  root.section_to_priority = {};
  Priorities = root.Priorities = {
    NONE: 0,
    NOW: 1,
    SOON: 2,
    LATER: 3,
    NEVER: 4
  };
  Modes = root.Modes = {
    PRETEST: 0,
    PREVIEW: 1,
    REVIEW: 2,
    VIEW: 3
  };
  root.mode = Modes.PREVIEW;
  showPreview = root.showPreview = function(section_idx){
    var section, quizzes, thumbnail_x, thumbnail_y, thumbnail_width, thumbnail_height, overlay;
    setPlaying(false);
    $('#view_area').hide();
    root.mode = Modes.PREVIEW;
    root.current_section_idx = section_idx;
    section = root.annotations[section_idx];
    quizzes = section.quizzes;
    setVideoTime(section.start);
    $('#now_button').show();
    $('#reviewcaption').text($('#reviewcaption').attr('preview_text'));
    $('#rewatch_label').text($('#rewatch_label').attr('preview_text'));
    $('#review_area').show();
    setThumbnailNoBorder($('#review_thumbnail_0'), section.end - 2.0);
    thumbnail_x = 3;
    thumbnail_y = 3;
    thumbnail_width = root.thumbnail_width;
    thumbnail_height = root.thumbnail_height;
    if (section.question != null) {
      $('#review_thumbnails').hide();
      $('#reviewquestion').text(section.question);
      return;
    }
    if (section.quizzes == null) {
      return;
    }
    overlay = quizzes[0];
    $('#overlay').css({
      width: overlay.w * thumbnail_width / 100.0,
      height: overlay.h * thumbnail_height / 100.0,
      left: thumbnail_x + overlay.x * thumbnail_width / 100.0,
      top: thumbnail_y + overlay.y * thumbnail_height / 100.0
    });
    return $('#overlay').show();
  };
  showReview = root.showReview = function(section_idx){
    var section, quizzes, thumbnail_x, thumbnail_y, thumbnail_width, thumbnail_height, overlay;
    setPlaying(false);
    $('#view_area').hide();
    root.mode = Modes.REVIEW;
    root.current_section_idx = section_idx;
    section = root.annotations[section_idx];
    quizzes = section.quizzes;
    setVideoTime(section.end);
    $('#now_button').hide();
    $('#reviewcaption').text($('#reviewcaption').attr('review_text'));
    $('#rewatch_label').text($('#rewatch_label').attr('review_text'));
    $('#review_area').show();
    setThumbnailNoBorder($('#review_thumbnail_0'), section.end - 2.0);
    thumbnail_x = 3;
    thumbnail_y = 3;
    thumbnail_width = root.thumbnail_width;
    thumbnail_height = root.thumbnail_height;
    if (section.question != null) {
      $('#review_thumbnails').hide();
      $('#reviewquestion').text(section.question);
      return;
    }
    if (section.quizzes == null) {
      return;
    }
    overlay = quizzes[0];
    $('#overlay').css({
      width: overlay.w * thumbnail_width / 100.0,
      height: overlay.h * thumbnail_height / 100.0,
      left: thumbnail_x + overlay.x * thumbnail_width / 100.0,
      top: thumbnail_y + overlay.y * thumbnail_height / 100.0
    });
    return $('#overlay').show();
  };
  setSectionPriorityMarker = root.setSectionPriorityMarker = function(section_idx, priority){
    var priority_to_name, priority_name, priority_marker, section, fraction, position;
    priority_to_name = {
      0: '',
      1: 'Now',
      2: 'Soon',
      3: 'Later',
      4: 'Never'
    };
    priority_name = priority_to_name[priority];
    priority_marker = $('#priority_marker_' + section_idx);
    if (priority_marker.length === 0) {
      $('#scrollbar').append($('<span>').attr('id', 'priority_marker_' + section_idx));
      priority_marker = $('#priority_marker_' + section_idx);
    }
    section = getSectionByIdx(section_idx);
    console.log(section);
    fraction = section.start / root.videoDuration;
    position = fraction * getScrollbarWidth();
    console.log(position);
    priority_marker.css('position', 'absolute');
    priority_marker.css('left', position + 'px');
    priority_marker.css('margin-left', 5);
    return priority_marker.text(priority_name);
  };
  /*
  setSectionPriorityBackground = root.setSectionPriorityBackground = (section_idx, priority) ->
    priority_to_color = {
      0: '#940000'
      1: '#94008a'
      2: '#006594'
      3: '#00946c'
      4: '#4cff24'
    }
    priority_color = priority_to_color[priority]
  */
  nextIdxLoop = root.nextIdxLoop = function(cur_idx){
    cur_idx = cur_idx + 1;
    if (cur_idx >= annotations.length) {
      cur_idx = 0;
    }
    return cur_idx;
  };
  setSectionPriority = function(cur_idx, priority){
    root.section_to_priority[cur_idx] = priority;
    return setSectionPriorityMarker(cur_idx, priority);
  };
  skipToNextSection = root.skipToNextSection = function(){
    var cur_idx, ref$, priority;
    cur_idx = nextIdxLoop(root.current_section_idx);
    while (root.section_to_priority[cur_idx] != null && ((ref$ = root.section_to_priority[cur_idx]) === Priorities.SOON || ref$ === Priorities.LATER || ref$ === Priorities.NEVER)) {
      priority = root.section_to_priority[cur_idx];
      if (priority === Priorities.SOON) {
        break;
      } else if (priority === Priorities.NEVER) {
        cur_idx = nextIdxLoop(cur_idx);
      } else if (priority === Priorities.LATER) {
        console.log('skipping over later priority');
        setSectionPriority(cur_idx, Priorities.SOON);
        cur_idx = nextIdxLoop(cur_idx);
      }
    }
    return cur_idx;
  };
  priority_button_clicked = function(priority){
    var next_idx;
    console.log('priority:' + priority);
    console.log('mode:' + root.mode);
    console.log('preview mode:' + Modes.PREVIEW);
    setSectionPriority(root.current_section_idx, priority);
    if (root.mode === Modes.PREVIEW) {
      if (priority === Priorities.NOW) {
        console.log('hide preview');
        setPlaying(true);
        return hidePreview();
      } else {
        next_idx = skipToNextSection();
        return showPreview(next_idx);
      }
    } else if (root.mode === Modes.REVIEW) {
      next_idx = skipToNextSection();
      return showPreview(next_idx);
    } else {
      return console.log('priority button clicked in mode outside review or preview');
    }
  };
  root.isMouseDown = false;
  root.startX = 0;
  root.startY = 0;
  jumpButtonClicked = root.jumpButtonClicked = function(){
    var videoTime, sectionIdx, sectionEnd, in_watched_segment, end_of_current_segment, i$, ref$, len$, ref1$, start, end;
    videoTime = getVideoTime();
    sectionIdx = getSectionIdxByTime(videoTime);
    sectionEnd = getSectionByIdx(sectionIdx).end;
    in_watched_segment = false;
    end_of_current_segment = 0;
    for (i$ = 0, len$ = (ref$ = getWatchedSegments()).length; i$ < len$; ++i$) {
      ref1$ = ref$[i$], start = ref1$[0], end = ref1$[1];
      if (start <= videoTime && videoTime <= (ref1$ = videoTime + 3) && ref1$ <= end) {
        in_watched_segment = true;
        end_of_current_segment = end;
      }
    }
    console.log('end of current segment is:' + end_of_current_segment);
    if (in_watched_segment && end_of_current_segment < sectionEnd) {
      return $('#viewer')[0].currentTime = end_of_current_segment;
    } else {
      return showReview(getSectionIdxByTime(videoTime));
    }
  };
  setupViewer = function(){
    var i$, ref$, len$, idx, section, header, footer, cursec, results$ = [];
    console.log('viewer set up');
    for (i$ = 0, len$ = (ref$ = annotations).length; i$ < len$; ++i$) {
      idx = i$;
      section = ref$[i$];
      console.log(section);
      header = J('.panel-heading').append(J('h4.panel-title').append([J('span.slider_label').text("Don't Know").css('margin-right', '20px'), J('input.slider_input(data-slider-min="0" data-slider-max="100" data-slider-step="1" data-slider-value="0")').attr('id', "slider_" + idx), J('span.slider_label').text('Know').css('margin-left', '20px').css('margin-right', '20px'), J("a#title_text_" + idx + "(data-toggle='collapse' href='#collapse_" + idx + "')").text(section.question)]));
      footer = J("#collapse_" + idx + ".panel-collapse.collapse.in").append(J('.panel-body').append(J('video').attr('controls', 'controls').attr('src', 'segmentvideo?' + $.param({
        video: root.video_file,
        start: section.start,
        end: section.end
      }))));
      cursec = J('.panel.panel-default').append([header, footer]);
      $('#accordion').append(cursec);
      $("#collapse_" + idx).collapse('hide');
      $("#slider_" + idx).slider({
        formatter: fn$,
        tooltip: 'show'
      });
      $("#slider_" + idx).slide;
      results$.push($("#slider_" + idx).parent().find('.slider-selection').css('background', '#BABABA'));
    }
    return results$;
    function fn$(value){
      return value;
    }
  };
  nanToZero = function(num){
    if (num != null && !isNaN(num)) {
      return num;
    }
    return 0;
  };
  review_clicked = root.review_clicked = function(){
    var slider_values_and_idx, res$, i$, ref$, len$, idx, slider, bottom_values_and_idx, indexes_to_review_set, value, results$ = [];
    console.log('review clicked');
    res$ = [];
    for (i$ = 0, len$ = (ref$ = $('.slider_input')).length; i$ < len$; ++i$) {
      idx = i$;
      slider = ref$[i$];
      res$.push([nanToZero(parseInt(slider.value)), idx]);
    }
    slider_values_and_idx = res$;
    slider_values_and_idx = slider_values_and_idx.sort();
    bottom_values_and_idx = [slider_values_and_idx[0], slider_values_and_idx[1], slider_values_and_idx[2]];
    res$ = {};
    for (i$ = 0, len$ = bottom_values_and_idx.length; i$ < len$; ++i$) {
      ref$ = bottom_values_and_idx[i$], value = ref$[0], idx = ref$[1];
      res$[idx] = true;
    }
    indexes_to_review_set = res$;
    for (i$ = 0, len$ = bottom_values_and_idx.length; i$ < len$; ++i$) {
      ref$ = bottom_values_and_idx[i$], value = ref$[0], idx = ref$[1];
      $("#collapse_" + idx).collapse('show');
      $("#slider_" + idx).slider('setValue', Math.min(100, value + 10));
      $("#title_text_" + idx).css('font-weight', 'bold');
    }
    for (i$ = 0, len$ = slider_values_and_idx.length; i$ < len$; ++i$) {
      ref$ = slider_values_and_idx[i$], value = ref$[0], idx = ref$[1];
      if (indexes_to_review_set[idx] == null) {
        $("#collapse_" + idx).collapse('hide');
        results$.push($("#title_text_" + idx).css('font-weight', 'normal'));
      }
    }
    return results$;
  };
  setupViewer2 = function(){
    var res$, i$, ref$, len$, i;
    res$ = [];
    for (i$ = 0, len$ = (ref$ = (fn$())).length; i$ < len$; ++i$) {
      i = ref$[i$];
      res$.push(false);
    }
    root.watched = res$;
    addTicksToProgressBar();
    showPreview(0);
    setInterval(function(){
      var videoTime, sectionIdx, sectionEnd, in_watched_segment, end_of_current_segment, i$, ref$, len$, ref1$, start, end;
      videoTime = getVideoTime();
      sectionIdx = getSectionIdxByTime(videoTime);
      sectionEnd = getSectionByIdx(sectionIdx).end;
      in_watched_segment = false;
      end_of_current_segment = 0;
      for (i$ = 0, len$ = (ref$ = getWatchedSegments()).length; i$ < len$; ++i$) {
        ref1$ = ref$[i$], start = ref1$[0], end = ref1$[1];
        if (start <= videoTime && videoTime <= (ref1$ = videoTime + 3) && ref1$ <= end) {
          in_watched_segment = true;
          end_of_current_segment = end;
        }
      }
      if (in_watched_segment && end_of_current_segment < sectionEnd) {
        console.log('');
        return $('#jump_button').text('Skip part I have already watched');
      } else {
        return $('#jump_button').text('Skip rest of section');
      }
    }, 100);
    $('#jump_button').click(function(){
      return jumpButtonClicked();
    });
    $('#overlay').click(function(){
      return $('#overlay').hide();
    });
    $('.priority_button').click(function(){
      var priority;
      priority = parseInt($(this).attr('priority'));
      return priority_button_clicked(priority);
    });
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
      if (root.mode === Modes.VIEW) {
        if (getSectionIdxByTime(videoTime) > root.current_section_idx) {
          showReview(root.current_section_idx);
        }
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
        if (marker_fraction - 0.005 <= fraction && fraction <= marker_fraction + 0.005) {
          fraction = marker_fraction;
          section_idx = marker_section;
          at_boundary = true;
        }
      }
      if (at_boundary) {
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
      setSeekThumbnailsToTime(time_in_video);
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
      setSeekThumbnailsToTime(time_in_video);
      return setSeekProgressTickToFraction(fraction);
    });
    $(document).mousedown(function(evt){
      if (evt.which !== 2) {
        return;
      }
      if (!isInElement(evt, $('#viewer'))) {
        return;
      }
      console.log('mousedown');
      evt.preventDefault();
      root.isMouseDown = true;
      root.startX = evt.clientX;
      root.startY = evt.clientY;
      console.log(root.startX + ',' + root.startY);
      $('#overlay').css({
        width: 0,
        height: 0,
        left: root.startX,
        top: root.startY
      });
      return $('#overlay').show();
    });
    $(document).mouseup(function(evt){
      root.isMouseDown = false;
      if (!isInElement(evt, $('#viewer'))) {
        return;
      }
      evt.preventDefault();
      return console.log('mouseup');
    });
    $(document).mousemove(function(evt){
      var overlayw, overlayh, xp, yp, wp, hp, urlparams, linkurl;
      if (isInElement(evt, $('#scrollbar')) || isInElement(evt, $('#historybar'))) {
        $('#questionbar').show();
        $('#seekprogresstick').show();
      } else {
        if (false) {
          $('#seekprogresstick').hide();
        } else {
          $('#questionbar').hide();
          $('#thumbnails').hide();
          $('#seekprogresstick').hide();
        }
      }
      if (!isInElement(evt, $('#viewer')) || !root.isMouseDown) {
        return;
      }
      overlayw = evt.clientX - root.startX;
      overlayh = evt.clientY - root.startY;
      if (overlayw > 0 && overlayh > 0) {
        $('#overlay').show();
        $('#overlay').show();
        $('#overlay').css('width', overlayw);
        $('#overlay').css('height', overlayh);
        xp = 100 * root.startX / root.videoWidth;
        yp = 100 * root.startY / root.videoHeight;
        wp = 100 * overlayw / root.videoWidth;
        hp = 100 * overlayh / root.videoHeight;
        urlparams = {
          width: root.videoWidth,
          height: root.videoHeight,
          overlayx: xp,
          overlayy: yp,
          overlayw: wp,
          overlayh: hp,
          video: root.video_file,
          time: getVideoTime()
        };
        linkurl = 'overlay?' + $.param(urlparams);
        $('#urldisplay').text(linkurl).attr('href', linkurl);
        return $('#jsondisplay').text(JSON.stringify({
          time: getVideoTime(),
          overlays: [{
            x: xp,
            y: yp,
            w: wp,
            h: hp
          }]
        }, null, 2));
      } else {
        $('#overlay').hide();
        $('#overlay').hide();
        return $('#urldisplay').text('');
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
        } else {
          jumpButtonClicked();
        }
      }
      if (key === 32) {
        togglePlay();
      }
      if (key === 37) {
        seekTo(getVideoTime() - 3);
        setPlaying(true);
      }
      if (key === 39) {
        seekTo(getVideoTime() + 3);
        return setPlaying(true);
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
  root.quizmode = false;
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
    console.log('document ready 2');
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
    root.quizmode = true;
    $('#viewer').attr('src', video_file);
    return $('#viewer').on('loadedmetadata', function(){
      return $.get(metadata_file, function(data){
        var annotations;
        root.videoWidth = $('#viewer')[0].videoWidth;
        root.videoHeight = $('#viewer')[0].videoHeight;
        root.videoDuration = $('#viewer')[0].duration;
        root.annotations = annotations = processAnnotations(data);
        return setupViewer();
      });
    });
  });
}).call(this);
