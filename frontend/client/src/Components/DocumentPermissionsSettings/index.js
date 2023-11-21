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
import { SliderContainer, SwitchAndLabelRow, RowSectionLegendIcon, RowSectionLegendText } from "./style";
import Slider from "react-rangeslider";
import "react-rangeslider/lib/index.css";
import { showNotification } from "../../store/actions/notification";

const SlideContainer = (props) => {
  let horizontalLabels = {};
  props.options.forEach((option, index) => horizontalLabels[index] = option);
  const makeLabel = () => horizontalLabels[props.level];
  return (
    <SliderContainer xs={12} sm={12} md={12} lg={4} xl={4}>
      <Slider
        min={0}
        max={props.max}
        value={props.level}
        labels={horizontalLabels}
        format={makeLabel}
        onChange={(value) => props.changePermissionSlider ? props.changePermissionSlider(value, `${props.category}-level`) : null}
        onChangeComplete={() => props.setPermission(props.category, horizontalLabels[props.level])}
      />
    </SliderContainer>
  );
};

class DocumentPermissionsSettings extends Component {

  static propTypes = {
    showNotification: PropTypes.func.isRequired,
  }
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { accounts, user, session } = this.props;
    const account = accounts.find((account) => account.account_id === session.account_id);
    const allowed_permissions = user.is_partner && !session.is_switching ? (account.partner_plan.permissions || []) : (account.user_plan.permissions || []);
    this.state = { allowed_permissions, current_permissions: account.permissions, account };
  }

  componentDidMount() {
    const { defaultPermissions, setPermission } = this.props;
    defaultPermissions.forEach((category) => {
      this.changePermissionSlider(1, `${category}-level`);
      setPermission(category, "on");
    });
  }

  changePermissionSlider = (value, category) => this.setState({ [category]: value });

  render() {
    const { setPermission, disabled } = this.props;
    const { allowed_permissions, current_permissions, account } = this.state;
    return (
      <RowBody>
        <RowContentSection span={12}>
          <RowBodyPadding>
            <Col span={12}>
              {["finance-view", "finance-edit"].every((p) => allowed_permissions.includes(p)) && ["finance-view", "finance-edit"].every((p) => current_permissions.includes(p)) && account.features && account.features.finances
                ? (
                  <SwitchAndLabelRow>
                    <Col span={12}>
                      <SwitchGroup>
                        <RowSectionLegend span={12} marginbottom={10}>
                          <RowSectionLegendIcon>
                            <FontAwesomeIcon icon={["fad", "usd-circle"]} />
                          </RowSectionLegendIcon> <RowSectionLegendText>Finances</RowSectionLegendText>
                        </RowSectionLegend>
                        <SwitchLabel xs={12} sm={12} md={12} lg={8} xl={8}>
                          <SwitchLabelText>Require users to have Financial permissions to access this document</SwitchLabelText>
                        </SwitchLabel>
                        <SlideContainer
                          width={200}
                          max={1}
                          category="finance"
                          options={["off", "on"]}
                          level={this.state["finance-level"]}
                          setPermission={setPermission}
                          changePermissionSlider={!disabled ? this.changePermissionSlider : null}
                        />
                      </SwitchGroup>
                    </Col>
                    </SwitchAndLabelRow>
                )
                : null
              }

              {["account-admin-view", "account-admin-edit"].every((p) => allowed_permissions.includes(p)) && ["account-admin-view", "account-admin-edit"].every((p) => current_permissions.includes(p)) && account.features && account.features.finances
                ? (
                  <SwitchAndLabelRow>
                    <Col span={12}>
                      <SwitchGroup>
                        <RowSectionLegend span={12} marginbottom={10}>
                          <RowSectionLegendIcon>
                            <FontAwesomeIcon icon={["fad", "users"]} />
                          </RowSectionLegendIcon> <RowSectionLegendText>Account Management</RowSectionLegendText>
                        </RowSectionLegend>
                        <SwitchLabel xs={12} sm={12} md={12} lg={8} xl={8}>
                          <SwitchLabelText>Require users to have Account Management permissions to access this document</SwitchLabelText>
                        </SwitchLabel>
                        <SlideContainer
                          width={200}
                          max={1}
                          category="account-admin"
                          options={["off", "on"]}
                          level={this.state["account-admin-level"]}
                          setPermission={setPermission}
                          changePermissionSlider={!disabled ? this.changePermissionSlider : null}
                        />
                      </SwitchGroup>
                    </Col>
                  </SwitchAndLabelRow>
                )
                : null
              }

              {["health-and-life-view", "health-and-life-edit"].every((p) => allowed_permissions.includes(p)) && ["health-and-life-view", "health-and-life-edit"].every((p) => current_permissions.includes(p))
                ? (
                  <SwitchAndLabelRow>
                  <Col span={12}>
                    <SwitchGroup>
                      <RowSectionLegend span={12} marginbottom={10}>
                        <RowSectionLegendIcon>
                          <FontAwesomeIcon icon={["fad", "user-md"]} />
                        </RowSectionLegendIcon> <RowSectionLegendText>Health & Life</RowSectionLegendText>
                      </RowSectionLegend>
                      <SwitchLabel xs={12} sm={12} md={12} lg={8} xl={8}>
                        <SwitchLabelText>Require that users have the permission to view or edit Health & Life information in order to access this document</SwitchLabelText>
                      </SwitchLabel>
                      <SlideContainer
                        width={200}
                        max={1}
                        category="health-and-life"
                        options={["off", "on"]}
                        level={this.state["health-and-life-level"]}
                        setPermission={setPermission}
                        changePermissionSlider={!disabled ? this.changePermissionSlider : null}
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
  accounts: state.accounts,
  user: state.user,
  session: state.session
});
const dispatchToProps = (dispatch) => ({
  showNotification: (type, title, message, metadata) => dispatch(showNotification(type, title, message, metadata))
});
export default connect(mapStateToProps, dispatchToProps)(DocumentPermissionsSettings);
