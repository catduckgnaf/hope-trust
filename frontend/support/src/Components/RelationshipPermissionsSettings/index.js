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
        onChangeComplete={() => props.setPermission(props.category, horizontalLabels[props.level], props.account_id)}
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
    this.state = {};
  }

  componentDidMount() {
    const { defaults, setPermission, account = {}} = this.props;
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
        appendage = "";
        prependage = current_permission;
      }
      if (prependage && appendage) {
        if (defaults.includes(`${prependage}-view`) && defaults.includes(`${prependage}-edit`)) {
          this.changePermissionSlider(levels["edit"], `${prependage}-level`);
          setPermission(prependage, "edit", account.account_id);
        } else {
          this.changePermissionSlider(levels[appendage], `${prependage}-level`);
          setPermission(prependage, appendage, account.account_id);
        }
      }
    });
  }

  changePermissionSlider = (value, category) => this.setState({ [category]: value });

  render() {
    const { membership_type, setPermission, disabled, hide_header = false, account = false } = this.props;
    return (
      <RowBody>
        {!hide_header
          ? <RowContentHeader span={12}>Permissions</RowContentHeader>
          : null
        }
        {account
          ? <RowContentHeader span={12}>Account Permissions for {account.first_name} {account.last_name}</RowContentHeader>
          : null
        }
        <RowContentSection span={12}>
          <RowBodyPadding nopadding={hide_header ? 1 : 0}>
            <Col span={12}>
              {membership_type !== "benefits"
                ? (
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
                          account_id={account.account_id}
                        />
                      </SwitchGroup>
                    </Col>
                  </SwitchAndLabelRow>
                )
                : null
              }
              {membership_type !== "benefits"
                ? (
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
                          account_id={account.account_id}
                        />
                      </SwitchGroup>
                    </Col>
                  </SwitchAndLabelRow>
                )
                : null
              }
              {membership_type !== "benefits"
                ? (
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
                          account_id={account.account_id}
                        />
                      </SwitchGroup>
                    </Col>
                  </SwitchAndLabelRow>
                )
                : null
              }
              {membership_type !== "benefits"
                ? (
                  <SwitchAndLabelRow>
                    <Col span={12}>
                      <SwitchGroup>
                        <RowSectionLegend span={12} marginbottom={10}>
                          <RowSectionLegendIcon>
                            <FontAwesomeIcon icon={["fad", "usd-circle"]} />
                          </RowSectionLegendIcon> <RowSectionLegendText>Grantor Assets</RowSectionLegendText>
                        </RowSectionLegend>
                        <SwitchLabel xs={12} sm={12} md={12} lg={9} xl={9}>
                          <SwitchLabelText>Allow limited or full access to managing Grantor Assets</SwitchLabelText>
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
                          account_id={account.account_id}
                        />
                      </SwitchGroup>
                    </Col>
                  </SwitchAndLabelRow>
                )
                : null
              }
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
                      account_id={account.account_id}
                    />
                  </SwitchGroup>
                </Col>
              </SwitchAndLabelRow>
              {membership_type !== "benefits"
                ? (
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
                          account_id={account.account_id}
                        />
                      </SwitchGroup>
                    </Col>
                  </SwitchAndLabelRow>
                )
                : null
              }
              {membership_type !== "benefits"
                ? (
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
                          account_id={account.account_id}
                        />
                      </SwitchGroup>
                    </Col>
                  </SwitchAndLabelRow>
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
  user: state.user,
  session: state.session
});
const dispatchToProps = (dispatch) => ({
  showNotification: (type, title, message, metadata) => dispatch(showNotification(type, title, message, metadata))
});
export default connect(mapStateToProps, dispatchToProps)(RelationshipPermissionsSettings);
