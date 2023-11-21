import React, { Component } from "react";
import PropTypes from "prop-types";
import { Main, Notice, Bold } from "./style";

class NoAccountsRegistration extends Component {
  static propTypes = {
    stateConsumer: PropTypes.func.isRequired,
    stateRetriever: PropTypes.func.isRequired
  }
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { stateRetriever } = this.props;
    return (
    <Main>
      <Notice>
        Hi, <Bold>{stateRetriever("user", true).first_name}</Bold>, looks like you are not a member of any accounts. If you were previously a part of an account, the subscription may have lapsed or the account owner may have closed their account.
      </Notice>
      <Notice>
        You may create a new account by pressing the <Bold>Next</Bold> button below and filling in your information.
      </Notice>
    </Main>
    );
  }
}
export default NoAccountsRegistration;
