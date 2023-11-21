import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { toastr } from "react-redux-toastr";
import { openCreateRelationshipModal } from "../../store/actions/relationship";
import { openCreateProviderModal } from "../../store/actions/provider";
import { closeAddNewUserModal, linkAccount, linkAccountByEmail, suggested_partner_permissions } from "../../store/actions/account";
import { showNotification } from "../../store/actions/notification";
import { Row, Col } from "react-simple-flex-grid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Modal } from "react-responsive-modal";
import { navigateTo } from "../../store/actions/navigation";
import {
  Button,
  InputWrapper,
  InputLabel,
  Input,
  HeavyFont
} from "../../global-components";
import {
  AddNewUserInnerModal,
  AddNewUserMainModalTitle,
  AddNewUserMainButtonContainer,
  AddNewUserMainText,
  AddNewUserMainOptionsContainer,
  AddNewUserMainOption,
  AddNewUserMainOptionPadding,
  AddNewUserMainOptionInner,
  AddNewUserIconItem,
  AddNewUserTextItem,
  AddNewUserTextSubItem,
  AddNewUserItemInfo
} from "./style";

class AddNewUserWizard extends Component {

  constructor(props) {
    super(props);
    const { user, session, accounts, relationship } = props;
    const account = accounts.find((account) => account.account_id === session.account_id);
    const currentUser = relationship.list.find((u) => u.cognito_id === user.cognito_id);

    this.state = {
      linking_account_by_referral_code: false,
      referral_code: "",
      linking_account_by_email: false,
      email: "",
      creating_new_relationship: false,
      permissions: currentUser.permissions,
      account
    };

    this.referral_input = React.createRef();
    this.email_input = React.createRef();
  }

  confirmLinkByReferral = async () => {
    const { referral_code } = this.state;
    const { linkAccount, showNotification, openCreateRelationshipModal } = this.props;
    if (referral_code) {
      const linkOptions = {
        onOk: async () => {
          const linked = await linkAccount(referral_code);
          if (linked.success) {
            const suggested_permissions = linked.payload.user.partner_data && suggested_partner_permissions[linked.payload.user.partner_data.partner_type] ? suggested_partner_permissions[linked.payload.user.partner_data.partner_type].permissions : [];
            this.setState({ referral_code: "", linking_account_by_referral_code: false });
            openCreateRelationshipModal({ ...linked.payload.user, permissions: suggested_permissions }, true, false);
          }
        },
        onCancel: () => toastr.removeByType("confirms"),
        okText: "Link Account",
        cancelText: "Cancel"
      };
      toastr.confirm("Are you sure you want to use this referral code? Your account will be accessible by the referral code owner.\n\nRemember to grant proper permissions to your new relationship after linking.\n\nWe will set suggested permissions for your consideration.", linkOptions);
    } else {
      showNotification("error", "Required Field", "You need to enter a referral code.");
    }
  };

  confirmLinkByEmail = async () => {
    const { email } = this.state;
    const { linkAccountByEmail, showNotification, openCreateRelationshipModal } = this.props;
    if (email) {
      const linkOptions = {
        onOk: async () => {
          const linked = await linkAccountByEmail(email);
          if (linked.success) {
            this.setState({ email: "", linking_account_by_email: false });
            openCreateRelationshipModal(linked.payload.user, true, false);
          }
        },
        onCancel: () => toastr.removeByType("confirms"),
        okText: "Link Account",
        cancelText: "Cancel"
      };
      toastr.confirm("Are you sure you want to add this user? Once the user is linked, they will have access to your account.\n\nRemember to grant proper permissions to your new relationship after linking.", linkOptions);
    } else {
      showNotification("error", "Required Field", "You need to enter an email.");
    }
  };

  focusInput = (type) => {
    switch(type) {
      case "referral":
        this.referral_input.current.focus();
        break;
      case "email":
        this.email_input.current.focus();
        break;
      default:
        return false;
    }
  };

