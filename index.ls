root = exports ? this
J = $.jade

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

processAnnotations = (data) ->
  output = []
  prev_end = 0
  for child in data
    if child.start?
      child.start = toSeconds(child.start)
    if child.end?
      child.end = toSeconds(child.end)
      if not child.start?
        child.start = prev_end
        prev_end = child.end
    if child.thumbnail_time?
      child.thumbnail_time = toSeconds(child.thumbnail_time)
    if child.slides?
      child.slides = processAnnotations(child.slides)
    output.push child
  return output

root.annotations = null

#lookupQuestionForTime = (time) ->

isInElement = (evt, element) ->
  isInX = element.offset().left <= evt.clientX <= element.offset().left + element.width()
  isInY = element.offset().top <= evt.clientY <= element.offset().top + element.height()
  #console.log 'isInX:' + isInX
  #console.log 'isInY:' + isInY
  #console.log element.offset().top + ',' + evt.clientY + ',' + (element.offset().top + element.height())
  return isInX and isInY

root.annotations = null

getSectionByIdx = (idx) ->
  return root.annotations[idx]

getSlideByIdx = (idx) ->
  slide_idx = 0
  for section in root.annotations
    for slide in section.slides
      if slide_idx == idx
        return slide
      slide_idx += 1

getSectionIdxByTime = (time) ->
  for section,idx in root.annotations
    if section.start <= time <= section.end
      return idx
  return 0

getSlideIdxByTime = (time) ->
  slide_idx = 0
  for section in root.annotations
    for slide in section.slides
      if slide.start <= time <= slide.thumbnail_time
        return slide_idx
      slide_idx += 1
  return 0

setThumbnailEmpty = (thumbnail) ->
  thumbnail.attr('src', '/black_thumbnail.png')
  thumbnail.css('border', 'solid 3px black')

setThumbnailWhiteNoBorder = (thumbnail) ->
  thumbnail.attr('src', '/white_thumbnail.png')

setSeekThumbnailEmpty = (thumbnail_idx) ->
  thumbnail = $('#thumbnail_' + thumbnail_idx)
  setThumbnailEmpty(thumbnail)

root.thumbnail_width = 640
root.thumbnail_height = 360

setThumbnailNoBorder = (thumbnail, time) ->
  thumbnail_src = '/thumbnail?' + $.param {video: root.video_file, time: Math.round(time), width: root.thumbnail_width, height: root.thumbnail_height}
  thumbnail.attr('src', thumbnail_src)
  thumbnail.css('border', 'solid 3px black').css('border-radius', '3px')

setReviewThumbnailsToSectionIdx = (section_idx) ->
  section_metadata = getSectionByIdx(section_idx)
  for slide,idx in section_metadata.slides
    thumbnail_time = slide.thumbnail_time
    setThumbnailNoBorder($('#review_thumbnail_' + idx), thumbnail_time)
  for idx in [section_metadata.slides.length til 2]
    setThumbnailWhiteNoBorder($('#review_thumbnail_' + idx))

setPreviewThumbnailsToSectionIdx = (section_idx) ->
  section_metadata = getSectionByIdx(section_idx)
  for slide,idx in section_metadata.slides
    thumbnail_time = slide.thumbnail_time
    setThumbnailNoBorder($('#preview_thumbnail_' + idx), thumbnail_time)
  for idx in [section_metadata.slides.length til 2]
    setThumbnailWhiteNoBorder($('#preview_thumbnail_' + idx))

setThumbnail = (thumbnail, time, highlight) ->
  thumbnail_src = '/thumbnail?' + $.param {video: root.video_file, time: Math.round(time)}
  thumbnail.attr('src', thumbnail_src)
  if highlight
    thumbnail.css('border', 'solid 3px yellow').css('border-radius', '3px')
    #thumbnail.css('-moz-box-shadow', 'inset 0 0 10px yellow').css('-webkit-box-shadow', 'inset 0 0 10px yellow').css('box-shadow', 'inset 0 0 10px yellow')
  else
    thumbnail.css('border', 'solid 3px black').css('border-radius', '3px')

setSeekThumbnail = (thumbnail_idx, time, highlight) ->
  thumbnail = $('#thumbnail_' + thumbnail_idx)
  setThumbnail thumbnail, time, highlight

setSeekThumbnailsToSectionIdx = (section_idx, current_time) ->
  #if section_idx == parseInt $('#thumbnails').attr('section_idx')
  #  return
  $('#thumbnails').attr('section_idx', section_idx)
  section_metadata = getSectionByIdx(section_idx)
  for slide,idx in section_metadata.slides
    thumbnail_time = slide.thumbnail_time
    highlight = false
    if slide.start <= current_time <= slide.end
      thumbnail_time = current_time
      highlight = true
    setSeekThumbnail(idx, thumbnail_time, highlight)
  for idx in [section_metadata.slides.length til 2]
    setSeekThumbnailEmpty(idx)

