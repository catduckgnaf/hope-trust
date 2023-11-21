import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import ReactAvatar from "react-avatar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { isMobile, isTablet } from "react-device-detect";
import GeneralSettingsForm from "../../Components/GeneralSettingsForm";
import TwoFactorSetting from "../../Components/TwoFactorSetting";
import ChangePassword from "../../Components/ChangePassword";
import { Row, Col } from "react-simple-flex-grid";
import { updateUser } from "../../store/actions/user";
import AvatarImageCr from "react-avatar-image-cropper";
import Resizer from "react-image-file-resizer";
import CoreSettings from "../../Components/CoreSettings";
import { changeSettingsTab } from "../../store/actions/settings";
import {
  ViewContainer,
  SettingsHeader,
  SettingsHeaderLabel,
  SettingsHeaderAvatar,
  SettingsHeaderName,
  SettingsTabs,
  SettingsTabsPadding,
  SettingsTabsInner,
  SettingsTab,
  SettingsTabPadding,
  SettingsTabInner,
  SettingsTabIcon,
  TabContent,
  SettingsHeaderInfo,
  AvatarContainer,
  SettingsTabStatusBar
} from "./style";
import { Page, PageHeader, PageAction, Button } from "../../global-components";
import { theme } from "../../global-styles";

let tabs_config = [
  {
    slug: "profile",
    icon: "user-cog",
    title: "Profile",
    permissions: ["basic-user"]
  },
  {
    slug: "core-settings",
    icon: "user-shield",
    title: "Core Settings",
    permissions: ["basic-user", "hopetrust-super-admin", "hopetrust-core"],
    Component: CoreSettings
  }
];

