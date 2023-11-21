import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import ReactSelect from "react-select";
import {
  RelationshipTiles,
  RelationshipTileRow,
  RelationshipHeaderText,
  RelationshipSelectContainer
} from "./style";
import {
  InputWrapper,
  InputLabel,
  RequiredStar,
  SelectStyles
} from "../../global-components";

class ClientChooser extends Component {
  static propTypes = {
    stateConsumer: PropTypes.func.isRequired
  }
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { core_accounts, plans, user } = props;
    
    const account_groups = plans.active_user_plans.map((p) => p.name).map((cat) => {
      const accounts = core_accounts.filter((a) => (a.user_plan && a.user_plan.name === cat) && (a.subscription && (a.subscription.customer_id !== user.customer_id)));
      const option_items = accounts.map((a) => {
        return { value: a, label: a.account_name || `${a.first_name} ${a.last_name}` };
      });
      return { options: option_items, label: cat };
    });

    this.state = {
      account_groups
    };
  }

  render() {
    const { stateConsumer, stateRetriever } = this.props;
    const { account_groups } = this.state;
    const account = stateRetriever("account");
    return (
      <RelationshipTiles>
        <RelationshipHeaderText>Below are your current client accounts which are not being managed by you. These accounts are currently paying for their own subscription or are on a Free tier. Choose an account from the list below.</RelationshipHeaderText>
        <RelationshipTileRow gutter={20}>
          <RelationshipSelectContainer span={12}>
            <InputWrapper>
              <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Client Account</InputLabel>
              <ReactSelect
                styles={{
                  container: (base, state) => ({
                    ...base,
                    opacity: state.isDisabled ? ".5" : "1",
                    backgroundColor: "transparent",
                    zIndex: 1001
                  }),
                  menu: (base) => ({
                    ...base,
                    zIndex: 1001,
                    position: "relative"
                  }),
                  placeholder: (base) => ({
                    ...base,
                    fontWeight: 300,
                    fontSize: "13px",
                    lineHeight: "13px",
                    opacity: "0.5"
                  }),
                  menuPortal: (base) => ({
                    ...base,
                    zIndex: 1001
                  }),
                  control: (base) => ({
                    ...base,
                    ...SelectStyles
                  }),
                  valueContainer: (base) => ({
                    ...base,
                    fontSize: "13px",
                    paddingLeft: 0
                  })
                }}
                isClearable
                isSearchable
                name="account"
                placeholder="Choose an account..."
                clearValue={() => stateConsumer("account", "")}
                onChange={(val) => stateConsumer("account", val ? val.value : "")}
                value={(account) ? { value: account, label: account.account_name || `${account.first_name} ${account.last_name}` } : null}
                options={account_groups}
              />
            </InputWrapper>
          </RelationshipSelectContainer>
        </RelationshipTileRow>
      </RelationshipTiles>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
  core_accounts: state.accounts,
  plans: state.plans
});
const dispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, dispatchToProps)(ClientChooser);