setSeekThumbnailsToTime = (current_time) ->
  setSeekThumbnail(0, current_time, true)
  for idx in [1 til 2]
    setSeekThumbnailEmpty(idx)

getCssWidth = (elem) ->
  elem.css('width').split('px').join('')

getScrollbarWidth = ->
  parseInt(getCssWidth($('#scrollbar')))

addTicksToProgressBar = ->
  addMarker = (idx, fraction) ->
    $('#scrollbar').append '<div id="section_progress_marker_' + idx  + '">'
    marker = $('#section_progress_marker_' + idx)
    marker.addClass('sectionProgressBarMarker').attr('fraction', fraction).attr('section_idx', idx).css('left', getScrollbarWidth() * fraction - getCssWidth(marker) / 2)
  for section,idx in root.annotations
    fraction = section.start / root.videoDuration
    addMarker(idx, fraction)
    #if idx == root.annotations.length - 1
    #  fraction = section.end / root.videoDuration
    #  addMarker(idx+1, fraction)

markViewedSegments = root.markViewedSegments = ->
  addViewedMarker = (idx, fraction_start, fraction_end) ->
    $('#historybar').append '<div id="watched_marker_' + idx  + '" class="watchedMarker" section_idx="' + idx + '">'
    updateViewedMarker $('#watched_marker_' + idx), fraction_start, fraction_end
  updateViewedMarker = (marker, fraction_start, fraction_end) ->
    marker.attr('fraction_start', fraction_start).attr('fraction_end', fraction_end).css('left', getScrollbarWidth() * fraction_start).css('width', getScrollbarWidth() * (fraction_end - fraction_start))
  #$('#historybar').html('')
  for segment,idx in getWatchedSegments()
    [segment_start, segment_end] = segment
    segment_start = segment_start / root.videoDuration
    segment_end = segment_end / root.videoDuration
    existing_marker = $('#watched_marker_' + idx)
    if existing_marker.length > 0
      updateViewedMarker(existing_marker, segment_start, segment_end)
    else
      addViewedMarker(idx, segment_start, segment_end)

root.videoDuration = null

getFractionHoverInScrollbar = (evt) ->
  return evt.offsetX / getScrollbarWidth()

setSeekProgressTickToFraction = (fraction) ->
  $('#seekprogresstick').css('left', fraction * getScrollbarWidth() - getCssWidth($('#seekprogresstick')) / 2)

setProgressTickToFraction = (fraction) ->
  $('#progresstick').css('left', fraction * getScrollbarWidth() - getCssWidth($('#progresstick')) / 2)

isPlaying = ->
  return not $('#viewer')[0].paused

setPlaying = (isplaying) ->
  if isplaying
    root.mode = Modes.VIEW
    $('#view_area').show()
    hideReview()
    $('#playpause').attr('src', 'pause.png')
    $('#viewer')[0].play()
  else
    $('#playpause').attr('src', 'play.png')
    $('#viewer')[0].pause()

setVideoTime = (time) ->
  $('#viewer')[0].currentTime = time

getVideoTime = ->
  return $('#viewer')[0].currentTime

getVideoFraction = ->
  return getVideoTime() / root.videoDuration

root.current_section_idx = 0

root.review_start_time = 0
root.review_end_time = 0
root.preview_start_time = 0
root.preview_end_time = 0

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

hideReview = root.hideReview = ->
  root.review_start_time = 0
  root.review_end_time = 0
  $('#review_area').hide()

hidePreview = root.hidePreview = ->
  root.preview_start_time = 0
  root.preview_end_time = 0
  $('#review_area').hide()

showingQuiz = ->
  return $('#review_area').is(':visible')

showingReview = ->
  return root.mode == Modes.REVIEW

showingPreview = ->
  return root.mode == Modes.PREVIEW

setReviewCountdown = ->
  curtime = new Date().getTime() / 1000.0
  time_until_end = root.review_end_time - curtime
  time_until_end_str = Math.round(time_until_end).toString()
  if time_until_end_str.length == 1
    time_until_end_str = '0' + time_until_end_str
  $('#continue_button').text $('#continue_button').attr('buttontext') + ' (' + time_until_end_str + ')'
  $('#continue_button').css 'width', Math.max(parseInt($('#continue_button').css('width')), $('#continue_button').outerWidth())
  return

