import React = require("react");

declare module JSX {
  interface ElementClass {
    render: any;
  }
}

interface Props extends React.Props<Report> {

}
 
class Report extends React.Component<Props,{}>{
  render(){
    return <div>Report</div>;
  }
}

export = Report;
