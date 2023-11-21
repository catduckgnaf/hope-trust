import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { customerServiceGetAllUsers, openUserUpdateModal } from "../../store/actions/customer-support";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import GenericTable from "../GenericTable";
import moment from "moment";
import { nestedFilter } from "../../utilities";
import { users_table_columns } from "../../column-definitions";
import {
  ViewContainer
} from "../../global-components";
import {
  UsersMain,
  UsersPadding,
  UsersInner,
  OnlineNow,
  OnlineIndicator
} from "./style";
import firebase from "../../firebase";
import { getDatabase, ref, update, onValue, query, orderByChild, equalTo } from "firebase/database";
import { navigateTo } from "../../store/actions/navigation";
import { openPushNotificationModal } from "../../store/actions/notification";
const db = getDatabase(firebase);

class Users extends Component {

  constructor(props) {
    super(props);
    const { customer_support, location } = props;
    document.title = "Users";
    const account_id = location.query.account_id || "";
    const customer_ids = location.query.customer_ids || "";
    const cognito_ids = location.query.cognito_ids || "";
    let filter = {};
    Object.keys(location.query).forEach((key) => filter[key] = [location.query[key]]);
    window.history.pushState({}, "Users", window.location.pathname);
    let users = [];
    if (account_id) {
      users = customer_support.users.filter((u) => u.accounts ? u.accounts.split(",").includes(account_id) : false);
    } else if (customer_ids) {
      users = customer_support.users.filter((u) => customer_ids.split(",").includes(u.customer_id));
    } else if (cognito_ids) {
      users = customer_support.users.filter((u) => cognito_ids.split(", ").includes(u.cognito_id));
    } else if (Object.keys(filter).length) {
      users = nestedFilter(customer_support.users, filter);
    }
    this.state = {
      users,
      online: {},
      viewing_online: !!cognito_ids,
      unsubscribe: null
    };
  }

  componentDidMount() {
    const users_ref = query(ref(db, `online/${process.env.REACT_APP_STAGE || "development"}`), orderByChild("online"), equalTo(true));
    const unsubscribe = onValue(users_ref, (snapshot) => {
      const online = snapshot.val();
      Object.keys(online || {}).forEach((id) => {
        if (online[id].last_activity && moment(online[id].last_activity).isBefore(moment(Date.now()).subtract(10, "hour"))) {
          const user_ref = ref(db, `online/${process.env.REACT_APP_STAGE || "development"}/${id}`);
          update(user_ref, { online: false, idle: false });
          delete online[id];
        };
      });
      const actual = Object.keys(online || {});
      this.setState({ online: actual });
    });
    this.setState({ unsubscribe });
  }

  componentWillUnmount() {
    const { unsubscribe } = this.state;
    if (unsubscribe) unsubscribe();
  }

  render() {
    const { customer_support, openPushNotificationModal, location } = this.props;
    const { users, online } = this.state;
    return (
      <ViewContainer margintop={10}>
        <UsersMain>
          <UsersPadding>
            <UsersInner>
              <GenericTable
                permissions={["hopetrust-users-edit"]}
                getData={customerServiceGetAllUsers}
                onRefresh={localStorage.removeItem("react-avatar/failing")}
                columns={users_table_columns}
                page_size={25}
                data_path={["customer_support", "users"]}
                initial_data={users}
                loading={customer_support.isFetchingAllUsers}
                requested={customer_support.requestedAllUsers}
                header="Users"
                additional_info={(
                  <>
                    <OnlineNow onClick={() => {
                      if (online.length){
                        this.setState({ viewing_online: true, users: customer_support.users.filter((u) => online.includes(u.cognito_id)) });
                      }
                    }} clickable={online.length ? 1 : 0}>{online.length ? `${online.length} ${online.length === 1 ? "user" : "users"} online now` : "All users offline"}</OnlineNow>
                    <OnlineIndicator online={online.length ? 1 : 0}>
                      <FontAwesomeIcon icon={["fas", "circle"]} />
                    </OnlineIndicator>
                  </>
                )}
                subscribe={true}
                newRow={{
                  onClick: openUserUpdateModal,
                  arguments: [{}, false, false]
                }}
                additionalButton={{
                  buttonText: !location.query.cognito_ids ? "Push Notification" : `Push notification (${online.length})`,
                  onClick: openPushNotificationModal,
                  arguments: [location.query.cognito_ids ? online : []]
                }}
                filter={{
                  groupName: "and",
                  items: [
                    {
                      field: "status",
                      key: "1",
                      operator: "=",
                      value: "active",
                    }
                  ],
                }}
                paging={true}
                search={true}
                columnResizing={true}
                fields={[
                  {
                    caption: "First Name",
                    name: "first_name",
                    type: "string"
                  },
                  {
                    caption: "Last Name",
                    name: "last_name",
                    type: "string"
                  },
                  {
                    caption: "Full Name",
                    name: "name",
                    type: "string"
                  },
                  {
                    caption: "Customer ID",
                    name: "customer_id",
                    type: "string"
                  },
                  {
                    caption: "Hubspot Contact ID",
                    name: "hubspot_contact_id",
                    type: "string"
                  },
                  {
                    caption: "Cognito ID",
                    name: "cognito_id",
                    type: "string"
                  },
                  {
                    caption: "Email",
                    name: "email",
                    type: "string"
                  },
                  {
                    caption: "State",
                    name: "state",
                    type: "string"
                  },
                  {
                    caption: "Memberships",
                    name: "count",
                    type: "string"
                  },
                  {
                    caption: "Status",
                    name: "status",
                    type: "select",
                    options: [
                      { value: "active", caption: "Active" },
                      { value: "inactive", caption: "Inactive" }
                    ]
                  },
                  {
                    caption: "Is Account Owner",
                    name: "is_account_owner",
                    type: "select",
                    options: [
                      { value: "true", caption: "Yes" },
                      { value: "false", caption: "No" }
                    ]
                  },
                  {
                    caption: "Is Partner",
                    name: "is_partner",
                    type: "select",
                    options: [
                      { value: "true", caption: "Yes" },
                      { value: "false", caption: "No" }
                    ]
                  },
                  {
                    caption: "Logins",
                    name: "logins",
                    type: "number"
                  },
                  {
                    caption: "Created",
                    name: "created_at",
                    type: "date"
                  },
                  {
                    caption: "Last Active",
                    name: "last_activity",
                    type: "date"
                  }
                ]}
              />
            </UsersInner>
          </UsersPadding>
        </UsersMain>
      </ViewContainer>
    );
  }
}

const mapStateToProps = (state) => ({
  customer_support: state.customer_support,
  location: state.router.location
});
const dispatchToProps = (dispatch) => ({
  openPushNotificationModal: (online) => dispatch(openPushNotificationModal(online)),
  customerServiceGetAllUsers: (override) => dispatch(customerServiceGetAllUsers(override)),
  navigateTo: (location, query) => dispatch(navigateTo(location, query))
});
export default connect(mapStateToProps, dispatchToProps)(Users);
