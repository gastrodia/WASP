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
          var maxPoint = 60 * 3;// 3 seconds
          var formatTime = function(time:Date){
            var str = '';
            str += time.getHours()<10 ? '0' + time.getHours() : time.getHours();
            str += ':';
            str += time.getMinutes()<10? '0'+ time.getMinutes() : time.getMinutes();
            str += ':';
            str += time.getSeconds()<10 ? '0' + time.getSeconds() : time.getSeconds();
            return str;
          }
          var option = {
              tooltip : {
                  trigger: 'axis'
              },
              legend: {
                  data:['FPS','DrawCall']
              },
              animation:false,
              addDataAnimation:false,
              animationThreshold:false,
              animationDuration:0,
              animationDurationUpdate:0,
              toolbox: {
                  show : true,
                  feature : {
                      mark : {show: true},
                      dataZoom : {show: true},
                      dataView : {show: true},
                      magicType : {show: true, type: ['line', 'bar', 'stack', 'tiled']},
                      restore : {show: true},
                      saveAsImage : {show: true}
                    }
                },
                dataZoom : {
                    show : true,
                    realtime: false,
                    start : 66,
                    end : 100
                },
                calculable : true,
                xAxis : [
                    {
                        type : 'category',
                        boundaryGap : false,
                        data : function (){
                            var list = [];
                            var time = new Date();
                            for (var i = 1; i <= maxPoint; i++) {
                                list.push(formatTime(time));
                            }
                            return list;
                        }()
                    }
                ],
                yAxis : [
                    {
                        type : 'value'
                    }
                ],
                series : [
                    {
                        name:'FPS',
                        type:'line',
                        data:function (){
                            var list = [];
                            for (var i = 1; i <= maxPoint; i++) {
                                list.push(0);
                            }
                            return list;
                        }()
                    },
                    {
                        name:'DrawCall',
                        type:'line',
                        data:function (){
                            var list = [];
                            for (var i = 1; i <= maxPoint; i++) {
                                list.push(0);
                            }
                            return list;
                        }()
                    }
                ]
            };

            var lastIndex = maxPoint;
            var axisData;

            var io = require('wasp-socket-client');
            var socket = io('http://localhost:8080');
            var dataArray = [];
            var count = 0;
            var maxArrayCount = 60;
            socket.on('data', function (data) {
              if(count > maxArrayCount){
                addDataArray(dataArray);
                dataArray = [];
                count = 0;
              }else{
                count ++;
                if(count%6 == 0){
                  dataArray.push(data);
                }

              }
            });

            function addData(data){
              lastIndex += 1;
              // 动态数据接口 addData
              myChart.addData([
                  [
                      0,        // 系列索引
                      {         // 新增数据
                          name: formatTime(new Date(data.time)),
                          value: data.fps
                      },
                      false,     // 新增数据是否从队列头部插入
                      false,     // 是否增加队列长度，false则自定删除原有数据，队头插入删队尾，队尾插入删队头
                      formatTime(new Date(data.time))
                  ],
                  [
                      1,        // 系列索引
                      {         // 新增数据
                          name:  formatTime(new Date(data.time)),
                          value:data.drawCall
                      },
                      false,     // 新增数据是否从队列头部插入
                      false      // 是否增加队列长度，false则自定删除原有数据，队头插入删队尾，队尾插入删队头
                  ]
              ]);
            }
            function addDataArray(dataArray){
              for(var i in dataArray){
                var data = dataArray[i];
                addData(data);
              }

            }

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
