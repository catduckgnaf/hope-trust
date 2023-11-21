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
import { advisor_types } from "../../store/actions/partners";

class PartnerChooser extends Component {
  static propTypes = {
    stateConsumer: PropTypes.func.isRequired
  }
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { customer_support, plans } = props;
    
    const account_groups = plans.active_partner_plans.map((pl) => {
      const accounts = customer_support.partners.filter((p) => (p.plan_id && p.plan_id === pl.price_id) && pl.monthly && p.subscription_id && (p.partner_type === pl.type));
      const option_items = accounts.map((a) => {
        return { value: a, label: `${a.first_name} ${a.last_name}` };
      });
      return { options: option_items, label: `${pl.name} - ${advisor_types.find((at) => at.name === pl.type).alias}` };
    });

    this.state = {
      account_groups
    };
  }

  render() {
    const { stateConsumer, stateRetriever } = this.props;
    const { account_groups } = this.state;
    const partner = stateRetriever("partner");
    return (
      <RelationshipTiles>
        <RelationshipHeaderText>Below are current partner accounts on a paid subscription. These accounts are currently eligible for sponsoring client subscriptions. Choose a partner from the list below.</RelationshipHeaderText>
        <RelationshipTileRow gutter={20}>
          <RelationshipSelectContainer span={12}>
            <InputWrapper>
              <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Partner Account</InputLabel>
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
                name="partner"
                placeholder="Choose a partner..."
                clearValue={() => stateConsumer("partner", false)}
                onChange={(val) => stateConsumer("partner", val ? val.value : "")}
                value={(partner) ? { value: partner, label: `${partner.first_name} ${partner.last_name}` } : null}
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
  customer_support: state.customer_support,
  plans: state.plans
});
const dispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, dispatchToProps)(PartnerChooser);