setPreviewCountdown = ->
  curtime = new Date().getTime() / 1000.0
  time_until_end = root.preview_end_time - curtime
  time_until_end_str = Math.round(time_until_end).toString()
  if time_until_end_str.length == 1
    time_until_end_str = '0' + time_until_end_str
  $('#watch_button').text $('#watch_button').attr('buttontext') + ' (' + time_until_end_str + ')'
  $('#watch_button').css 'width', Math.max(parseInt($('#watch_button').css('width')), $('#watch_button').outerWidth())
  return

root.automaticSeeking = false

seekTo = (time) ->
  root.automaticSeeking = true
  root.current_section_idx = getSectionIdxByTime(time)
  setVideoTime(time)
  fraction = time / root.videoDuration
  setProgressTickToFraction(fraction)
  hideReview()
  hidePreview()
  root.automaticSeeking = false

continueClicked = ->
  root.automaticSeeking = true
  console.log 'continue button clicked'
  #hideReview()
  #root.current_section_idx = getSectionIdxByTime(getVideoTime() + 1.0)
  #setPlaying(true)
  #showPreview(root.current_section_idx)
  root.automaticSeeking = false
  priority_button_clicked(Priorities.SOON)

watchClicked = ->
  #$('#preview_area').hide()
  #hidePreview()
  #setPlaying(true)
  priority_button_clicked(Priorities.NOW)

togglePlay = ->
  if root.mode == Modes.REVIEW
    continueClicked()
  else if root.mode == Modes.PREVIEW
    watchClicked()
  else if isPlaying()
    setPlaying(false)
  else
    setPlaying(true)

root.watched = null

getWatchedSegments = root.getWatchedSegments = ->
  output = []
  start = -1
  for elem,i in root.watched
    if start != -1
      if not elem
        if i - start >= 4
          output.push [start, i]
        start = -1
    else
      if elem
        start = i
  return output

selectText = root.selectText = (element) ->
  doc = document
  text = doc.getElementById(element)
  range = null
  selection = null
  if doc.body.createTextRange #ms
    range = doc.body.createTextRange()
    range.moveToElementText(text)
    range.select()
  else if window.getSelection #all others
    selection = window.getSelection()        
    range = doc.createRange()
    range.selectNodeContents(text)
    selection.removeAllRanges()
    selection.addRange(range)

root.section_to_priority = {}

Priorities = root.Priorities = {
  NONE: 0
  NOW: 1
  SOON: 2
  LATER: 3
  NEVER: 4
}

Modes = root.Modes = {
  PRETEST: 0
  PREVIEW: 1
  REVIEW: 2
  VIEW: 3
}
root.mode = Modes.PREVIEW

showPreview = root.showPreview = (section_idx) ->
  setPlaying(false)
  $('#view_area').hide()
  root.mode = Modes.PREVIEW
  root.current_section_idx = section_idx
  section = root.annotations[section_idx]
  quizzes = section.quizzes
  setVideoTime(section.start)
  $('#now_button').show()
  $('#reviewcaption').text $('#reviewcaption').attr('preview_text')
  $('#rewatch_label')text $('#rewatch_label').attr('preview_text')
  $('#review_area').show()
  setThumbnailNoBorder $('#review_thumbnail_0'), section.end - 2.0
  thumbnail_x = 3 #$('#review_thumbnail_0').offset().left + 3
  thumbnail_y = 3 #$('#review_thumbnail_0').offset().top + 3
  thumbnail_width = root.thumbnail_width #$('#review_thumbnail_0').width()
  thumbnail_height = root.thumbnail_height #$('#review_thumbnail_0').height()
  if section.question?
    $('#review_thumbnails').hide()
    $('#reviewquestion').text section.question
    return
  if not section.quizzes?
    return
  overlay = quizzes[0]
  $('#overlay').css {
    width: overlay.w * thumbnail_width / 100.0
    height: overlay.h * thumbnail_height / 100.0
    left: thumbnail_x + overlay.x * thumbnail_width / 100.0
    top: thumbnail_y + overlay.y * thumbnail_height / 100.0
  }
  $('#overlay').show()

showReview = root.showReview = (section_idx) ->
  setPlaying(false)
  $('#view_area').hide()
  root.mode = Modes.REVIEW
  root.current_section_idx = section_idx
  section = root.annotations[section_idx]
  quizzes = section.quizzes
  setVideoTime(section.end)
  $('#now_button').hide()
  $('#reviewcaption').text $('#reviewcaption').attr('review_text')
  $('#rewatch_label')text $('#rewatch_label').attr('review_text')
  $('#review_area').show()
  setThumbnailNoBorder $('#review_thumbnail_0'), section.end - 2.0
  thumbnail_x = 3 #$('#review_thumbnail_0').offset().left + 3
  thumbnail_y = 3 #$('#review_thumbnail_0').offset().top + 3
  thumbnail_width = root.thumbnail_width #$('#review_thumbnail_0').width()
  thumbnail_height = root.thumbnail_height #$('#review_thumbnail_0').height()
  if section.question?
    $('#review_thumbnails').hide()
    $('#reviewquestion').text section.question
    return
  if not section.quizzes?
    return
  overlay = quizzes[0]
  $('#overlay').css {
    width: overlay.w * thumbnail_width / 100.0
    height: overlay.h * thumbnail_height / 100.0
    left: thumbnail_x + overlay.x * thumbnail_width / 100.0
    top: thumbnail_y + overlay.y * thumbnail_height / 100.0
  }
  $('#overlay').show()


