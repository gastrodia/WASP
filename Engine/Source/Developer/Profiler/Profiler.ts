
/**
 * Create a profiler with name testName to monitor the execution time of a route
 * The profiler has two arguments: a step msg and an optional reset for the internal timer
 * It will display the execution time per step and total from latest rest
 *
 * Optional logToConsole flag, which defaults to true, causes steps to be printed to console.
 * otherwise, they can be accessed from Profiler.steps array.
 */


class Profiler{
  name:string;
  steps = [];
  sinceBeginning = null;
  lastStep = null;
  logToConsole:boolean;
  precision:string;
  divisor = 1;

  formatTime(time, precision) {
    var str = '';
    var ms = Math.floor(time/1e6);
    if(ms >= 10){
      str = ms + ' ms';
    }else{
      var us = Math.floor(time/1e3);
      if(us >= 10){
        str = us + ' us';
      }else{
        str = time + ' ns';
      }

    }
    return str;
  }

  // get time in ns
  getTime():number {
    if( window.performance){
      let t = window.performance.now();
      return t * 1e6;
    }else{
      let t = process.hrtime();
      return (t[0] * 1e9 + t[1]);
    }

  }


  constructor(name:string, logToConsole?:boolean, precision?:string) {
    this.name = name;
    this.logToConsole = typeof(logToConsole) === 'undefined' ? true : logToConsole;
    this.precision = typeof(precision) === 'undefined' ? 'ms' : precision

    if (precision === 'ms') this.divisor = 1e6;
  }

  beginProfiling() {
    if (this.logToConsole) { console.log(this.name + ' - Begin profiling'); }
    this.resetTimers();
  }

  resetTimers() {
    this.sinceBeginning = this.getTime();
    this.lastStep = this.getTime();
    this.steps.push(['BEGIN_TIMER', this.lastStep])
  }

  elapsedSinceBeginning() {
    return (this.getTime() - this.sinceBeginning) / this.divisor;
  }

  elapsedSinceLastStep() {
    return (this.getTime() - this.lastStep) / this.divisor;
  }

  getSteps() {
    var divisor = this.divisor;

    return this.steps.map(function(curr, index, arr) {
      if (index === 0) return;
      var delta = (curr[1] - arr[index-1][1]);
      return [curr[0], (delta / divisor)];
    }).slice(1);
  }

  step(msg) {
    if (!this.sinceBeginning || !this.lastStep) {
      console.log(`${this.name} - ${msg} - You must call beginProfiling before registering steps`);
      return;
    }

    if (this.logToConsole) {
      console.log(

        `${this.name} - ${msg} - - ${this.formatTime(this.elapsedSinceLastStep(), this.precision)} (total: ${this.formatTime(this.elapsedSinceBeginning(), this.precision)})`
      );
    }

    this.lastStep = this.getTime();
    this.steps.push([msg, this.lastStep]);
  };
}


export = Profiler;
