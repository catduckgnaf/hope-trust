import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { logEvent } from "../../store/actions/utilities";
import {
  TermsOfServiceCheckMain,
  TermsOfServiceCheckPadding,
  TermsOfServiceCheckInner,
  TermsLabel,
  TermsInput
} from "./style";
import {
  CheckBoxWrapper
} from "../../global-components";

class TermsOfServiceCheck extends Component {

  open = (url, title) => {
    const { user, logEvent } = this.props;
    logEvent(`${title} viewed`, user, "", url);
    window.open(url, title);
  };

  render() {
    const { margintop, title, url, setNewState, accepted, id } = this.props;
    return (
      <TermsOfServiceCheckMain>
        <TermsOfServiceCheckPadding>
          <TermsOfServiceCheckInner>
            <CheckBoxWrapper margintop={margintop}>
              <TermsInput type="checkbox" defaultChecked={accepted} onChange={(event) => setNewState(id, event.target.checked)}/>
              <TermsLabel onClick={() => this.open(url, title)}>I agree to the {title}</TermsLabel>
            </CheckBoxWrapper>
          </TermsOfServiceCheckInner>
        </TermsOfServiceCheckPadding>
      </TermsOfServiceCheckMain>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user
});
const dispatchToProps = (dispatch) => ({
  logEvent: (type, user, element, label) => dispatch(logEvent(type, user, element, label))
});
export default connect(mapStateToProps, dispatchToProps)(TermsOfServiceCheck);
