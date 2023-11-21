import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  WidgetLoaderMain,
  WidgetLoaderPadding,
  WidgetLoaderInner,
  WidgetLoaderIcon,
  WidgetLoaderTitle
} from "./style";

class WidgetLoader extends Component {

  render() {
    return (
      <WidgetLoaderMain xs={12} sm={12} md={12} lg={12} xl={12}>
        <WidgetLoaderPadding>
          <WidgetLoaderInner>
            <WidgetLoaderIcon span={1}><FontAwesomeIcon icon={["fad", "spinner"]} spin /></WidgetLoaderIcon>
            <WidgetLoaderTitle span={11}>Loading...</WidgetLoaderTitle>
          </WidgetLoaderInner>
        </WidgetLoaderPadding>
      </WidgetLoaderMain>
    );
  }
}

const mapStateToProps = (state) => ({});
const dispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, dispatchToProps)(WidgetLoader);
