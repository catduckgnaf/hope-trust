import React, { Component } from "react";
import {
  BlankSpaceMain
} from "./style";

class BlankSpace extends Component {

  render() {
    const { top, bottom } = this.props;
    return (
      <BlankSpaceMain top={top} bottom={bottom}/>
    );
  }
}

export default BlankSpace;
