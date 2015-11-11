import React = require("react");

declare module JSX {
  interface ElementClass {
    render: any;
  }
}

interface Props extends React.Props<UIEditor> {

}

class UIEditor extends React.Component<Props,{}>{
  render(){
    return <div>UIEditor</div>;
  }
}

export = UIEditor;
