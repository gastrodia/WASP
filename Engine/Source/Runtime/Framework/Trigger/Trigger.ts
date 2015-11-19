abstract class TriggerBase{
  constructor(public triggerData,public factory:TriggerFactory,public parentTrigger?:TriggerBase){
    debugger;
  }

  isAsync():boolean {
            return true;
        }

  abstract execute(complete?:()=>void);
}
class CommonTrigger extends TriggerBase{
  execute(complete?:()=>void){
    debugger;
    complete && complete();
  };
}


class TriggerFactory{
  createTrigger(triggerData,parentTrigger?:TriggerBase):TriggerBase{
    return new CommonTrigger(triggerData, this);
  }

  createFlow(flowId:string, complete:(triggerFlow:TriggerFlow)=>void,parentTrigger?:TriggerFactory){
    var triggerData = require('./TriggerData');
    var flowData = triggerData[flowId];
    complete(new TriggerFlow(flowId, flowData, this));
  }
}

class TriggerFlow{
  private _triggers:TriggerBase[] = [];
  constructor(private _flowId:string,flowData,private _factory:TriggerFactory,parentTrigger?:TriggerBase){
    for(let triggerData of flowData.triggers) {
        this._triggers.push(this._factory.createTrigger(triggerData,parentTrigger));
    }
  }

  executeFlow(complete?:()=>void){
    var idx = 0;
    var triggerNext = () => {
        var trigger = this._triggers[idx++];
        if(!trigger) {
            complete && complete();
            return;
        }
        if(trigger.isAsync()) {
            trigger.execute(triggerNext);
        } else {
            trigger.execute();
            triggerNext();
        }
    };
    triggerNext();
  }
}



var triggerFactory:TriggerFactory = new TriggerFactory();
triggerFactory.createFlow('Tr1010101',(triggerFlow:TriggerFlow)=>{
  triggerFlow.executeFlow();
});
