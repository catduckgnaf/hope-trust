import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import { Col } from "react-simple-flex-grid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  RowBody,
  RowBodyPadding,
  SwitchGroup,
  SwitchLabel,
  RowSectionLegend,
  RowContentSection,
  SwitchLabelText
} from "../../Pages/Settings/style";
import { SliderContainer, SwitchAndLabelRow, RowSectionLegendIcon, RowSectionLegendText, RowContentHeader } from "./style";
import Slider from "react-rangeslider";
import "react-rangeslider/lib/index.css";
import { showNotification } from "../../store/actions/notification";
import { isSelfAccount } from "../../utilities";

const levels = { "off": 0, "view": 1, "edit": 2 };
const SlideContainer = (props) => {
  let horizontalLabels = {};
  props.options.forEach((option, index) => horizontalLabels[index] = option);
  const makeLabel = (value) => horizontalLabels[props.level];
  return (
    <SliderContainer xs={12} sm={12} md={12} lg={3} xl={3}>
      <Slider
        min={0}
        max={props.max}
        value={props.level}
        labels={horizontalLabels}
        format={makeLabel}
        onChange={(value) => props.changePermissionSlider ? props.changePermissionSlider(value, `${props.category}-level`) : null}
        onChangeComplete={() => props.setPermission(props.category, horizontalLabels[props.level])}
        className={props.className}
      />
    </SliderContainer>
  );
};

class RelationshipPermissionsSettings extends Component {

