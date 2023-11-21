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
    const { stateRetriever, customer_support, plans } = props;
    const partner = stateRetriever("partner");
    
    const account_groups = plans.active_user_plans.map((pl) => {
      const accounts = customer_support.accounts.filter((p) => (p.plan_id && p.plan_id === pl.price_id) && p.subscription_id && (p.customer_id === p.subscription_customer_id) && (p.subscription_customer_id !== partner.customer_id) && p.status === 'active');
      const option_items = accounts.map((a) => {
        return { value: a, label: `${a.first_name} ${a.last_name}` };
      });
      return { options: option_items, label: pl.name };
    });

    this.state = {
      account_groups
    };
  }

  render() {
    const { stateConsumer, stateRetriever, plans } = this.props;
    const { account_groups } = this.state;
    const account = stateRetriever("account");
    return (
      <RelationshipTiles>
        <RelationshipHeaderText>Below are your current client accounts which are not current;y managed by a Hope Trust partner. These accounts are currently paying for their own subscription or are on a Free tier. Choose an account from the list below.</RelationshipHeaderText>
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
                onChange={(val) => {
                  stateConsumer("account", val ? { ...val.value, user_plan: plans.active_user_plans.find((pl) => val.value.plan_id === pl.price_id)} : "")
                }}
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
  plans: state.plans,
  customer_support: state.customer_support
});
const dispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, dispatchToProps)(ClientChooser);