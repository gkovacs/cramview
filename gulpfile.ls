require! 'gulp'
require! 'gulp-livescript'
require! 'gulp-nodemon'
require! 'gulp-stylus'
require! 'nib'

gulp.task 'ls', ->
  return gulp.src ['*.ls', '!gulpfile.ls']
  .pipe gulp-livescript({bare: false})
  .pipe gulp.dest('.')

gulp.task 'stylus', ->
  return gulp.src '*.styl'
  .pipe gulp-stylus({use: nib()})
  .pipe gulp.dest('.')

gulp.task 'build', ['ls', 'stylus']

gulp.task 'watch', ->
  gulp.watch ['*.ls', '!gulpfile.ls', '*.styl'], ['ls', 'stylus']

gulp.task 'develop', ->
  gulp-nodemon {script: 'app.js', ext: 'jade ls styl'}
  .on 'restart', ['build']

gulp.task 'default', ['build', 'develop']
