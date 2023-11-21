import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import phoneFormatter from "phone-formatter";
import { Button } from "../../global-components";
import { toastr } from "react-redux-toastr";
import ReactAvatar from "react-avatar";
import { deleteRelationship, openCreateRelationshipModal } from "../../store/actions/relationship";
import { approveAccountMembership } from "../../store/actions/account";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";
import {
  RelationshipCardMain,
  RelationshipCardPadding,
  RelationshipCardInner,
  RelationshipCardSection,
  RelationshipCardSectionText,
  RelationshipCardSectionLink,
  MobileLabel,
  RelationshipAvatarContainer,
  OnlineIndicator
} from "./style";
import firebase from "../../firebase";
import { getDatabase, ref, onValue} from "firebase/database";
const db = getDatabase(firebase);

class RelationshipCard extends Component {

  static propTypes = {
    deleteRelationship: PropTypes.func.isRequired,
    openCreateRelationshipModal: PropTypes.func.isRequired,
    permissions: PropTypes.instanceOf(Array).isRequired
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { current_user, session } = props;
    const currentAccount = current_user && current_user.accounts ? current_user.accounts.find((account) => account.account_id === session.account_id) : {};
    this.state = {
      currentAccount,
      presence: {},
      unsubscribe: null
    };
  }

  deleteRelationship = (id) => {
    const { deleteRelationship } = this.props;
    const deleteOptions = {
      onOk: () => deleteRelationship(id),
      onCancel: () => toastr.removeByType("confirms"),
      okText: "Delete",
      cancelText: "Cancel"
    };
    toastr.confirm("Are you sure you want to delete this relationship?", deleteOptions);
  };

  componentDidMount() {
    const { user } = this.props;
    const user_ref = ref(db, `online/${process.env.REACT_APP_STAGE || "development"}/${user.cognito_id}`);
    const unsubscribe = onValue(user_ref, (snapshot) => {
      const data = snapshot.val();
      this.setState({ presence: data || {} });
    });
    this.setState({ unsubscribe });
  }

  componentWillUnmount() {
    const { unsubscribe } = this.state;
    if (unsubscribe) unsubscribe();
  }

  approveUser = async (cognito_id) => {
    const { approveAccountMembership } = this.props;
    await approveAccountMembership(cognito_id);
  };

  render() {
    const { permissions, openCreateRelationshipModal, current_page } = this.props;
    let { user } = this.props;
    const { currentAccount, presence } = this.state;
    user = { ...user, ...presence };
    const can_view = user.permissions.includes("account-admin-view");
    const can_edit = user.permissions.includes("account-admin-edit");
    return (
      <RelationshipCardMain>
        <RelationshipCardPadding>
          <RelationshipCardInner emergency={user.emergency ? 1 : 0} primary={user.primary_contact ? 1 : 0} secondary={user.secondary_contact ? 1 : 0}>
            <RelationshipAvatarContainer>
              <OnlineIndicator idle={user.idle ? 1 : 0} online={user.online ? 1 : 0} title={user.idle ? `Idle for ${moment(user.last_activity).fromNow(true)}` : (user.online ? "Online Now" : "Offline")}>
                <FontAwesomeIcon icon={["fas", "circle"]} />
              </OnlineIndicator>
              <ReactAvatar size={40} src={`https://${process.env.REACT_APP_STAGE || "development"}-api.hopecareplan.com/support/users/get-user-avatar/${user.cognito_id}`} name={`${user.first_name} ${user.last_name}`} round />
            </RelationshipAvatarContainer>
            <RelationshipCardSection xs={12} sm={12} md={3} lg={3} xl={3}>
              <MobileLabel>Name: </MobileLabel><RelationshipCardSectionText paddingleft={30} transform="capitalize">{(`${user.first_name} ${user.last_name}`).substring(0, 20)}{(`${user.first_name} ${user.last_name}`).length > 20 ? "..." : ""}</RelationshipCardSectionText>
            </RelationshipCardSection>
            <RelationshipCardSection xs={12} sm={12} md={2} lg={2} xl={2}>
              <MobileLabel>Phone: </MobileLabel><RelationshipCardSectionLink href={`tel:${user.home_phone}`}>{user.home_phone ? phoneFormatter.format(user.home_phone, "(NNN) NNN-NNNN") : "N/A"}</RelationshipCardSectionLink>
            </RelationshipCardSection>
            <RelationshipCardSection xs={12} sm={12} md={3} lg={3} xl={3}>
              <MobileLabel>Email: </MobileLabel><RelationshipCardSectionLink href={(user.email && !user.email.includes("hopeportalusers")) ? `mailto:${user.email}` : null}>{(user.email && !user.email.includes("hopeportalusers")) ? user.email : "N/A"}</RelationshipCardSectionLink>
            </RelationshipCardSection>
            <RelationshipCardSection xs={12} sm={12} md={2} lg={2} xl={2}>
              <MobileLabel>Administrator: </MobileLabel><RelationshipCardSectionText>{can_view || can_edit ? `Yes${can_edit ? " (Editor)" : " (Read Only)"}` : "No"}</RelationshipCardSectionText>
            </RelationshipCardSection>
            <RelationshipCardSection xs={12} sm={12} md={2} lg={2} xl={2}>
              <MobileLabel>Actions: </MobileLabel>
              {permissions.includes("account-admin-edit")
                  ? (
                    <RelationshipCardSectionText paddingtop={3} paddingbottom={3}>
                      {!user.approved
                        ? <Button marginright={5} nomargin green outline small rounded onClick={() => this.approveUser(user.cognito_id)}>Approve</Button>
                        : null
                      }
                      <Button marginright={5} nomargin blue outline small rounded onClick={() => openCreateRelationshipModal(user, true, false, null, null, current_page)}>Edit</Button>
                      {user.cognito_id !== currentAccount.cognito_id
                        ? <Button nomargin danger outline small rounded onClick={() => this.deleteRelationship(user.cognito_id)}>Delete</Button>
                        : <Button nomargin danger outline small rounded disabled>Delete</Button>
                      }
                    </RelationshipCardSectionText>
                  )
                  : (
                    <RelationshipCardSectionText paddingtop={3} paddingbottom={3}>
                    <Button marginright={5} nomargin blue outline small rounded onClick={() => openCreateRelationshipModal(user, false, true, null, null, current_page)}>View</Button>
                    </RelationshipCardSectionText>
                  )
                }
            </RelationshipCardSection>
          </RelationshipCardInner>
        </RelationshipCardPadding>
      </RelationshipCardMain>
    );
  }
}

const mapStateToProps = (state) => ({
  current_user: state.user,
  session: state.session
});
const dispatchToProps = (dispatch) => ({
  deleteRelationship: (cognito_id) => dispatch(deleteRelationship(cognito_id)),
  approveAccountMembership: (cognito_id) => dispatch(approveAccountMembership(cognito_id)),
  openCreateRelationshipModal: (defaults, updating, viewing, account_id, target_account_id, current_page) => dispatch(openCreateRelationshipModal(defaults, updating, viewing, account_id, target_account_id, current_page))
});
export default connect(mapStateToProps, dispatchToProps)(RelationshipCard);
