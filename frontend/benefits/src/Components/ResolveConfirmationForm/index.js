import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { cancelSignup } from "../../store/actions/utilities";
import { navigateTo } from "../../store/actions/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import { showNotification } from "../../store/actions/notification";
import authenticated from "../../store/actions/authentication";
import {
  ResolveConfirmationFormMain,
  ResolveConfirmationHeader,
  ResolveConfirmationHeaderMessage,
  ResolveConfirmationButton
} from "./style";
import {
  FormContainer,
  Button
} from "../../global-components";

class ResolveConfirmationForm extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isLoading: false
    };
  }

  static propTypes = {
    cancelSignup: PropTypes.func.isRequired
  }

  handleSubmit = async (event) => {
    const { set, email, cancelSignup, navigateTo, showNotification } = this.props;
    this.setState({ isLoading: true });
    event.preventDefault();
    const cancelled = await cancelSignup(email, true);
    this.setState({ isLoading: false });
    set("confirmationRequired", false);
    if (cancelled.deleted) navigateTo("/login", `?email=${email}`);
    showNotification("success", "Registration Cancelled", "Something went wrong during your registration. Please try registering again.");
  };

  logOut = () => {
    let { logOut, set } = this.props;
    set("confirmationRequired", false);
    logOut();
  };

  componentWillUnmount() {
    this.setState({ isLoading: false });
  }

  render() {
    let { email } = this.props;
    const { isLoading } = this.state;

    return (
      <FormContainer onSubmit={this.handleSubmit}>
        <ResolveConfirmationFormMain>
          <ResolveConfirmationHeader>Something Went Wrong</ResolveConfirmationHeader>
          <ResolveConfirmationHeaderMessage>Your registration was not successful. To resolve this issue, please click the <b>Resolve</b> button below and complete registration again.</ResolveConfirmationHeaderMessage>
          <ResolveConfirmationButton nomargin disabled={!email} type="submit" secondary green outline>{isLoading ? <FontAwesomeIcon icon={["far", "spinner"]} spin /> : "Resolve"}</ResolveConfirmationButton>
          <Button marginleft={10} type="button" outline blue onClick={() => this.logOut()}>Log out</Button>
        </ResolveConfirmationFormMain>
      </FormContainer>
    );
  }
}

const mapStateToProps = (state) => ({});
const dispatchToProps = (dispatch) => ({
  cancelSignup: (email, restart) => dispatch(cancelSignup(email, restart)),
  navigateTo: (location, query) => dispatch(navigateTo(location, query)),
  logOut: () => dispatch(authenticated.logOut()),
  showNotification: (type, title, message) => dispatch(showNotification(type, title, message))
});
export default connect(mapStateToProps, dispatchToProps)(ResolveConfirmationForm);