setSectionPriorityMarker = root.setSectionPriorityMarker = (section_idx, priority) ->
  priority_to_name = {
    0: ''
    1: 'Now'
    2: 'Soon'
    3: 'Later'
    4: 'Never'
  }
  priority_name = priority_to_name[priority]
  priority_marker = $('#priority_marker_' + section_idx)
  if priority_marker.length == 0
    $('#scrollbar').append $('<span>').attr('id', 'priority_marker_' + section_idx)
    priority_marker = $('#priority_marker_' + section_idx)
  section = getSectionByIdx(section_idx)
  fraction = section.start / root.videoDuration
  position = fraction * getScrollbarWidth()
  priority_marker.css('position', 'absolute')
  priority_marker.css('left', position + 'px')
  priority_marker.css('margin-left', 5)
  priority_marker.text(priority_name)

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

nextIdxLoop = root.nextIdxLoop = (cur_idx) ->
  cur_idx = cur_idx + 1
  if cur_idx >= annotations.length
    cur_idx = 0
  return cur_idx

setSectionPriority = (cur_idx, priority) ->
  root.section_to_priority[cur_idx] = priority
  setSectionPriorityMarker(cur_idx, priority)

skipToNextSection = root.skipToNextSection = ->
  cur_idx = nextIdxLoop root.current_section_idx
  # todo what to do when the user has marked all sections as "never?"
  while root.section_to_priority[cur_idx]? and root.section_to_priority[cur_idx] in [Priorities.SOON, Priorities.LATER, Priorities.NEVER]
    priority = root.section_to_priority[cur_idx]
    if priority == Priorities.SOON
      break
    else if priority == Priorities.NEVER
      cur_idx = nextIdxLoop cur_idx
    else if priority == Priorities.LATER
      console.log 'skipping over later priority'
      setSectionPriority cur_idx, Priorities.SOON
      cur_idx = nextIdxLoop cur_idx
  return cur_idx

priority_button_clicked = (priority) ->
  console.log 'priority:' + priority
  console.log 'mode:' + root.mode
  console.log 'preview mode:' + Modes.PREVIEW
  setSectionPriority root.current_section_idx, priority
  if root.mode == Modes.PREVIEW
    if priority == Priorities.NOW
      console.log 'hide preview'
      setPlaying(true)
      hidePreview()
    else
      next_idx = skipToNextSection()
      showPreview(next_idx)
  else if root.mode == Modes.REVIEW
    next_idx = skipToNextSection()
    showPreview(next_idx)
  else
    console.log 'priority button clicked in mode outside review or preview'

root.isMouseDown = false
root.startX = 0
root.startY = 0

jumpButtonClicked = root.jumpButtonClicked = ->
  videoTime = getVideoTime()
  sectionIdx = getSectionIdxByTime(videoTime)
  sectionEnd = getSectionByIdx(sectionIdx).end
  in_watched_segment = false
  end_of_current_segment = 0
  for [start,end] in getWatchedSegments()
    if start <= videoTime <= videoTime + 3 <= end
      in_watched_segment = true
      end_of_current_segment = end
  console.log 'end of current segment is:' + end_of_current_segment
  if in_watched_segment and end_of_current_segment < sectionEnd
    $('#viewer')[0].currentTime = end_of_current_segment
  else
    showReview getSectionIdxByTime(videoTime)

root.disableSlideUpdate = false

root.curPidx = -1

getCurPidx = root.getCurPidx = -> root.curPidx

getNextPidx = root.getNextPidx = ->
  root.curPidx += 1
  return root.curPidx

makeVideo = (idx) ->
  section = root.annotations[idx]
  videoelem = J('video')
  .attr('idx', idx)
  #.attr('pidx', pidx)
  .addClass("videogroup_#idx")
  #.attr('id', "video+#pidx")
  .attr('controls', 'controls')
  .attr('preload', 'auto')
  .append J('source')
  .attr('src', 'segmentvideo' /*+ Math.floor(Math.random() * 2**32)*/ + '?' + $.param({video: root.video_file, start: section.start, end: section.end}))
  #scrollbar = J('div').
  return J('div').append videoelem

