var gulp = require('gulp');
gulp.task('copy-html', function() {
    gulp.src('./Engine/Source/**/*.html')
    // Perform minification tasks, etc here
    .pipe(gulp.dest('./Engine/Build'));
});

gulp.task('watch',['copy-html'],function(){
    gulp.watch('./Engine/Source/**/*.html', ['copy-html']);

});
