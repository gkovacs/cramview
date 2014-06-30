root = exports ? this

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
  for child in data
    if child.start?
      child.start = toSeconds(child.start)
    if child.end?
      child.end = toSeconds(child.end)
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

setThumbnailNoBorder = (thumbnail, time) ->
  thumbnail_src = '/thumbnail?' + $.param {video: root.video_file, time: Math.round(time), width: 640, height: 360}
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
    console.log 'updateViewedMarker'
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

hideReview = ->
  root.review_start_time = 0
  root.review_end_time = 0
  $('#review_area').hide()

hidePreview = ->
  root.preview_start_time = 0
  root.preview_end_time = 0
  $('#preview_area').hide()

showingReview = ->
  return $('#review_area').is(':visible')

showingPreview = ->
  return $('#preview_area').is(':visible')

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
  hideReview()
  root.current_section_idx = getSectionIdxByTime(getVideoTime() + 1.0)
  #setPlaying(true)
  showPreview(root.current_section_idx)
  root.automaticSeeking = false

watchClicked = ->
  $('#preview_area').hide()
  setPlaying(true)

togglePlay = ->
  if showingReview()
    continueClicked()
  else if showingPreview()
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

setupViewer = ->
  root.watched = [false for i in [0 to Math.round(root.videoDuration+0.5)]]
  addTicksToProgressBar()
  #showPreview(0)
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
      if marker_fraction - 0.01 <= fraction <= marker_fraction + 0.01
        fraction = marker_fraction
        section_idx = marker_section
        at_boundary = true
    if false #at_boundary
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
    setSeekThumbnailsToSectionIdx(section_idx, time_in_video)
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
    setSeekThumbnailsToSectionIdx(section_idx, time_in_video)
    setSeekProgressTickToFraction(fraction)
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
  $(document).keydown (evt) ->
    console.log evt.which
    key = evt.which
    if key == 13 # enter
      if showingReview()
        continueClicked()
      else if showingPreview()
        watchClicked()
    if key == 32 # space
      togglePlay()
    if key == 37 # left arrow
      seekTo getVideoTime() - 5
    if key == 39 # right arrow
      seekTo getVideoTime() + 5

root.video_file = null

getUrlParameters = ->
  output = {}
  parts = window.location.href.replace /[?&]+([^=&]+)=([^&]*)/gi, (m,key,value) ->
    output[key] = decodeURI value
  return output

$(document).ready ->
  params = getUrlParameters()
  video_file = '3-1.mp4'
  if params.video?
    video_file = params.video
  root.video_file = video_file
  metadata_file = '3-1.json'
  if params.metadata?
    metadata_file = params.metadata
  $('#viewer').attr 'src', video_file
  $('#viewer').on 'loadedmetadata', ->
    $.get metadata_file, (data) ->
      root.videoDuration = $('#viewer')[0].duration
      root.annotations = annotations = processAnnotations(data)
      setupViewer()

