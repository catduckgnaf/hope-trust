import React, { Component } from "react";
import {
  DefaultLoaderMain,
  DefaultLoaderImage
} from "./style";
import loader4 from "../../assets/images/loader4.svg";

class DefaultLoader extends Component {

  render() {
    const { width } = this.props;
    return (
      <DefaultLoaderMain>
        <DefaultLoaderImage width={width} src={loader4} alt="Loading..."/>
      </DefaultLoaderMain>
    );
  }
}

export default DefaultLoader;
