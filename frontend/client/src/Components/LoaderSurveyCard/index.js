import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  LoaderSurveyCardMain,
  LoaderSurveyCardPadding,
  LoaderSurveyCardInner,
  LoaderSurveyCardIcon,
  LoaderSurveyCardTitle
} from "./style";

class LoaderSurveyCard extends Component {

  render() {
    const { error, timedOut, pastDelay, retry } = this.props;
    if (error) {
      return (
        <LoaderSurveyCardMain xs={12} sm={12} md={6} lg={4} xl={3} onClick={retry}>
          <LoaderSurveyCardPadding>
            <LoaderSurveyCardInner>
              <LoaderSurveyCardIcon span={1} error><FontAwesomeIcon icon={["fad", "exclamation-circle"]} /></LoaderSurveyCardIcon>
              <LoaderSurveyCardTitle span={9} error>Survey failed to load. Click to retry.</LoaderSurveyCardTitle>
            </LoaderSurveyCardInner>
          </LoaderSurveyCardPadding>
        </LoaderSurveyCardMain>
      );
    } else if (timedOut) {
      return (
        <LoaderSurveyCardMain xs={12} sm={12} md={6} lg={4} xl={3} onClick={retry}>
          <LoaderSurveyCardPadding>
            <LoaderSurveyCardInner>
              <LoaderSurveyCardIcon span={1} warning><FontAwesomeIcon icon={["fad", "alarm-exclamation"]} /></LoaderSurveyCardIcon>
              <LoaderSurveyCardTitle span={9} warning>Survey timed out. Click to retry.</LoaderSurveyCardTitle>
            </LoaderSurveyCardInner>
          </LoaderSurveyCardPadding>
        </LoaderSurveyCardMain>
      );
    } else if (pastDelay) {
      return (
        <LoaderSurveyCardMain xs={12} sm={12} md={6} lg={4} xl={3} onClick={retry}>
          <LoaderSurveyCardPadding>
            <LoaderSurveyCardInner>
              <LoaderSurveyCardIcon span={1}><FontAwesomeIcon icon={["fad", "spinner"]} spin /></LoaderSurveyCardIcon>
              <LoaderSurveyCardTitle span={11}>Taking longer than usual. Click to retry.</LoaderSurveyCardTitle>
            </LoaderSurveyCardInner>
          </LoaderSurveyCardPadding>
        </LoaderSurveyCardMain>
      );
    } else {
      return (
        <LoaderSurveyCardMain xs={12} sm={12} md={6} lg={4} xl={3}>
          <LoaderSurveyCardPadding>
            <LoaderSurveyCardInner>
              <LoaderSurveyCardIcon span={1}><FontAwesomeIcon icon={["fad", "spinner"]} spin /></LoaderSurveyCardIcon>
              <LoaderSurveyCardTitle span={11}>Loading Survey Data...</LoaderSurveyCardTitle>
            </LoaderSurveyCardInner>
          </LoaderSurveyCardPadding>
        </LoaderSurveyCardMain>
      );
    }
  }
}

const mapStateToProps = (state) => ({});
const dispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, dispatchToProps)(LoaderSurveyCard);
