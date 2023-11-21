import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { Button } from "../../global-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { deleteMembership, approveAccountMembership } from "../../store/actions/membership";
import { switchAccounts } from "../../store/actions/account";
import { toastr } from "react-redux-toastr";
import Avatar from "react-avatar";
import moment from "moment";
import {
  AccountCardMain,
  AccountCardPadding,
  AccountCardInner,
  AccountCardSection,
  AccountCardSectionText,
  AccountCardAvatar,
  MobileLabel
} from "./style";

class AccountCard extends Component {

  constructor(props) {
    super(props);
    const { user, session, accounts } = props;
    const account = accounts.find((a) => a.account_id === session.account_id);

    this.state = {
      account,
      is_approving: false,
      is_unlinking: false,
      is_payer: account.subscription && Object.values(account.subscription).length && (account.subscription.customer_id === user.customer_id) && (account.subscription.status === "active")
    };
  }

  approveMembership = async (id) => {
    const { approveAccountMembership } = this.props;
    const approveOptions = {
      onOk: async () => {
        this.setState({ is_approving: true });
        await approveAccountMembership(id, { approved: true, status: "active" });
        this.setState({ is_approving: false });
      },
      onCancel: () => toastr.removeByType("confirms"),
      okText: "Approve",
      cancelText: "Close"
    };
    toastr.confirm("Are you sure you want to approve this account?", approveOptions);
  };

  deleteMembership = async (account) => {
    const { deleteMembership, user } = this.props;
    const { is_payer } = this.state;
    if (user.is_partner && is_payer) {
      const unlinkOptions = {
        onOk: () => toastr.removeByType("confirms"),
        onCancel: () => toastr.removeByType("confirms"),
        okText: "Understood",
        disableCancel: true
      };
      toastr.confirm("You currently manage an active subscription for this account. You will need to cancel this subscription before you can unlink this account.", unlinkOptions);
    } else {
      const unlinkOptions = {
        onOk: async () => {
          this.setState({ is_unlinking: true });
          await deleteMembership(account.id);
          this.setState({ is_unlinking: false });
        },
        onCancel: () => toastr.removeByType("confirms"),
        okText: "Unlink",
        cancelText: "Close"
      };
      toastr.confirm("Are you sure you would like to unlink this account? You will no longer have access.\n\nIf you have added any payment methods on this account, please be sure to remove or replace all credit card information prior to unlinking.", unlinkOptions);
    }
  };
  
  render() {
    const { account, switchAccounts, session, user, plans, updateFilter } = this.props;
    const { is_approving, is_unlinking, is_payer } = this.state;
    const all_plans = [ ...plans.active_user_plans, ...plans.active_partner_plans];
    const plan = all_plans.find((ap) => ap.price_id === account.plan_id);
    const remaining_users = account.users.length - 5;
    return (
      <AccountCardMain>
        <AccountCardPadding>
          <AccountCardInner>
            <AccountCardSection xs={12} sm={12} md={3} lg={3} xl={3}>
              <MobileLabel>Name: </MobileLabel><AccountCardSectionText transform="capitalize">{`${account.first_name} ${account.last_name}`}</AccountCardSectionText>
            </AccountCardSection>
            <AccountCardSection xs={12} sm={12} md={2} lg={2} xl={2}>
              <MobileLabel>Plan: </MobileLabel><AccountCardSectionText transform="capitalize" onClick={() => updateFilter("plan_id", account.plan_id)} clickable>{plan ? plan.name : "N/A" }</AccountCardSectionText>
            </AccountCardSection>
            <AccountCardSection xs={12} sm={12} md={2} lg={2} xl={2}>
              <MobileLabel>Users: </MobileLabel>
              <AccountCardSectionText nopadding>
                {account.users.length
                  ? (
                    <>
                      {account.users.slice(0, 5).map((accountUser, index) => {
                        return (
                          <AccountCardAvatar key={index}>
                            <Avatar
                              src={`https://${process.env.REACT_APP_STAGE || "development"}-api.hopecareplan.com/support/users/get-user-avatar/${accountUser}`}
                              size={30}
                              round
                            />
                          </AccountCardAvatar>
                        );
                      })}
                    </>
                  )
                  : "N/A"
                }
                {account.users.length > 5
                  ? (
                    <AccountCardAvatar>
                      <Avatar
                        name={`+${remaining_users}`}
                        initials={(name, props) => name}
                        size={30}
                        alt={"Additional users"}
                        round
                      />
                    </AccountCardAvatar>
                  )
                  : null
                }
              </AccountCardSectionText>
            </AccountCardSection>
            <AccountCardSection xs={12} sm={12} md={2} lg={2} xl={2}>
              <MobileLabel>Created: </MobileLabel><AccountCardSectionText transform="capitalize">{moment(account.created_at).format("MMMM DD, YYYY")}</AccountCardSectionText>
            </AccountCardSection>
            <AccountCardSection xs={12} sm={12} md={3} lg={3} xl={3}>
              <MobileLabel>Actions: </MobileLabel>
              <AccountCardSectionText nooverflow nopadding>
                {account.approved
                  ? (
                    <AccountCardSectionText paddingtop={3} paddingbottom={3}>
                      {session.account_id === account.account_id
                        ? <Button disabled marginright={5} nomargin small>Current</Button>
                        : (
                          <AccountCardSectionText paddingtop={3} paddingbottom={3}>
                            <Button marginright={5} nomargin green small onClick={() => switchAccounts(account)}>Switch</Button>
                            {(account.account_id !== session.primary_account_id) && (account.cognito_id !== user.cognito_id) && !is_payer
                              ? <Button marginright={5} nomargin danger small onClick={() => this.deleteMembership(account)}>{is_unlinking ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : "Unlink"}</Button>
                              : null
                            }
                          </AccountCardSectionText>
                        )
                      }
                    </AccountCardSectionText>
                  )
                  : null
                }
                {!account.approved
                  ? (
                    <AccountCardSectionText paddingtop={3} paddingbottom={3}>
                      <Button marginright={5} nomargin green small onClick={() => this.approveMembership(account.account_id)}>{is_approving ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : "Approve"}</Button>
                      <Button marginright={5} nomargin danger small onClick={() => this.deleteMembership(account)}>{is_unlinking ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : "Decline"}</Button>
                    </AccountCardSectionText>
                  )
                  : null
                }
              </AccountCardSectionText>
            </AccountCardSection>
          </AccountCardInner>
        </AccountCardPadding>
      </AccountCardMain>
    );
  }
}

const mapStateToProps = (state) => ({
  accounts: state.accounts,
  user: state.user,
  session: state.session,
  plans: state.plans
});
const dispatchToProps = (dispatch) => ({
  switchAccounts: (account) => dispatch(switchAccounts(account)),
  deleteMembership: (id) => dispatch(deleteMembership(id)),
  approveAccountMembership: (id, updates) => dispatch(approveAccountMembership(id, updates))
});
export default connect(mapStateToProps, dispatchToProps)(AccountCard);