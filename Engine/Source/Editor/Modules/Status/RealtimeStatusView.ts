import sp = require('atom-space-pen-views');
import React = require('react');
import ReactDOM = require('react-dom');
import Report = require('./Report');
import atomUtils = require('../../Atom/atomUtils');
var RealtimeStatusViewURI = "wasp-realtime-status-view:";

require('wasp-chart');
var echarts = (<any>window).echarts;
var echartsTheme = require('../../ChartTheme')

export default class RealtimeStatusView<Options> extends sp.ScrollView{

      static content() {
          return this.div({ class: 'wasp-realtime-status-view' }, () => {
          });

      }

      get $(): JQuery {
          return <any>this;
      }

      constructor() {
          super();
          this.init();
      }
      init() {


        var rootElement:any = this.$[0];
        rootElement.innerHTML = `

        <div id="application">
          <div id="main" style="height:400px"></div>
        </div>

        `;
        setTimeout(()=>{
          // var factory = React.createFactory(Report);
          // ReactDOM.render(
          //         factory(),
          //         this.$.find('#application')[0]
          // );

          var myChart = echarts.init(document.getElementById('main'),echartsTheme);

          var option = {
    title : {
        text: '某楼盘销售情况',
        subtext: '纯属虚构'
    },
    tooltip : {
        trigger: 'axis'
    },
    legend: {
        data:['意向','预购','成交']
    },
    toolbox: {
        show : true,
        feature : {
            mark : {show: true},
            dataView : {show: true, readOnly: false},
            magicType : {show: true, type: ['line', 'bar', 'stack', 'tiled']},
            restore : {show: true},
            saveAsImage : {show: true}
        }
    },
    calculable : true,
    xAxis : [
        {
            type : 'category',
            boundaryGap : false,
            data : ['周一','周二','周三','周四','周五','周六','周日']
        }
    ],
    yAxis : [
        {
            type : 'value'
        }
    ],
    series : [
        {
            name:'成交',
            type:'line',
            smooth:true,
            itemStyle: {normal: {areaStyle: {type: 'default'}}},
            data:[10, 12, 21, 54, 260, 830, 710]
        },
        {
            name:'预购',
            type:'line',
            smooth:true,
            itemStyle: {normal: {areaStyle: {type: 'default'}}},
            data:[30, 182, 434, 791, 390, 30, 10]
        },
        {
            name:'意向',
            type:'line',
            smooth:true,
            itemStyle: {normal: {areaStyle: {type: 'default'}}},
            data:[1320, 1132, 601, 234, 120, 90, 20]
        }
    ]
};


          // 为echarts对象加载数据
          myChart.setOption(option);
        },100);


      }

      getTitle = () => 'RealtimeStatusView'
      getIconName = () => 'git-compare'

      static openView(){
        atom.workspace.open(atomUtils.uriForPath(RealtimeStatusViewURI, ''), {searchAllPanes: true,filePath:''});
      }

      static load(){

              atom.commands.add('atom-workspace', 'wasp:status-view', (e) => {
                console.log('open status view!!!');
                RealtimeStatusView.openView();
              });

              atomUtils.registerOpener({
                  commandSelector: 'atom-workspace',
                  commandName: 'wasp:realtime-status-view',
                  uriProtocol: RealtimeStatusViewURI,
                  onOpen: (data) => {
                      return RealtimeStatusView.getInstance()
                  }
              });
      }

      static instance;
      static getInstance(){
        if(!RealtimeStatusView.instance){
          RealtimeStatusView.instance = new RealtimeStatusView();
        }
        return RealtimeStatusView.instance;
      }
}
