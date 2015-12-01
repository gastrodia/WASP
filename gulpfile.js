var gulp = require('gulp');
gulp.task('copy-html', function() {
    gulp.src('./Engine/Source/**/*.html')
    // Perform minification tasks, etc here
    .pipe(gulp.dest('./Engine/Build'));
});

gulp.task('dts-generator',function(){
  require('dts-generator').default({
      name: 'wasp',
      project: './Engine/Build',
      out: './typings/wasp/wasp.d.ts'
  });
})

gulp.task('watch',['copy-html'],function(){
    gulp.watch('./Engine/Source/**/*.html', ['copy-html']);
    //gulp.watch('./Engine/Build/**/*.ts',['dts-generator']);
});
