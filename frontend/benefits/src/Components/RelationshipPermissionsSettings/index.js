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
    const { user, session } = this.props;
    let account = user.accounts.find((account) => account.account_id === session.account_id);
    const allowed_permissions = ["account-admin-view", "account-admin-edit"];
    this.state = { account, allowed_permissions };
  }

  componentDidMount() {
    const { defaults, setPermission } = this.props;
    let prependage;
    let appendage;
    defaults.filter((p) => ["account-admin-view", "account-admin-edit"].includes(p))
    .forEach((current_permission) => {
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
    const { setPermission, disabled, hide_header = false } = this.props;
    const { allowed_permissions = [] } = this.state;
    return (
      <RowBody>
        {!hide_header
          ? <RowContentHeader span={12}>Permissions</RowContentHeader>
          : null
        }
        <RowContentSection span={12}>
          <RowBodyPadding nopadding={hide_header ? 1 : 0}>
            <Col span={12}>

              {["account-admin-view", "account-admin-edit"].every((p) => allowed_permissions.includes(p))
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
