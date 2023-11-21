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
  SelectStyles,
  InputHint
} from "../../global-components";
import { capitalize } from "lodash";

class BenefitsChooser extends Component {
  static propTypes = {
    stateConsumer: PropTypes.func.isRequired
  }
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { groups } = props;
    
    const group_items = groups.list.map((g) => {
      return { value: g, label: g.name };
    })

    this.state = {
      group_items
    };
  }

  render() {
    const { user, stateConsumer, stateRetriever, agents, teams } = this.props;
    const { group_items } = this.state;
    const current_group = stateRetriever("benefits_group");
    const current_rep = stateRetriever("benefits_rep");
    const current_agent = stateRetriever("benefits_agent");

    let account_groups = ["agent", "team"].map((type) => {
      const accounts = [...agents.list, ...teams.list].filter((p) => p.type === type);
      const option_items = accounts.map((a) => {
        return { value: a, label: (a.name ? `${a.first_name} ${a.last_name} - ${a.name}` : `${a.first_name} ${a.last_name}`) };
      });
      return { options: option_items, label: capitalize(type) };
    });
    if (current_group) {
      account_groups = ["agent", "team"].map((type) => {
        const accounts = [...agents.list, ...teams.list].filter((p) => p.type === type && p.cognito_id === current_group.value.parent_id);
        const option_items = accounts.map((a) => {
          return { value: a, label: (a.name ? `${a.first_name} ${a.last_name} - ${a.name}` : `${a.first_name} ${a.last_name}`) };
        });
        return { options: option_items, label: capitalize(type) };
      });
      if (current_group) account_groups.unshift({ options: [{ value: current_group.value, label: `${current_group.value.first_name} ${current_group.value.last_name} - ${current_group.value.name}` }], label: "Current Group" });
    }
    return (
      <RelationshipTiles>
        <RelationshipHeaderText>Below are the current Groups on the Hope Trust Benefits Network, choose a Group to associate and choose a representative.</RelationshipHeaderText>
        <RelationshipTileRow gutter={20}>
          <RelationshipSelectContainer span={12}>
            <InputWrapper>
              <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Group</InputLabel>
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
                isDisabled={stateRetriever("is_group_entity")}
                name="benefits_group"
                placeholder="Choose a benefits group..."
                clearValue={() => stateConsumer("benefits_group", null)}
                onChange={(val) => {
                  stateConsumer("benefits_group", val ? val : null);
                  if (val && user.benefits_data.type === "team") {
                    const group_agent = agents.list.find((a) => a.cognito_id === val.value.parent_id);
                    if (group_agent) {
                      stateConsumer("benefits_agent", { value: group_agent, label: `${group_agent.first_name} ${group_agent.last_name}` });
                      stateConsumer("independent", false);
                    } else {
                      stateConsumer("benefits_agent", null);
                      stateConsumer("independent", true);
                    }
                  }
                }}
                value={current_group || null}
                options={group_items}
              />
            </InputWrapper>
          </RelationshipSelectContainer>
          <RelationshipSelectContainer span={12}>
            <InputWrapper>
              <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Representative</InputLabel>
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
                isDisabled={stateRetriever("is_entity")}
                name="benefits_rep"
                placeholder="Choose an account representative..."
                clearValue={() => stateConsumer("benefits_rep", null)}
                onChange={(val) => stateConsumer("benefits_rep", val ? val : null)}
                value={current_rep || null}
                options={account_groups}
              />
              {current_group
                ? <InputHint margintop={5}>This client account for {current_group.label} will be onboarded by you. We have pre-filled this choice.</InputHint>
                : null
              }
            </InputWrapper>
          </RelationshipSelectContainer>
          {["group", "team"].includes(user.benefits_data.type) && agents.list.length && !stateRetriever("independent")
            ? (
              <RelationshipSelectContainer span={12}>
                <InputWrapper>
                  <InputLabel marginbottom={10}>Broker Agent</InputLabel>
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
                    isDisabled={stateRetriever("isParentAgent")}
                    name="benefits_agent"
                    placeholder="Choose an associated agent... (optional)"
                    clearValue={() => stateConsumer("benefits_agent", null)}
                    onChange={(val) => stateConsumer("benefits_agent", val ? val : null)}
                    value={current_agent || null}
                    options={agents.list.map((a) => {
                      return { value: a, label: `${a.first_name} ${a.last_name}`};
                    })}
                  />
                  {current_agent && current_group && user.benefits_data.type === "team"
                    ? <InputHint margintop={5}>{current_agent.label} is affiliated with {current_group.label}. We have pre-filled this choice for you.</InputHint>
                    : null
                  }
                </InputWrapper>
              </RelationshipSelectContainer>
            )
            : null
          }
        </RelationshipTileRow>
      </RelationshipTiles>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
  agents: state.agents,
  groups: state.groups,
  teams: state.teams
});
const dispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, dispatchToProps)(BenefitsChooser);