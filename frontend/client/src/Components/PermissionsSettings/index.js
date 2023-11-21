import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import { Row, Col } from "react-simple-flex-grid";
import { dispatchRequest } from "../../store/actions/request";
import { removePermissions } from "../../store/actions/settings";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FormError } from "../../global-components";
import { isSelfAccount } from "../../utilities";
import {
  RowBody,
  RowHeader,
  RowBodyPadding,
  SwitchGroup,
  SwitchLabel,
  SwitchLabelText,
  RowSectionLegend,
  RowContentSection,
  SliderContainer
} from "../../Pages/Settings/style";
import Slider from "react-rangeslider";
import "react-rangeslider/lib/index.css";
import { SavePermissionsButton } from "./style";
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
        onChange={(value) => props.changePermissionSlider(value, `${props.category}-level`)}
        onChangeComplete={() => props.setPermission(props.category, horizontalLabels[props.level])}
      />
    </SliderContainer>
  );
};

class PermissionsSettings extends Component {

  static propTypes = {
    removePermissions: PropTypes.func.isRequired,
    dispatchRequest: PropTypes.func.isRequired,
    showNotification: PropTypes.func.isRequired,
  }
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { accounts, user, session } = this.props;
    const account = accounts.find((account) => account.account_id === session.account_id);
    const allowed_permissions = user.is_partner && !session.is_switching ? (account.partner_plan.permissions || []) : (account.user_plan.permissions || []);

