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
import { permissions, additional, adminOverride } from "../../store/actions/customer-support";
import { keyMapper } from "../../utilities";

const levels = { "off": 0, "view": 1, "edit": 2 };
const SlideContainer = (props) => {
  let horizontalLabels = {};
  props.options.forEach((option, index) => horizontalLabels[index] = option);
  const makeLabel = () => horizontalLabels[props.level];
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
    this.state = {
      basePermissions: permissions
    };
  }

  componentDidMount() {
    const { basePermissions } = this.state;
    this.mapDefaults(basePermissions);
    keyMapper(process.env.REACT_APP_ADMIN_KEY, this.override);
  }

  componentWillUnmount() {
    this.setState({ basePermissions: [] }, () => document.removeEventListener("keydown"));
  }

  mapDefaults = (basePermissions) => {
    const { defaults, setPermission, account = {}, type } = this.props;
    let prependage;
    let appendage;
    defaults.forEach((permission) => {
      const permission_config = basePermissions.find((p) => permission.includes(p.prefix));
      if (permission_config) {
        const full_options = permission_config.options.filter((o) => !["off", "on"].includes(o)).map((opt) => `${permission_config.prefix}-${opt}`);
        const permission_is_allowed = account.allowed_permissions.some((allowed) => [...full_options, permission_config.prefix].includes(allowed));
        if (permission_config.types.includes(type) || permission_is_allowed) {
          if (permission.includes("view")) {
            let broken = permission.split("-");
            appendage = broken[broken.length - 1]; //ie: view
            prependage = permission.split("-view")[0]; // ie: grantor-assets
          } else if (permission.includes("edit")) {
            let broken = permission.split("-");
            appendage = broken[broken.length - 1];
            prependage = permission.split("-edit")[0];
          } else {
            appendage = "";
            prependage = permission;
          }
          if (prependage && appendage) {
            if (defaults.includes(`${prependage}-view`) && defaults.includes(`${prependage}-edit`)) {
              this.changePermissionSlider(levels["edit"], `${prependage}-level`);
              setPermission(prependage, "edit", account.account_id);
            } else {
              this.changePermissionSlider(levels[appendage], `${prependage}-level`);
              setPermission(prependage, appendage, account.account_id);
            }
          } else {
            prependage = prependage.replace("-on", "");
            this.changePermissionSlider(1, `${prependage}-level`);
            setPermission(prependage, "on", account.account_id);
          }
        }
      } else if (!permission_config && permission && !permission.includes("-on")) {
        if (permission !== "basic-user") {
          const is_additional = additional.find((p) => permission.includes(p.prefix));
          if (is_additional) {
            this.changePermissionSlider(1, `${permission}-level`);
            setPermission(permission, "on", account.account_id);
            this.override();
          }
        }
      }
    });
  };

  override = async () => {
    const { adminOverride } = this.props;
    const updated = await adminOverride();
    this.setState({ basePermissions: [...updated] }, () => this.mapDefaults([...updated]));
  };

  changePermissionSlider = (value, category) => this.setState({ [category]: value });

  render() {
    const { setPermission, disabled, hide_header = false, account = false, type } = this.props;
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
              {permissions.map(({ icon, name, description, prefix, types, isDisabled = false, options = ["off", "view", "edit"] }, index) => {
                const full_options = options.filter((o) => !["off", "on"].includes(o)).map((opt) => `${prefix}-${opt}`);
                const permission_is_allowed = account.allowed_permissions.some((allowed) => [...full_options, prefix].includes(allowed));
                if (types.includes(type) || permission_is_allowed) {
                  return (
                    <SwitchAndLabelRow key={index}>
                      <Col span={12}>
                        <SwitchGroup>
                          <RowSectionLegend span={12} marginbottom={10}>
                            <RowSectionLegendIcon>
                              <FontAwesomeIcon icon={["fad", icon]} />
                            </RowSectionLegendIcon> <RowSectionLegendText>{name}</RowSectionLegendText>
                          </RowSectionLegend>
                          <SwitchLabel xs={12} sm={12} md={12} lg={9} xl={9}>
                            <SwitchLabelText>{description}</SwitchLabelText>
                          </SwitchLabel>
                          <SlideContainer
                            width={200}
                            max={options.length - 1}
                            category={prefix}
                            options={options}
                            level={this.state[`${prefix}-level`]}
                            setPermission={setPermission}
                            changePermissionSlider={(!disabled && !isDisabled) ? this.changePermissionSlider : null}
                            className={(disabled || isDisabled) ? "disabled" : null}
                            account_id={account.account_id}
                          />
                        </SwitchGroup>
                      </Col>
                    </SwitchAndLabelRow>
                  );
                }
                return null;
              })}
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
  adminOverride: () => dispatch(adminOverride()),
  showNotification: (type, title, message, metadata) => dispatch(showNotification(type, title, message, metadata))
});
export default connect(mapStateToProps, dispatchToProps)(RelationshipPermissionsSettings);
