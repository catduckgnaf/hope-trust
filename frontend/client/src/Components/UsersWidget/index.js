import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import Container from "../Container";
import UsersListCard from "../UsersListCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { openAddNewUserModal } from "../../store/actions/account";
import { orderBy } from "lodash";
import { isMobile } from "react-device-detect";
import { navigateTo } from "../../store/actions/navigation";
import {
  Error,
  ErrorPadding,
  ErrorInner,
  ErrorInnerRow,
  ErrorIcon,
  ErrorMessage
} from "../../global-components";
import {
  UserListMain,
  UsersListPadding,
  UsersListInner
} from "./style";

class UsersWidget extends Component {
  static propTypes = {
    navigateTo: PropTypes.func.isRequired
  }
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { accounts, session } = this.props;
    const account = accounts.find((account) => account.account_id === session.account_id);
    this.state = {
      currentPermissions: account.permissions,
      account
    };
  }

  render() {
    const { relationship, openAddNewUserModal, navigateTo, id, title, span, height } = this.props;
    const { currentPermissions } = this.state;
    const accountUsers = relationship.list;
    return (
      <Container id={id} title={title} viewall={{ title: "View All", func: () => navigateTo("/users") }} action={currentPermissions.includes("account-admin-edit") ? { title: "Add Relationship", func: () => openAddNewUserModal() } : null} xs={12} sm={12} md={12} lg={span} xl={span} height={height} overflow="auto">
        {accountUsers.length
          ? (
            <UserListMain>
              <UsersListPadding span={12}>
                <UsersListInner gutter={isMobile ? 20 : 0}>
                  {
                    orderBy(accountUsers, ["primary_contact", "secondary_contact", "emergency", "created_at"], ["desc", "desc", "desc", "desc"]).filter((u) => (u.emergency || u.primary_contact || u.secondary_contact))
                    .map((account_user, index) => {
                      return <UsersListCard user={account_user} key={index} />
                    })
                  }
                </UsersListInner>
              </UsersListPadding>
            </UserListMain>
          )
          : (
            <Error span={12}>
              <ErrorPadding>
                <ErrorInner span={12}>
                  <ErrorInnerRow>
                    <ErrorIcon span={12}>
                      <FontAwesomeIcon icon={["fad", "users"]} />
                    </ErrorIcon>
                    <ErrorMessage span={12}>You do not have any core contacts.</ErrorMessage>
                  </ErrorInnerRow>
                </ErrorInner>
              </ErrorPadding>
            </Error>
          )
        }
      </Container>
    );
  }
}

const mapStateToProps = (state) => ({
  accounts: state.accounts,
  session: state.session,
  relationship: state.relationship
});
const dispatchToProps = (dispatch) => ({
  openAddNewUserModal: () => dispatch(openAddNewUserModal()),
  navigateTo: (location, query) => dispatch(navigateTo(location, query))
});
export default connect(mapStateToProps, dispatchToProps)(UsersWidget);