root.video_viewers = []
root.video_attachments = []

root.reuse_videos = false

addCard = root.addCard = (idx, showCard, isInitialStack) ->
  pidx = getNextPidx()
  section = root.annotations[idx]
  header = J("\#cardtitle_#pidx.panel-heading").append J('h4.panel-title').append [J('span.slider_label').text("Don't Know").css('margin-right', '20px'), J('input.slider_input(data-slider-min="0" data-slider-max="100" data-slider-step="1" data-slider-value="0")').attr('id', "slider_#pidx").attr('pidx', pidx).addClass("slidergroup_#idx"), J('span.slider_label').text('Know').css('margin-left', '20px').css('margin-right', '20px'), J("a\#title_text_#pidx(data-toggle='collapse' href='\#collapse_#pidx')").text(section.question) ]
  if root.reuse_videos and not root.video_viewers[idx]?
    root.video_viewers[idx] = makeVideo(idx)
  #root.video_viewers[idx].detach()
  #root.video_attachments[idx] = pidx
  footer = J("\#collapse_#pidx.panel-collapse.collapse").append J("\#video_container_#pidx.panel-body") #.append root.video_viewers[idx] #makeVideo(idx, pidx)
  cursec = J("\#card_#pidx.cardgroup.panel.panel-default").append [header, footer]
  if isInitialStack
    $('#accordion_initial').append cursec
  else
    $('#accordion').append cursec
  $("\#collapse_#pidx").on 'show.bs.collapse', ->
    if root.video_attachments[idx] != pidx
      if root.reuse_videos
        $('#collapse_' + root.video_attachments[idx]).collapse 'hide'
        root.video_viewers[idx].detach()
        $("\#video_container_#pidx").append root.video_viewers[idx]
        root.video_attachments[idx] = pidx
      else
        $("\#video_container_#pidx").append makeVideo(idx)
  if showCard
    $("\#collapse_#pidx").collapse 'show'
  $("\#slider_#pidx").slider {
    formatter: (value) -> value #'Current value: ' + value
    tooltip: 'show' #'always'
  }
  if not root.settingUpViewer
    curval = $(root.sliders[idx]).slider 'getValue'
    $("\#slider_#pidx").slider('setValue', curval, false)
  $("\#slider_#pidx").on 'slide', ->
    if root.disableSlideUpdate
      return
    newval = parseInt $("\#slider_#pidx").slider('getValue')
    for slider in $(".slidergroup_#idx")
      if pidx == parseInt $(slider).attr('pidx')
        continue
      root.disableSlideUpdate = true
      $(slider).slider('setValue', newval, false)
      root.disableSlideUpdate = false
  $("\#slider_#pidx").parent().find('.slider-selection').css 'background' '#BABABA'
  #console.log $('#accordion').find('.cardgroup').length
  #while $('#accordion').find('.cardgroup').length > 5 #root.annotations.length + 10
  #  $($('#accordion').find('.cardgroup')[0]).detach() #.remove()


root.sliders = []
root.settingUpViewer = true

#root.prevScroll = 0

setupViewer = ->
  console.log 'viewer set up'
  for section,idx in root.annotations
    addCard(idx, false, true)
    #header = $('<h2>').text(section.question).append "<input type='range' min='1' max='10' style='float: left; width: 100px'>"
    #footer_video = $('<video>').attr('src', 'segmentvideo?' + $.param({video: root.video_file, start: section.start, end: section.end}))
    #footer = $('<div>').append footer_video
    #$('#accordion').append header
    #$('#accordion').append footer
  #$('#accordion').accordion {
  #  heightStyle: 'content'
  #}
  root.settingUpViewer = false
  root.sliders = $('.slider_input')[0 til root.annotations.length]
  /*
  $(document).scroll (evt) ->
    scroll_top = $(document).scrollTop()
    document_height = $(document).height()
    #console.log document_height
    window_height = $(window).height()
    #console.log window_height
    scroll_fraction = scroll_top / (document_height - window_height)
    console.log scroll_fraction
    if scroll_fraction >= 1
      review_clicked()
    evt.preventDefault()
    return false
  */
  $(document).mousewheel (evt) ->
    #console.log evt
    #console.log evt.deltaY
    scroll_top = $(document).scrollTop()
    document_height = $(document).height()
    #console.log document_height
    window_height = $(window).height()
    #console.log window_height
    scroll_fraction = scroll_top / (document_height - window_height)
    #scroll_fraction = (scroll_top + window_height) / $('#end_padding_div').offset().top
    #console.log scroll_fraction
    if evt.deltaY < 0 and (scroll_fraction >= 1 or isNaN(scroll_fraction))
      review_clicked()
      evt.stopImmediatePropagation()
      evt.preventDefault()
      return false
    evt.preventDefault()
    evt.stopImmediatePropagation()
    if evt.deltaY <= 0
      $(document).scrollTop(scroll_top + 20)
    else
      $(document).scrollTop(scroll_top - 20)
    return false
    #console.log evt.pageY
  #$(document).scroll (evt) ->
  #  scroll_top = $(document).scrollTop()
  #  document_height = $(document).height()
  #  window_height = $(window).height()
  #  scroll_fraction = scroll_top / (document_height - window_height)
  #  prev_scroll = root.prevScroll
  #  root.prevScroll = scroll_top
  #  #console.log scroll_top - prev_scroll
  #  console.log scroll_fraction

