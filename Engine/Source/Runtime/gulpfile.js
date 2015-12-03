var gulp = require('gulp');
var dtsGenerator = require('dts-generator').default;

gulp.task('dts-generator',function(){
  dtsGenerator({

    "name":"wasp-runtime",
    "project":"./",
    "out":"./Build/wasp-runtime.d.ts",
    "files":[],
    "sendMessage":console.log
  });
})
