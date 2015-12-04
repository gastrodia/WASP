import * as Rx from 'rx';
import WaspWorker from './WebWorker/WaspWorker';
export default class RxWorker{
  private worker;
  constructor(func){
    this.worker = new WaspWorker(func);
  }

  run(args):Rx.Observable<any>{

    var worked = (args,callback)=>{
      this.worker.run(args,callback);
    }

    var rxWorker = Rx.Observable.fromCallback(worked);
    return rxWorker(args);
  }
}