nanToZero = (num) ->
  if num? and not isNaN(num)
    return num
  return 0

randn = (toplim) -> Math.floor(Math.random() * toplim)

shuffle = root.shuffle = (aorig) ->
  a = aorig[to]
  for i in [a.length - 1 to 1 by -1]
    j = randn (i + 1)
    [a[j], a[i]] = [a[i], a[j]]
  return a

removeExcessCards = ->
  num_elements_to_remove = $('#accordion').find('.cardgroup').length - 10
  console.log 'removing excess cards:' + num_elements_to_remove
  if num_elements_to_remove > 0
    $('#accordion').find('.cardgroup').slice(0, num_elements_to_remove).remove()

root.review_last_clicked_time = 0

review_clicked = root.review_clicked = ->
  curTime = Date.now()
  if root.review_last_clicked_time + 2000 > curTime
    return
  root.review_last_clicked_time = curTime
  console.log 'review clicked'
  slider_values_and_idx = [[nanToZero(parseInt(slider.value)),idx] for slider,idx in root.sliders]
  slider_values_and_idx = slider_values_and_idx.sort()
  bottom_values_and_idx = shuffle(slider_values_and_idx)[0 til 3]
  #bottom_values_and_idx = slider_values_and_idx[0 til 3]
  indexes_to_review_set = {[idx,true] for [value,idx] in bottom_values_and_idx}
  for [value,idx] in bottom_values_and_idx
    showCard = false
    #if value < 30
    #if Math.random() > 0.6
    #  showCard = true
    showCard = true
    #$("\#collapse_#idx").collapse 'show'
    #$(sliders[idx]).slider 'setValue', Math.min(100, value+10)
    #$("\#title_text_#idx").css('font-weight', 'bold')
    addCard(idx, showCard, false)
    pidx = getCurPidx()
    if showCard
      $("\#slider_#pidx").slider 'setValue', Math.min(100, value+10)
  removeExcessCards()

/*
review_clicked = root.review_clicked = ->
  console.log 'review clicked'
  slider_values_and_idx = [[nanToZero(parseInt(slider.value)),idx] for slider,idx in $('.slider_input')]
  slider_values_and_idx = slider_values_and_idx.sort()
  bottom_values_and_idx = slider_values_and_idx[0 til 3]
  indexes_to_review_set = {[idx,true] for [value,idx] in bottom_values_and_idx}
  for [value,idx] in bottom_values_and_idx
    $("\#collapse_#idx").collapse 'show'
    $("\#slider_#idx").slider 'setValue', Math.min(100, value+10)
    $("\#title_text_#idx").css('font-weight', 'bold')
  for [value,idx] in slider_values_and_idx
    if not indexes_to_review_set[idx]?
      $("\#collapse_#idx").collapse 'hide'
      $("\#title_text_#idx").css('font-weight', 'normal')
*/

