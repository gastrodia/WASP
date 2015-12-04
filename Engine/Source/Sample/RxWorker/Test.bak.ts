import * as Rx from 'rx';
import WaspWorker from './WebWorker/WaspWorker';
function abc(args:string,callback:(abc:string)=>{}){
  console.log('do callback abc');
  callback('abc: ' + args);
}



var abcWorker = new WaspWorker(abc);

var workedAbc = function<T>(args,callback){
  abcWorker.run(args,callback);
}

var rxAbc = Rx.Observable.fromCallback(workedAbc);
var source = rxAbc(123);
// var subscription = source.subscribe(
//   function (x) { console.log('onNext: %s', x); },
//   function (e) { console.log('onError: %s', e); },
//   function ()  { console.log('onCompleted'); }
// )
