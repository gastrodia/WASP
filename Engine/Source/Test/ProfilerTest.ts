
import Profiler = require('../Developer/Profiler/Profiler');

var profiler = new Profiler('Profiler Test');
profiler.beginProfiling();
profiler.step('1');
setTimeout(
  function(){
    profiler.step('2');
  },1000
)
