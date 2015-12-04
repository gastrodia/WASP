import RxWorker from './RxWorker';

function abc(args:string,callback:(abc:string)=>{}){
  console.log('do callback abc');
  callback('abc: ' + args);
}

var rxWorker = new RxWorker(abc);


rxWorker.run(123).subscribe(
  function (x) { console.log('onNext: %s', x); },
  function (e) { console.log('onError: %s', e); },
  function ()  { console.log('onCompleted'); }
)