    this.state = {
      permissions: account.permissions,
      adjustedPermissions: {},
      account,
      error: "",
      allowed_permissions,
      is_loading: false
    };
  }

  componentDidMount() {
    const { account } = this.state;
    let prependage;
    let appendage;
    account.permissions.forEach((current_permission) => {
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
        if (account.permissions.includes(`${prependage}-view`) && account.permissions.includes(`${prependage}-edit`)) {
          this.changePermissionSlider(levels["edit"], `${prependage}-level`);
        } else {
          this.changePermissionSlider(levels[appendage], `${prependage}-level`);
        }
      }
    });
  }

  setPermission = (category, id) => {
    let { adjustedPermissions } = this.state;
    adjustedPermissions[`${category}`] = id;
    this.setState({ adjustedPermissions });
  };

  savePermissions = async () => {
    const { removePermissions, showNotification } = this.props;
    const { adjustedPermissions, permissions } = this.state;
    const possibleStatuses = Object.keys(levels);
    let removedPermissions = [];
    let addedPermissions = [];
    let requests = [];

    Object.keys(adjustedPermissions).forEach((key) => {
      const permission = `${key}-${adjustedPermissions[key]}`;
      const possible = possibleStatuses.map((status) => `${key}-${status}`); // all possible variations of this permissions, ie: view, edit
      if (adjustedPermissions[key] === "off") { // if the permission is being turned off
        removedPermissions.push(...possible); // remove all possible variations
      } else if (permissions.includes(permission)) { // if you already have the permission
        if (permission.includes("-view")) { // if its a view permissions
          removedPermissions.push(`${key}-edit`); // remove the edit permission
        } else {
          removedPermissions.push(permission); // if you already have the permission and its an edit permission, remove it
        }
      } else if (!permissions.includes(permission)) {
        addedPermissions.push(permission);
      }
    });

    if (addedPermissions.length) {
      showNotification("success", "Permissions requested", `You requested ${addedPermissions.length} new ${addedPermissions.length === 1 ? "permission" : "permissions"}.`);
      for (let index = 0; index < addedPermissions.length; index++) {
        requests.push(this.handlePermissionRequest(addedPermissions[index]));
      }
    }

    if (removedPermissions.length) requests.push(removePermissions(removedPermissions));
    this.setState({ is_loading: true });
    await Promise.all(requests);
    this.setState({ is_loading: false });
  };

  changePermissionSlider = (value, category) => {
    this.setState({ [category]: value });
  };

  handlePermissionRequest = async (permission) => {
    const { dispatchRequest, user } = this.props;
    const request = await dispatchRequest({
      title: "Permission request",
      request_type: "permission",
      priority: "low",
      body: `${user.first_name} ${user.last_name} is requesting "${permission}" permission.`,
      permission,
      permission_status: "pending"
    });
    if (request.success) {
      this.setState({
        error: "",
        success: request.message
      });
    } else {
      this.setState({
        error: request.error.message
      });
    }
  };

  render() {
    const { error, allowed_permissions, permissions, account, is_loading } = this.state;
    const { user } = this.props;
    return (
      <RowBody id="permissions">
        <RowHeader>
          <Row>
            <Col>Permissions</Col>
          </Row>
        </RowHeader>
        <RowContentSection span={12}>
          <RowBodyPadding padding_override_mobile={20}>
            <Col xs={12} sm={6} md={6} lg={6} xl={6}>
              {["finance-view", "finance-edit"].every((p) => allowed_permissions.includes(p)) && account.features && account.features.finances
                ? (
                  <>
                    <SwitchGroup bordered={1}>
                      <RowSectionLegend span={12} marginbottom={10}>Finances</RowSectionLegend>
                      <SwitchLabel xs={12} sm={12} md={12} lg={9} xl={9}>
                        <SwitchLabelText>Allow limited or full access to Financial Data, Income, Beneficiary Assets, Financial Surveys, & Financial Overview</SwitchLabelText>
                      </SwitchLabel>
                      <SlideContainer
                        width={200}
                        max={2}
                        category="finance"
                        options={["off", "view", "edit"]}
                        level={this.state["finance-level"]}
                        setPermission={this.setPermission}
                        changePermissionSlider={this.changePermissionSlider}
                      />
                    </SwitchGroup>
                  </>
                )
                : null
              }

              {(["myto-view", "myto-edit"].every((p) => allowed_permissions.includes(p)) || ["myto-view", "myto-edit"].every((p) => permissions.includes(p))) && account.features && account.features.finances
                ? (
                  <>
                    <SwitchGroup bordered={1}>
                      <RowSectionLegend span={12} marginbottom={10}>MYTO Simulations</RowSectionLegend>
                      <SwitchLabel xs={12} sm={12} md={12} lg={9} xl={9}>
                        <SwitchLabelText>Allow limited or full access to run financial simulations using Assets, Income, and Expenses</SwitchLabelText>
                      </SwitchLabel>
                      <SlideContainer
                        width={200}
                        max={2}
                        category="myto"
                        options={["off", "view", "edit"]}
                        level={this.state["myto-level"]}
                        setPermission={this.setPermission}
                        changePermissionSlider={this.changePermissionSlider}
                      />
                    </SwitchGroup>
                  </>
                )
                : null
              }

              {["budget-view", "budget-edit"].every((p) => allowed_permissions.includes(p)) && account.features && account.features.finances
                ? (
                  <>
                    <SwitchGroup bordered={1}>
                      <RowSectionLegend span={12} marginbottom={10}>Financial Budgeting</RowSectionLegend>
                      <SwitchLabel xs={12} sm={12} md={12} lg={9} xl={9}>
                        <SwitchLabelText>Allow limited or full access to Expense details, monthly budgets, and expense categories</SwitchLabelText>
                      </SwitchLabel>
                      <SlideContainer
                        width={200}
                        max={2}
                        category="budget"
                        options={["off", "view", "edit"]}
                        level={this.state["budget-level"]}
                        setPermission={this.setPermission}
                        changePermissionSlider={this.changePermissionSlider}
                      />
                    </SwitchGroup>
                  </>
                )
                : null
              }

              {["grantor-assets-view", "grantor-assets-edit"].every((p) => allowed_permissions.includes(p)) && account.features && account.features.finances
                ? (
                  <>
                    <SwitchGroup bordered={1}>
                      <RowSectionLegend span={12} marginbottom={10}>{isSelfAccount(user, account) ? "Trust Assets" : "Grantor Assets"}</RowSectionLegend>
                      <SwitchLabel xs={12} sm={12} md={12} lg={9} xl={9}>
                        <SwitchLabelText>{isSelfAccount(user, account) ? "Allow limited or full access to Trust Assets" : "Allow limited or full access to Grantor Assets"}</SwitchLabelText>
                      </SwitchLabel>
                      <SlideContainer
                        width={200}
                        max={2}
                        category="grantor-assets"
                        options={["off", "view", "edit"]}
                        level={this.state["grantor-assets-level"]}
                        setPermission={this.setPermission}
                        changePermissionSlider={this.changePermissionSlider}
                      />
                    </SwitchGroup>
                  </>
                )
                : null
              }

              {["account-admin-view", "account-admin-edit"].every((p) => allowed_permissions.includes(p))
                ? (
                  <>
                    <SwitchGroup bordered={1}>
                      <RowSectionLegend span={12} marginbottom={10}>Account Management</RowSectionLegend>
                      <SwitchLabel xs={12} sm={12} md={12} lg={9} xl={9}>
                        <SwitchLabelText>Allow limited or full access to Account Management, Relationship Management, and Account configuration</SwitchLabelText>
                      </SwitchLabel>
                      <SlideContainer
                        width={200}
                        max={2}
                        category="account-admin"
                        options={["off", "view", "edit"]}
                        level={this.state["account-admin-level"]}
                        setPermission={this.setPermission}
                        changePermissionSlider={this.changePermissionSlider}
                      />
                    </SwitchGroup>
                  </>
                )
                : null
              }

              {["health-and-life-view", "health-and-life-edit"].every((p) => allowed_permissions.includes(p))
                ? (
                  <>
                    <SwitchGroup bordered={1}>
                      <RowSectionLegend span={12} marginbottom={10}>Health & Life</RowSectionLegend>
                      <SwitchLabel xs={12} sm={12} md={12} lg={9} xl={9}>
                        <SwitchLabelText>Allow limited or full access to alter Health Surveys, Health Overview, Providers, Medications and Scheduling</SwitchLabelText>
                      </SwitchLabel>
                      <SlideContainer
                        width={200}
                        max={2}
                        category="health-and-life"
                        options={["off", "view", "edit"]}
                        level={this.state["health-and-life-level"]}
                        setPermission={this.setPermission}
                        changePermissionSlider={this.changePermissionSlider}
                      />
                    </SwitchGroup>
                  </>
                )
                : null
              }
              
              {["request-hcc-view", "request-hcc-edit"].every((p) => allowed_permissions.includes(p)) && account.features && account.features.care_coordination
                ? (
                  <>
                    <SwitchGroup bordered={1}>
                      <RowSectionLegend span={12} marginbottom={10}>Request Hope Care Coordination</RowSectionLegend>
                      <SwitchLabel xs={12} sm={12} md={12} lg={9} xl={9}>
                        <SwitchLabelText>Allow limited or full access to request services including: Money, Medical, Food, Transportation and custom requests</SwitchLabelText>
                      </SwitchLabel>
                      <SlideContainer
                        width={200}
                        max={2}
                        category="request-hcc"
                        options={["off", "view", "edit"]}
                        level={this.state["request-hcc-level"]}
                        setPermission={this.setPermission}
                        changePermissionSlider={this.changePermissionSlider}
                      />
                    </SwitchGroup>
                  </>
                )
                : null
              }


            </Col>
          </RowBodyPadding>
        </RowContentSection>
        <RowContentSection span={12}>
          <FormError align="left">{error}</FormError>
          <SavePermissionsButton onClick={() => this.savePermissions()} green>{is_loading ? <FontAwesomeIcon icon={["far", "spinner"]} spin /> : "Save Permissions"}</SavePermissionsButton>
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
  removePermissions: (removed) => dispatch(removePermissions(removed)),
  dispatchRequest: (request) => dispatch(dispatchRequest(request)),
  showNotification: (type, title, message, metadata) => dispatch(showNotification(type, title, message, metadata)),
});
export default connect(mapStateToProps, dispatchToProps)(PermissionsSettings);