  newProvider = () => {
    const { openCreateProviderModal, navigateTo } = this.props;
    navigateTo("/providers");
    openCreateProviderModal({}, false, false);
  };

  render() {
    const { adding_new_user, closeAddNewUserModal, openCreateRelationshipModal, relationship } = this.props;
    const { referral_code, email, linking_account_by_referral_code, linking_account_by_email, permissions, account } = this.state;
    const beneficiary = relationship.list.find((u) => u.type === "beneficiary");

    return (
      <Modal animationDuration={100} styles={{ modal: { maxWidth: "900px", width: "100%", borderRadius: "5px", zIndex: 2147483646 }, overlay: { zIndex: 2147483646 } }} open={adding_new_user} onClose={() => closeAddNewUserModal()} center>
        <AddNewUserInnerModal align="middle" justify="center">
          <Col span={12}>
            <AddNewUserMainModalTitle>Add New Relationship</AddNewUserMainModalTitle>
            <Row>
              <Col span={12}>
                <AddNewUserMainText>
                  There are many ways to add users in your Hope Trust account. You can grant access to professionals by entering their referral code, grant access to other Hope Trust users by entering their account email, or simply create a new relationship in your account by entering their information.
                </AddNewUserMainText>
              </Col>
              <Col span={12}>
                <AddNewUserMainText>All users have custom permissions and tailored access to Hope Trust features.</AddNewUserMainText>
                <AddNewUserMainText>How would you like to add this new user?</AddNewUserMainText>
              </Col>
              <Col span={12}>
                <AddNewUserMainOptionsContainer>
                  <AddNewUserMainOption span={12}>
                    <AddNewUserMainOptionPadding>
                      <AddNewUserMainOptionInner onClick={() => this.setState({ linking_account_by_referral_code: true, linking_account_by_email: false }, () => this.focusInput("referral"))}>
                        <AddNewUserIconItem>
                          <FontAwesomeIcon icon={["fal", "handshake"]} />
                        </AddNewUserIconItem>
                        {!linking_account_by_referral_code
                          ? (
                            <AddNewUserItemInfo>
                              <AddNewUserTextItem>Add a Professional using a Referral Code</AddNewUserTextItem>
                              <AddNewUserTextSubItem>You are working with one of our partner companies (Use the referral code provided by the professional)</AddNewUserTextSubItem>
                            </AddNewUserItemInfo>
                          )
                          : (
                            <InputWrapper width={100} marginbottom={1} paddingleft={20}>
                              <InputLabel>Referral Code</InputLabel>
                              <Input
                                type="text"
                                value={referral_code}
                                onChange={(event) => this.setState({ referral_code: event.target.value })}
                                placeholder="Enter a referral code..."
                                ref={this.referral_input}
                              />
                            </InputWrapper>
                          )
                        }
                      </AddNewUserMainOptionInner>
                    </AddNewUserMainOptionPadding>
                  </AddNewUserMainOption>
                  <AddNewUserMainOption span={12}>
                    <AddNewUserMainOptionPadding>
                      <AddNewUserMainOptionInner onClick={() => this.setState({ linking_account_by_email: true, linking_account_by_referral_code: false }, () => this.focusInput("email"))}>
                        <AddNewUserIconItem>
                          <FontAwesomeIcon icon={["fal", "envelope-open-text"]} />
                        </AddNewUserIconItem>
                        {!linking_account_by_email
                          ? (
                            <AddNewUserItemInfo>
                              <AddNewUserTextItem>Add a Hope Trust user using their Email Address</AddNewUserTextItem>
                              <AddNewUserTextSubItem>You are the creator of more than 1 account (Example: Multiple Children)</AddNewUserTextSubItem>
                            </AddNewUserItemInfo>
                          )
                          : (
                            <InputWrapper width={100} marginbottom={1} paddingleft={20}>
                              <InputLabel>Email Address</InputLabel>
                              <Input
                                type="email"
                                value={email}
                                onChange={(event) => this.setState({ email: event.target.value })}
                                placeholder="Enter an email address..."
                                ref={this.email_input}
                              />
                            </InputWrapper>
                          )
                        }
                      </AddNewUserMainOptionInner>
                    </AddNewUserMainOptionPadding>
                  </AddNewUserMainOption>
                  {permissions.includes("health-and-life-edit") && account.features && account.features.providers
                    ? (
                      <AddNewUserMainOption span={12}>
                        <AddNewUserMainOptionPadding>
                          <AddNewUserMainOptionInner onClick={() => this.newProvider()}>
                            <AddNewUserIconItem>
                              <FontAwesomeIcon icon={["fal", "users-class"]} />
                            </AddNewUserIconItem>
                            <AddNewUserItemInfo>
                              <AddNewUserTextItem>Add a Service or Medical Provider</AddNewUserTextItem>
                              <AddNewUserTextSubItem>This person may not be an account user, but an external relationship who offers support to {beneficiary.first_name} (Example: Dentist)</AddNewUserTextSubItem>
                            </AddNewUserItemInfo>
                          </AddNewUserMainOptionInner>
                        </AddNewUserMainOptionPadding>
                      </AddNewUserMainOption>
                    )
                    : null
                  }
                  <AddNewUserMainOption span={12}>
                    <AddNewUserMainOptionPadding>
                      <AddNewUserMainOptionInner onClick={() => openCreateRelationshipModal({}, false, false)}>
                        <AddNewUserIconItem>
                          <FontAwesomeIcon icon={["fal", "user-plus"]} />
                        </AddNewUserIconItem>
                        <AddNewUserItemInfo>
                          <AddNewUserTextItem>Manually enter information</AddNewUserTextItem>
                          <AddNewUserTextSubItem>You want to add an additional user to your circle of support. <HeavyFont>This user will be given access to the account.</HeavyFont></AddNewUserTextSubItem>
                        </AddNewUserItemInfo>
                      </AddNewUserMainOptionInner>
                    </AddNewUserMainOptionPadding>
                  </AddNewUserMainOption>
              </AddNewUserMainOptionsContainer>
              </Col>
              <Col span={12}>
                <Row>
                  <AddNewUserMainButtonContainer span={12}>
                    {linking_account_by_referral_code
                      ? <Button blue type="button" onClick={() => this.confirmLinkByReferral()}>Link Account</Button>
                      : null
                    }
                    {linking_account_by_email
                      ? <Button blue type="button" onClick={() => this.confirmLinkByEmail()}>Link Account</Button>
                      : null
                    }
                    <Button type="button" onClick={() => closeAddNewUserModal()} green>Cancel</Button>
                  </AddNewUserMainButtonContainer>
                </Row>
              </Col>
            </Row>
          </Col>
       </AddNewUserInnerModal>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  accounts: state.accounts,
  user: state.user,
  session: state.session,
  relationship: state.relationship
});
const dispatchToProps = (dispatch) => ({
  linkAccount: (referral_code) => dispatch(linkAccount(referral_code)),
  linkAccountByEmail: (email) => dispatch(linkAccountByEmail(email)),
  openCreateRelationshipModal: (defaults, updating, viewing) => dispatch(openCreateRelationshipModal(defaults, updating, viewing)),
  openCreateProviderModal: (defaults, updating, viewing) => dispatch(openCreateProviderModal(defaults, updating, viewing)),
  closeAddNewUserModal: () => dispatch(closeAddNewUserModal()),
  showNotification: (type, title, message, metadata) => dispatch(showNotification(type, title, message, metadata)),
  navigateTo: (location, query) => dispatch(navigateTo(location, query)),
});
export default connect(mapStateToProps, dispatchToProps)(AddNewUserWizard);