  static propTypes = {
    showNotification: PropTypes.func.isRequired,
  }
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { accounts, user, session, account_id } = this.props;
    let account = accounts.find((account) => account.account_id === session.account_id);
    if (account_id) account = accounts.find((account) => account.account_id === account_id);
    const allowed_permissions = (user.is_partner && !session.is_switching && !account_id) ? (account.partner_plan.permissions || []) : (account.user_plan.permissions || []);
    let current_permissions = account.permissions;
    this.state = { account, allowed_permissions, current_permissions };
  }

  componentDidMount() {
    const { defaults, setPermission } = this.props;
    let prependage;
    let appendage;
    defaults.forEach((current_permission) => {
      if (current_permission.includes("view")) {
        let broken = current_permission.split("-");
        appendage = broken[broken.length - 1]; //ie: view
        prependage = current_permission.split("-view")[0]; // ie: grantor-assets
      } else if (current_permission.includes("edit")) {
        let broken = current_permission.split("-");
        appendage = broken[broken.length - 1];
        prependage = current_permission.split("-edit")[0];
      } else {
        appendage = "view";
        prependage = current_permission;
      }
      if (prependage && appendage) {
        if (defaults.includes(`${prependage}-view`) && defaults.includes(`${prependage}-edit`)) {
          this.changePermissionSlider(levels["edit"], `${prependage}-level`);
          setPermission(prependage, "edit");
        } else {
          this.changePermissionSlider(levels[appendage], `${prependage}-level`);
          setPermission(prependage, appendage);
        }
      }
    });
  }

  changePermissionSlider = (value, category) => this.setState({ [category]: value });

  render() {
    const { setPermission, disabled, user, hide_header = false } = this.props;
    const { allowed_permissions = [], current_permissions = [], account } = this.state;
    return (
      <RowBody>
        {!hide_header
          ? <RowContentHeader span={12}>Permissions</RowContentHeader>
          : null
        }
        <RowContentSection span={12}>
          <RowBodyPadding nopadding={hide_header ? 1 : 0}>
            <Col span={12}>
              {["finance-view", "finance-edit"].every((p) => allowed_permissions.includes(p)) && ["finance-view", "finance-edit"].every((p) => current_permissions.includes(p)) && account.features && account.features.finances
                ? (
                  <>
                    <SwitchAndLabelRow>
                      <Col span={12}>
                        <SwitchGroup>
                          <RowSectionLegend span={12} marginbottom={10}>
                            <RowSectionLegendIcon>
                              <FontAwesomeIcon icon={["fad", "usd-circle"]} />
                            </RowSectionLegendIcon> <RowSectionLegendText>Finances</RowSectionLegendText>
                          </RowSectionLegend>
                          <SwitchLabel xs={12} sm={12} md={12} lg={9} xl={9}>
                            <SwitchLabelText>Allow limited or full access to Financial Data, Income, Beneficiary Assets, Financial Surveys, & Financial Overview</SwitchLabelText>
                          </SwitchLabel>
                          <SlideContainer
                            width={200}
                            max={2}
                            category="finance"
                            options={["off", "view", "edit"]}
                            level={this.state["finance-level"]}
                            setPermission={setPermission}
                            changePermissionSlider={!disabled ? this.changePermissionSlider : null}
                            className={disabled ? "disabled" : null}
                          />
                        </SwitchGroup>
                      </Col>
                    </SwitchAndLabelRow>
                  </>
                )
                : null
              }
              {["myto-view", "myto-edit"].every((p) => allowed_permissions.includes(p)) && ["myto-view", "myto-edit"].every((p) => current_permissions.includes(p)) && account.features && account.features.finances
                ? (
                  <>
                    <SwitchAndLabelRow>
                      <Col span={12}>
                        <SwitchGroup>
                          <RowSectionLegend span={12} marginbottom={10}>
                            <RowSectionLegendIcon>
                              <FontAwesomeIcon icon={["fad", "usd-circle"]} />
                            </RowSectionLegendIcon> <RowSectionLegendText>Access MYTO simulations</RowSectionLegendText>
                          </RowSectionLegend>
                          <SwitchLabel xs={12} sm={12} md={12} lg={9} xl={9}>
                            <SwitchLabelText>Allow limited or full access to run financial simulations using Assets, Income, and Expenses</SwitchLabelText>
                          </SwitchLabel>
                          <SlideContainer
                            width={200}
                            max={2}
                            category="myto"
                            options={["off", "view", "edit"]}
                            level={this.state["myto-level"]}
                            setPermission={setPermission}
                            changePermissionSlider={!disabled ? this.changePermissionSlider : null}
                            className={disabled ? "disabled" : null}
                          />
                        </SwitchGroup>
                      </Col>
                    </SwitchAndLabelRow>
                  </>
                )
                : null
              }

              {["budget-view", "budget-edit"].every((p) => allowed_permissions.includes(p)) && ["budget-view", "budget-edit"].every((p) => current_permissions.includes(p)) && account.features && account.features.finances
                ? (
                  <>
                    <SwitchAndLabelRow>
                      <Col span={12}>
                        <SwitchGroup>
                          <RowSectionLegend span={12} marginbottom={10}>
                            <RowSectionLegendIcon>
                              <FontAwesomeIcon icon={["fad", "usd-circle"]} />
                            </RowSectionLegendIcon> <RowSectionLegendText>Financial Budgeting</RowSectionLegendText>
                          </RowSectionLegend>
                          <SwitchLabel xs={12} sm={12} md={12} lg={9} xl={9}>
                            <SwitchLabelText>Allow limited or full access to Expense details, monthly budgets, and expense categories</SwitchLabelText>
                          </SwitchLabel>
                          <SlideContainer
                            width={200}
                            max={2}
                            category="budget"
                            options={["off", "view", "edit"]}
                            level={this.state["budget-level"]}
                            setPermission={setPermission}
                            changePermissionSlider={!disabled ? this.changePermissionSlider : null}
                            className={disabled ? "disabled" : null}
                          />
                        </SwitchGroup>
                      </Col>
                    </SwitchAndLabelRow>
                  </>
                )
                : null
              }

              {["grantor-assets-view", "grantor-assets-edit"].every((p) => allowed_permissions.includes(p)) && ["grantor-assets-view", "grantor-assets-edit"].every((p) => current_permissions.includes(p)) && account.features && account.features.finances
                ? (
                  <>
                    <SwitchAndLabelRow>
                      <Col span={12}>
                        <SwitchGroup>
                          <RowSectionLegend span={12} marginbottom={10}>
                            <RowSectionLegendIcon>
                              <FontAwesomeIcon icon={["fad", "usd-circle"]} />
                            </RowSectionLegendIcon> <RowSectionLegendText>{isSelfAccount(account, user) ? "Trust Assets" : "Grantor Assets"}</RowSectionLegendText>
                          </RowSectionLegend>
                          <SwitchLabel xs={12} sm={12} md={12} lg={9} xl={9}>
                            <SwitchLabelText>Allow limited or full access to managing {isSelfAccount(account, user) ? "Trust" : "Grantor"} Assets</SwitchLabelText>
                          </SwitchLabel>
                          <SlideContainer
                            width={200}
                            max={2}
                            category="grantor-assets"
                            options={["off", "view", "edit"]}
                            level={this.state["grantor-assets-level"]}
                            setPermission={setPermission}
                            changePermissionSlider={!disabled ? this.changePermissionSlider : null}
                            className={disabled ? "disabled" : null}
                          />
                        </SwitchGroup>
                      </Col>
                    </SwitchAndLabelRow>
                  </>
                )
                : null
              }

              {["account-admin-view", "account-admin-edit"].every((p) => allowed_permissions.includes(p)) && ["account-admin-view", "account-admin-edit"].every((p) => current_permissions.includes(p))
                ? (
                  <>
                    <SwitchAndLabelRow>
                      <Col span={12}>
                        <SwitchGroup>
                          <RowSectionLegend span={12} marginbottom={10}>
                            <RowSectionLegendIcon>
                              <FontAwesomeIcon icon={["fad", "user-shield"]} />
                            </RowSectionLegendIcon> <RowSectionLegendText>Account Management</RowSectionLegendText>
                          </RowSectionLegend>
                          <SwitchLabel xs={12} sm={12} md={12} lg={9} xl={9}>
                            <SwitchLabelText>Allow limited or full access to Account Management, Relationship Management, and Account configuration</SwitchLabelText>
                          </SwitchLabel>
                          <SlideContainer
                            width={200}
                            max={2}
                            category="account-admin"
                            options={["off", "view", "edit"]}
                            level={this.state["account-admin-level"]}
                            setPermission={setPermission}
                            changePermissionSlider={!disabled ? this.changePermissionSlider : null}
                            className={disabled ? "disabled" : null}
                          />
                        </SwitchGroup>
                      </Col>
                    </SwitchAndLabelRow>
                  </>
                )
                : null
              }

              {["health-and-life-view", "health-and-life-edit"].every((p) => allowed_permissions.includes(p)) && ["health-and-life-view", "health-and-life-edit"].every((p) => current_permissions.includes(p))
                ? (
                  <>
                    <SwitchAndLabelRow>
                      <Col span={12}>
                        <SwitchGroup>
                          <RowSectionLegend span={12} marginbottom={10}>
                            <RowSectionLegendIcon>
                              <FontAwesomeIcon icon={["fad", "heartbeat"]} />
                            </RowSectionLegendIcon> <RowSectionLegendText>Health & Life</RowSectionLegendText>
                          </RowSectionLegend>
                          <SwitchLabel xs={12} sm={12} md={12} lg={9} xl={9}>
                            <SwitchLabelText>Allow limited or full access to alter Health Surveys, Health Overview, Providers, Medications and Scheduling</SwitchLabelText>
                          </SwitchLabel>
                          <SlideContainer
                            width={200}
                            max={2}
                            category="health-and-life"
                            options={["off", "view", "edit"]}
                            level={this.state["health-and-life-level"]}
                            setPermission={setPermission}
                            changePermissionSlider={!disabled ? this.changePermissionSlider : null}
                            className={disabled ? "disabled" : null}
                          />
                        </SwitchGroup>
                      </Col>
                    </SwitchAndLabelRow>
                  </>
                )
                : null
              }

              {["request-hcc-view", "request-hcc-edit"].every((p) => allowed_permissions.includes(p)) && ["request-hcc-view", "request-hcc-edit"].every((p) => current_permissions.includes(p)) && account.features && account.features.care_coordination
                ? (
                  <>
                    <SwitchAndLabelRow>
                      <Col span={12}>
                        <SwitchGroup>
                          <RowSectionLegend span={12} marginbottom={10}>
                            <RowSectionLegendIcon>
                              <FontAwesomeIcon icon={["fad", "user-headset"]} />
                            </RowSectionLegendIcon> <RowSectionLegendText>Request Hope Care Coordination</RowSectionLegendText>
                          </RowSectionLegend>
                          <SwitchLabel xs={12} sm={12} md={12} lg={9} xl={9}>
                            <SwitchLabelText>Allow limited or full access to request services including: Money, Medical, Food, Transportation and custom requests</SwitchLabelText>
                          </SwitchLabel>
                          <SlideContainer
                            width={200}
                            max={2}
                            category="request-hcc"
                            options={["off", "view", "edit"]}
                            level={this.state["request-hcc-level"]}
                            setPermission={setPermission}
                            changePermissionSlider={!disabled ? this.changePermissionSlider : null}
                            className={disabled ? "disabled" : null}
                          />
                        </SwitchGroup>
                      </Col>
                    </SwitchAndLabelRow>
                  </>
                )
                : null
              }

            </Col>
          </RowBodyPadding>
        </RowContentSection>
      </RowBody>
    );
  }
}

const mapStateToProps = (state) => ({
  accounts: state.accounts,
  user: state.user,
  session: state.session
});
const dispatchToProps = (dispatch) => ({
  showNotification: (type, title, message, metadata) => dispatch(showNotification(type, title, message, metadata))
});
export default connect(mapStateToProps, dispatchToProps)(RelationshipPermissionsSettings);
