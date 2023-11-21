import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import { isMobile } from "react-device-detect";
import { Button } from "../../global-components";
import { toastr } from "react-redux-toastr";
import { advisor_types } from "../../store/actions/partners";
import ReactAvatar from "react-avatar";
import { deleteRelationship, openCreateRelationshipModal } from "../../store/actions/relationship";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  UsersListCardMain,
  UsersListCardPadding,
  UsersListCardInner,
  UsersListCardInnerSection,
  AvatarContainer,
  OnlineIndicator
} from "./style";
import firebase from "../../firebase";
import moment from "moment";
import { getDatabase, ref, onValue} from "firebase/database";
import { navigateTo } from "../../store/actions/navigation";
const db = getDatabase(firebase);

class UsersListCard extends Component {

  static propTypes = {
    deleteRelationship: PropTypes.func.isRequired
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { accounts, session } = props;
    const currentAccount = accounts.find((account) => account.account_id === session.account_id);
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

  render() {
    const { current_user, openCreateRelationshipModal, navigateTo } = this.props;
    let { user } = this.props;
    const { presence, currentAccount } = this.state;
    const advisor_type = user.is_partner ? advisor_types.find((a) => a.name === user.partner_data.partner_type) : {};
    user = { ...user, ...presence };
    return (
      <UsersListCardMain xs={12} sm={6} md={6} lg={12} xl={12}>
        <UsersListCardPadding>
          <UsersListCardInner emergency={user.emergency ? 1 : 0} primary={user.primary_contact ? 1 : 0} secondary={user.secondary_contact ? 1 : 0}>
            <AvatarContainer>
              <OnlineIndicator idle={user.idle ? 1 : 0} online={user.online ? 1 : 0} title={user.idle ? `Idle for ${moment(user.last_activity).fromNow(true)}` : (user.online ? "Online Now" : "Offline")}>
                <FontAwesomeIcon icon={["fas", "circle"]} />
              </OnlineIndicator>
              <ReactAvatar size={30} src={`https://${process.env.REACT_APP_STAGE || "development"}-api.hopecareplan.com/support/users/get-user-avatar/${user.cognito_id}`} name={`${user.first_name} ${user.last_name}`} round />
            </AvatarContainer>
            <UsersListCardInnerSection span={isMobile ? 6 : 4} text_align="left" transform="capitalize">{(`${user.first_name} ${user.last_name}`).substring(0, 20)}{(`${user.first_name} ${user.last_name}`).length > 20 ? "..." : ""}</UsersListCardInnerSection>
            {!isMobile
              ? <UsersListCardInnerSection span={4} text_align="left" transform="capitalize">{user.type || ((advisor_type.name === "other") ? user.partner_data.title : advisor_type.alias) || "N/A"}</UsersListCardInnerSection>
              : null
            }
            <UsersListCardInnerSection span={isMobile ? 6 : 4} text_align="right">
              {user.cognito_id !== current_user.cognito_id
                ? (
                  <>
                    {currentAccount.permissions.includes("account-admin-edit")
                      ? (
                        <>
                          <Button nomargin blue small onClick={() => openCreateRelationshipModal(user, true, false)}>Edit</Button>
                          {user.type !== "beneficiary" && user.cognito_id !== currentAccount.cognito_id
                            ? <Button marginright={5} danger small onClick={() => this.deleteRelationship(user.cognito_id)}>Delete</Button>
                            : <Button marginright={5} disabled danger small>Delete</Button>
                          }
                        </>
                      )
                      : <Button marginright={5} nomargin blue small onClick={() => openCreateRelationshipModal(user, false, true)}>View</Button>
                    }
                  </>
                )
                : <Button marginright={5} nomargin blue small onClick={() => navigateTo("/settings", "?tab=profile")}>View</Button>
              }
            </UsersListCardInnerSection>
          </UsersListCardInner>
        </UsersListCardPadding>
      </UsersListCardMain>
    );
  }
}

const mapStateToProps = (state) => ({
  accounts: state.accounts,
  current_user: state.user,
  session: state.session
});
const dispatchToProps = (dispatch) => ({
  navigateTo: (location) => dispatch(navigateTo(location)),
  deleteRelationship: (cognito_id) => dispatch(deleteRelationship(cognito_id)),
  openCreateRelationshipModal: (defaults, updating, viewing, account_id, target_account_id, current_page) => dispatch(openCreateRelationshipModal(defaults, updating, viewing, account_id, target_account_id, current_page))
});
export default connect(mapStateToProps, dispatchToProps)(UsersListCard);
