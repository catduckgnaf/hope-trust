import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import { Row, Col } from "react-simple-flex-grid";
import { openConvertToPartnerModal } from "../../store/actions/partners";
import {
  RowBody,
  RowHeader,
  RowBodyPadding,
  RowContentSection,
  SettingsButtonContainer
} from "../../Pages/Settings/style";
import { Button } from "../../global-components";
import { toastr } from "react-redux-toastr";
import { ConvertMessage } from "./style";

class ConvertAccount extends Component {
  static propTypes = {
    openConvertToPartnerModal: PropTypes.func.isRequired
  }
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  convertAccount = () => {
    const { openConvertToPartnerModal } = this.props;
    const deleteOptions = {
      onOk: () => openConvertToPartnerModal(),
      onCancel: () => toastr.removeByType("confirms"),
      okText: "Convert",
      cancelText: "Cancel"
    };
    toastr.confirm("Are you sure you want to convert your account? This option should not be chosen unless advised by Hope Trust.\n\nYou will retain all of your linked accounts, your primary account will be your partner account.", deleteOptions);
  };

  render() {
    return (
      <RowBody paddingbottom={20}>
        <RowHeader>
          <Row>
            <Col>Convert Account</Col>
          </Row>
        </RowHeader>
        <RowContentSection span={12}>
        </RowContentSection>
        <RowContentSection span={12}>
          <RowBodyPadding padding={20}>
            <RowContentSection xs={12} sm={12} md={12} lg={12} xl={12}>
              <ConvertMessage>
                This module will convert your user account to a partner account.
              </ConvertMessage>
            </RowContentSection>
          </RowBodyPadding>
        </RowContentSection>
        <RowContentSection span={12}>
          <SettingsButtonContainer span={12}>
            <Button onClick={() => this.convertAccount()} primary danger outline>Convert</Button>
          </SettingsButtonContainer>
        </RowContentSection>
      </RowBody>
    );
  }
}

const mapStateToProps = (state) => ({});
const dispatchToProps = (dispatch) => ({
  openConvertToPartnerModal: () => dispatch(openConvertToPartnerModal())
});
export default connect(mapStateToProps, dispatchToProps)(ConvertAccount);
