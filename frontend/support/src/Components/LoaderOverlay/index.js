import React, { Component } from "react";
import DefaultLoader from "../DefaultLoader";
import {
  LoaderOverlayMain,
  LoaderOverlayMainPadding,
  LoaderOverlayMainInner,
  LoaderText
} from "./style";

class LoaderOverlay extends Component {

  render() {
    const { show, message } = this.props;
    if (show) {
      return (
        <LoaderOverlayMain show={show}>
          <LoaderOverlayMainPadding>
            <LoaderOverlayMainInner>
              <DefaultLoader width={75}/>
              <LoaderText>{message}</LoaderText>
            </LoaderOverlayMainInner>
          </LoaderOverlayMainPadding>
        </LoaderOverlayMain>
      );
    }
    return null;
  }
}

export default LoaderOverlay;