class Settings extends Component {
  static propTypes = {
    user: PropTypes.oneOfType([
      PropTypes.bool.isRequired,
      PropTypes.instanceOf(Object).isRequired
    ]),
    settings: PropTypes.oneOfType([
      PropTypes.bool.isRequired,
      PropTypes.instanceOf(Object).isRequired
    ]),
    session: PropTypes.oneOfType([
      PropTypes.bool.isRequired,
      PropTypes.instanceOf(Object).isRequired
    ]),
    changeSettingsTab: PropTypes.func.isRequired
  }
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { user, session } = props;
    document.title = "Settings";
    const account = user && user.accounts ? user.accounts.find((account) => account.account_id === session.account_id) : {};
    this.state = {
      imageSrc: "",
      editing_avatar: false,
      avatar_error: "",
      active_tabs: [],
      account
    };
  }

  componentDidMount() {
    const active_tabs = this.getUserTabs();
    this.setState({ active_tabs });
  }

  set = (id, value) => this.setState({ [id]: value });

  onFileChange = async (event) => {
    Resizer.imageFileResizer(
      event,
      200,
      200,
      event.type === "image/png" ? "PNG" : "JPEG",
      100,
      0,
      (uri) => {
        this.setState({ imageSrc: uri, avatar_error: "", editing_avatar: false }, () => this.saveAvatar(uri));
      },
      "base64"
    );
 };

  throwAvatarError = (type) => {
    switch (type) {
      case "not_image":
        this.set("avatar_error", "This file type is not supported.");
        break;
      case "maxsize":
        this.set("avatar_error", "Avatar must be less than 2MB");
        break;
      default:
        break;
    }
    setTimeout(() => {
      this.set("avatar_error", "");
    }, 5000);
  };

 saveAvatar = async (avatar) => {
   const { updateUser } = this.props;
   await updateUser({ avatar });
   this.setState({ editing_avatar: false, imageSrc: "" });
 };

 changeTab = (tab) => {
  const { changeSettingsTab } = this.props;
  changeSettingsTab(tab.slug);
  document.title = tab.title;
 };

 getUserTabs = () => {
   const { account } = this.state;
   let tabs = tabs_config.filter((t) => t.permissions.every((s) => account.permissions.includes(s)) && (t.feature_slug ? account.features[t.feature_slug] : true));
   return tabs;
 };

  render() {
    const {
      imageSrc,
      editing_avatar,
      avatar_error,
      active_tabs,
      account
    } = this.state;
    const { user, settings } = this.props;

    return (
      <ViewContainer>
        <Page paddingleft={1}>
          <PageHeader paddingleft={1} xs={12} sm={12} md={6} lg={6} xl={6} align="left">
            Settings
              </PageHeader>
          <PageAction xs={12} sm={12} md={6} lg={6} xl={6} align={isMobile && !isTablet ? "left" : "right"}></PageAction>
        </Page>
        <Row>
          <Col span={12}>
            {active_tabs.length > 1
              ? (
                <SettingsTabs>
                  <SettingsTabsPadding span={12}>
                    <SettingsTabsInner>

                      {active_tabs.map((tab, index) => {
                        return (
                          <SettingsTab key={index} span={12 / active_tabs.length} onClick={() => this.changeTab(tab)}>
                            <SettingsTabPadding>
                              <SettingsTabInner>
                                <SettingsTabIcon>
                                  <FontAwesomeIcon icon={["fad", tab.icon]} />
                                </SettingsTabIcon> {tab.title}
                              </SettingsTabInner>
                              <SettingsTabStatusBar active={settings.active_tab === tab.slug ? 1 : 0} />
                            </SettingsTabPadding>
                          </SettingsTab>
                        );
                      })}

                    </SettingsTabsInner>
                  </SettingsTabsPadding>
                </SettingsTabs>
              )
              : null
            }
            <TabContent>
              {settings.active_tab === "profile"
                ? (
                  <>
                    <SettingsHeader style={editing_avatar ? { marginBottom: "75px" } : {}}>
                      <Col xs={12} sm={3} md={3} lg={2} xl={2}>
                        {editing_avatar
                          ? (
                            <AvatarContainer>
                              <ViewContainer style={{ width: "150px", height: "150px", border: `2px dashed ${avatar_error ? theme.errorRed : theme.hopeTrustBlue}` }}>
                                <AvatarImageCr
                                  cancel={() => this.setState({ imageSrc: "", editing_avatar: false, avatar_error: "" })}
                                  apply={(e) => this.onFileChange(e)}
                                  isBack={false}
                                  text={avatar_error ? avatar_error : "Drag a File or Click to Browse"}
                                  errorHandler={(type) => this.throwAvatarError(type)}
                                  iconStyle={{ marginBottom: "20px", width: "50px", height: "32px" }}
                                  sliderConStyle={{ position: "relative", top: "25px", background: "#FFFFFF" }}
                                  textStyle={{ fontSize: "12px" }}
                                  actions={[
                                    <Button key={0} style={{display: "none"}}></Button>,
                                    <Button key={1} small rounded green nomargin marginbottom={5} widthPercent={100} outline>Apply</Button>
                                  ]}
                                />
                              </ViewContainer>
                            </AvatarContainer>
                          )
                          : user.avatar ? <SettingsHeaderAvatar src={imageSrc || user.avatar} /> : <ReactAvatar size={100} name={`${user.first_name} ${user.last_name}`} round />
                        }
                      </Col>
                      <SettingsHeaderInfo xs={12} sm={9} md={9} lg={10} xl={10}>
                        <SettingsHeaderLabel onClick={() => this.set("editing_avatar", !editing_avatar)}>
                          {!editing_avatar
                            ? <Button small rounded green nomargin margintop={isMobile ? 15 : 0} marginbottom={5} outline>Upload a Photo</Button>
                            : <Button small rounded danger nomargin marginbottom={5} outline>Cancel</Button>
                          }
                        </SettingsHeaderLabel>
                        <SettingsHeaderName>{user.first_name} {user.middle_name} {user.last_name}</SettingsHeaderName>
                      </SettingsHeaderInfo>
                    </SettingsHeader>
                    <GeneralSettingsForm />
                    {account.features && account.features.two_factor_authentication
                      ? <TwoFactorSetting />
                      : null
                    }
                    {account.features && account.features.change_password
                      ? <ChangePassword />
                      : null
                    }
                  </>
                )
                : null
              }

              {active_tabs.map((tab, index) => {
                if (tab.Component && settings.active_tab === tab.slug) return <tab.Component key={index} title={tab.title}/>;
                return null;
              })}

            </TabContent>

          </Col>
        </Row>
      </ViewContainer>
    );
  }
}

const mapStateToProps = (state) => ({
  session: state.session,
  settings: state.settings,
  user: state.user,
  hello_sign: state.hello_sign
});
const dispatchToProps = (dispatch) => ({
  updateUser: (updates) => dispatch(updateUser(updates)),
  changeSettingsTab: (tab) => dispatch(changeSettingsTab(tab))
});
export default connect(mapStateToProps, dispatchToProps)(Settings);