setupViewer2 = ->
  root.watched = [false for i in [0 to Math.round(root.videoDuration+0.5)]]
  addTicksToProgressBar()
  showPreview(0)
  setInterval ->
    videoTime = getVideoTime()
    sectionIdx = getSectionIdxByTime(videoTime)
    sectionEnd = getSectionByIdx(sectionIdx).end
    in_watched_segment = false
    end_of_current_segment = 0
    for [start,end] in getWatchedSegments()
      if start <= videoTime <= videoTime + 3 <= end
        in_watched_segment = true
        end_of_current_segment = end
    if in_watched_segment and end_of_current_segment < sectionEnd
      console.log ''
      $('#jump_button').text 'Skip part I have already watched'
    else
      $('#jump_button').text 'Skip rest of section'
  , 100
  $('#jump_button').click ->
    jumpButtonClicked()
  $('#overlay').click ->
    $('#overlay').hide()
  $('.priority_button').click ->
    priority = parseInt $(this).attr('priority')
    priority_button_clicked(priority)
  $('#rewatch_button').click ->
    root.automaticSeeking = true
    console.log 'rewatch button clicked'
    hideReview()
    section = getSectionByIdx(root.current_section_idx)
    setVideoTime section.start
    setPlaying(true)
    root.automaticSeeking = false
  $('#continue_button').click ->
    continueClicked()
  $('#watch_button').click ->
    watchClicked()
  $('#skip_button').click ->
    root.automaticSeeking = true
    setPlaying(false)
    hidePreview()
    if root.current_section_idx + 1 >= root.annotations.length
      setPlaying(true)
      root.automaticSeeking = false
      return
    root.current_section_idx += 1
    section = getSectionByIdx(root.current_section_idx)
    setVideoTime section.start
    root.automaticSeeking = false
    showPreview(root.current_section_idx)
  setInterval ->
      markViewedSegments()
  , 1000
  setInterval ->
    videoTime = getVideoTime()
    root.watched[Math.round(videoTime)] = true
    if root.automaticSeeking
      return
    if root.mode == Modes.VIEW
      if getSectionIdxByTime(videoTime) > root.current_section_idx
        showReview(root.current_section_idx)
    #if showingReview()
    #  curtime = new Date().getTime() / 1000.0
    #  time_until_end = root.review_end_time - curtime
    #  if (Math.round(time_until_end) <= 0)
    #    continueClicked()
    #  else
    #    setReviewCountdown()
    #  #return
    #if showingPreview()
    #  curtime = new Date().getTime() / 1000.0
    #  time_until_end = root.preview_end_time - curtime
    #  if (Math.round(time_until_end) <= 0)
    #    watchClicked()
    #  else
    #    setPreviewCountdown()
    #  #return
    fraction = videoTime / root.videoDuration
    setProgressTickToFraction(fraction)
    #if getSectionIdxByTime(videoTime + 1.0) > root.current_section_idx
    #  showReview(root.current_section_idx)
    #else if videoTime + 0.25 > root.videoDuration
    #  showReview(root.annotations.length - 1)
  , 100
  $('#playpause').click (evt) ->
    togglePlay()
  $('#scrollbar').click (evt) ->
    fraction = getFractionHoverInScrollbar(evt)
    at_boundary = false
    section_idx = -1
    for progress_marker in $('.sectionProgressBarMarker')
      marker_fraction = parseFloat $(progress_marker).attr('fraction')
      marker_section = parseInt $(progress_marker).attr('section_idx')
      if marker_fraction - 0.005 <= fraction <= marker_fraction + 0.005
        fraction = marker_fraction
        section_idx = marker_section
        at_boundary = true
    if at_boundary
      showPreview(section_idx)
    else
      time_in_video = root.videoDuration * fraction
      root.current_section_idx = getSectionIdxByTime(time_in_video)
      $('#viewer')[0].currentTime = time_in_video
      hideReview()
      hidePreview()
      setPlaying(true)
  $('#historybar').click (evt) ->
    fraction = getFractionHoverInScrollbar(evt)
    for watched_marker in $('.watchedMarker')
      marker_fraction = parseFloat $(watched_marker).attr('fraction_end')
      if marker_fraction - 0.005 <= fraction <= marker_fraction + 0.005
        fraction = marker_fraction - 0.001
    time_in_video = root.videoDuration * fraction
    root.current_section_idx = getSectionIdxByTime(time_in_video)
    $('#viewer')[0].currentTime = time_in_video
    hideReview()
    hidePreview()
    setPlaying(true)
  $('#scrollbar').mousemove (evt) ->
    #console.log evt.offsetX + ',' + evt.offsetY
    fraction = getFractionHoverInScrollbar(evt)
    for progress_marker in $('.sectionProgressBarMarker')
      marker_fraction = parseFloat $(progress_marker).attr('fraction')
      if marker_fraction - 0.005 <= fraction <= marker_fraction + 0.005
        fraction = marker_fraction
    #console.log fraction
    #$('#questionbar').text(percentage)
    time_in_video = root.videoDuration * fraction
    section_idx = getSectionIdxByTime(time_in_video)
    section_metadata = getSectionByIdx(section_idx)
    $('#questionbar').text(section_metadata.summary)
    $('#questionbar').show()
    $('#thumbnails').show()
    #setSeekThumbnailsToSectionIdx(section_idx, time_in_video)
    setSeekThumbnailsToTime(time_in_video)
    #console.log fraction
    setSeekProgressTickToFraction(fraction)
    #$('#progresstick').css('left', evt.offsetX-2)
    #console.log('hovered')
  $('#historybar').mousemove (evt) ->
    console.log 'historybar'
    fraction = getFractionHoverInScrollbar(evt)
    for watched_marker in $('.watchedMarker')
      marker_fraction = parseFloat $(watched_marker).attr('fraction_end')
      if marker_fraction - 0.005 <= fraction <= marker_fraction + 0.005
        fraction = marker_fraction - 0.001
    time_in_video = root.videoDuration * fraction
    section_idx = getSectionIdxByTime(time_in_video)
    section_metadata = getSectionByIdx(section_idx)
    $('#questionbar').text(section_metadata.summary)
    $('#questionbar').show()
    $('#thumbnails').show()
    #setSeekThumbnailsToSectionIdx(section_idx, time_in_video)
    setSeekThumbnailsToTime(time_in_video)
    setSeekProgressTickToFraction(fraction)
  $(document).mousedown (evt) ->
    if evt.which != 2 # middle mouse button
      return
    if not isInElement evt, $('#viewer')
      return
    console.log 'mousedown'
    evt.preventDefault()
    root.isMouseDown = true
    root.startX = evt.clientX
    root.startY = evt.clientY
    console.log root.startX + ',' + root.startY
    #$('#overlay').width(0)
    #$('#overlay').height(0)
    #$('#overlay').offset({left: root.startX, top: root.startY})
    $('#overlay').css {
      width: 0
      height: 0
      left: root.startX
      top: root.startY
    }
    $('#overlay').show()
    #console.log $('#overlay').offset()
  $(document).mouseup (evt) ->
    root.isMouseDown = false
    if not isInElement evt, $('#viewer')
      return
    evt.preventDefault()
    console.log 'mouseup'
  $(document).mousemove (evt) ->
    if isInElement(evt, $('#scrollbar')) or isInElement(evt, $('#historybar'))
      $('#questionbar').show()
      $('#seekprogresstick').show()
    else
      if false #isInElement(evt, $('#questionbar')) or isInElement(evt, $('#thumbnails'))
        $('#seekprogresstick').hide()
      else
        $('#questionbar').hide()
        $('#thumbnails').hide()
        $('#seekprogresstick').hide()
    if not isInElement evt, $('#viewer') or not root.isMouseDown
      return
    #console.log evt.clientX + ',' + evt.clientY
    overlayw = evt.clientX - root.startX
    overlayh = evt.clientY - root.startY
    if overlayw > 0 and overlayh > 0
      $('#overlay').show()
      $('#overlay').show()
      $('#overlay').css('width', overlayw)
      $('#overlay').css('height', overlayh)
      xp = 100 * root.startX / root.videoWidth
      yp = 100 * root.startY / root.videoHeight
      wp = 100 * overlayw / root.videoWidth
      hp = 100 * overlayh / root.videoHeight
      urlparams = {
        width: root.videoWidth
        height: root.videoHeight
        overlayx: xp
        overlayy: yp
        overlayw: wp
        overlayh: hp
        video: root.video_file
        time: getVideoTime()
      }
      linkurl = 'overlay?' + $.param(urlparams)
      $('#urldisplay').text(linkurl).attr('href', linkurl)
      $('#jsondisplay').text(JSON.stringify({
        time: getVideoTime()
        overlays: [
          {
            x: xp
            y: yp
            w: wp
            h: hp
          }
        ]
      }, null, 2))
    else
      $('#overlay').hide()
      $('#overlay').hide()
      $('#urldisplay').text('')
  $(document).keydown (evt) ->
    console.log evt.which
    key = evt.which
    if key == 13 # enter
      if showingReview()
        continueClicked()
      else if showingPreview()
        watchClicked()
      else
        jumpButtonClicked()
    if key == 32 # space
      togglePlay()
    if key == 37 # left arrow
      seekTo getVideoTime() - 3
      setPlaying(true)
    if key == 39 # right arrow
      seekTo getVideoTime() + 3
      setPlaying(true)

root.video_file = null
root.quizmode = false

getUrlParameters = ->
  output = {}
  parts = window.location.href.replace /[?&]+([^=&]+)=([^&]*)/gi, (m,key,value) ->
    output[key] = decodeURI value
  return output

$(document).ready ->
  console.log 'document ready 2'
  params = getUrlParameters()
  video_file = '3-1.mp4'
  if params.video?
    video_file = params.video
  root.video_file = video_file
  metadata_file = '3-1.json'
  if params.metadata?
    metadata_file = params.metadata
  root.quizmode = true
  $('#viewer').attr 'src', video_file
  $('#viewer').on 'loadedmetadata', ->
    $.get metadata_file, (data) ->
      root.videoWidth = $('#viewer')[0].videoWidth
      root.videoHeight = $('#viewer')[0].videoHeight
      root.videoDuration = $('#viewer')[0].duration
      root.annotations = annotations = processAnnotations(data)
      setupViewer()

