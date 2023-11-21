import React, { Component } from "react";

import {
  RequestModalMain,
  RequestModalPadding,
  RequestModalInner
} from "./style";

class RequestWrapper extends Component {

  render() {
    const { children } = this.props;
    return (
      <RequestModalMain>
        <RequestModalPadding>
          <RequestModalInner>
            {children}
          </RequestModalInner>
        </RequestModalPadding>
      </RequestModalMain>
    );
  }
}

export default RequestWrapper;
