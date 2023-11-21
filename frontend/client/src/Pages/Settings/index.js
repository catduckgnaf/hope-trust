import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import ReactAvatar from "react-avatar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { isMobile, isTablet } from "react-device-detect";
import ConvertAccountSetting from "../../Components/ConvertAccountSetting";
import GeneralSettingsForm from "../../Components/GeneralSettingsForm";
import PermissionsSettings from "../../Components/PermissionsSettings";
import SecurityQuestions from "../../Components/SecurityQuestions";
import ChangePassword from "../../Components/ChangePassword";
import { Row, Col } from "react-simple-flex-grid";
import { updateUser } from "../../store/actions/user";
import AvatarImageCr from "react-avatar-image-cropper";
import Resizer from "react-image-file-resizer";
import Billing from "../Billing";
import PartnerBilling from "../PartnerBilling";
import Upgrade from "../Upgrade";
import GeneralPartnerSettingsForm from "../../Components/GeneralPartnerSettingsForm";
import { changeSettingsTab } from "../../store/actions/settings";
import { all_permissions_array } from "../../store/actions/plans";
import { getHelloSignDownloadLink } from "../../store/actions/hello-sign";
import { generateOrgExport } from "../../store/actions/partners";
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
    type: ["user", "partner"],
    permissions: ["basic-user"]
  },
  {
    slug: "partner-info",
    icon: "building",
    title: "Partner Details",
    type: ["partner"],
    permissions: ["basic-user", "account-admin-edit"],
    Component: GeneralPartnerSettingsForm
  },
  {
    slug: "billing",
    icon: "credit-card",
    title: "Billing",
    type: ["user"],
    permissions: ["basic-user", "account-admin-edit"],
    feature_slug: "billing",
    Component: Billing
  },
  {
    slug: "partner-billing",
    icon: "credit-card",
    title: "Billing",
    type: ["partner"],
    permissions: ["basic-user", "account-admin-edit"],
    feature_slug: "billing",
    Component: PartnerBilling
  },
  {
    slug: "subscription",
    icon: "receipt",
    title: "Subscription",
    type: ["user", "partner"],
    permissions: ["basic-user", "account-admin-edit"],
    feature_slug: "billing",
    Component: Upgrade
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
    const { accounts, session } = props;
    document.title = "Settings";
    const account = accounts.find((account) => account.account_id === session.account_id);
    this.state = {
      imageSrc: "",
      editing_avatar: false,
      avatar_error: "",
      active_tabs: [],
      is_downloading_agreement: false,
      account
    };
  }

  componentDidMount() {
    const { location } = this.props;
    const active_tabs = this.getUserTabs();
    this.setState({ active_tabs }, () => location.query.tab ? this.changeTab(active_tabs.find((t) => t.slug === location.query.tab)) : null);
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
        localStorage.removeItem("react-avatar/failing");
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
   const { user, session } = this.props;
   const { account } = this.state;
   let tabs = tabs_config.filter((t) => t.type.includes("user") && t.permissions.every((s) => user.permissions.includes(s)) && (t.feature_slug ? account.features[t.feature_slug] : true));
   if (user.is_partner && session.is_switching) tabs = tabs_config.filter((t) => t.type.includes("user") && t.permissions.every((s) => user.permissions.includes(s)) && (t.feature_slug ? account.features[t.feature_slug] : true));
   if (user.is_partner && !session.is_switching) tabs = tabs_config.filter((t) => t.type.includes("partner") && t.permissions.every((s) => user.permissions.includes(s)) && (t.feature_slug ? account.features[t.feature_slug] : true));
   return tabs;
 };

  getHelloSignDownloadLink = async (request_id) => {
    const { getHelloSignDownloadLink } = this.props;
    this.setState({ is_downloading_agreement: true });
    const link = await getHelloSignDownloadLink(request_id);
    if (link.success) document.getElementById("download_partner_agreement").click();
    this.setState({ is_downloading_agreement: false });
  };

  generateOrgExport = async (organization) => {
    const { generateOrgExport } = this.props;
    this.setState({ is_exporting_org: true });
    await generateOrgExport(organization);
    this.setState({ is_exporting_org: false });
  }

  render() {
    const {
      imageSrc,
      editing_avatar,
      avatar_error,
      active_tabs,
      is_downloading_agreement,
      is_exporting_org,
      account
    } = this.state;
    const { user, session, settings, hello_sign, security, relationship } = this.props;
    const relationship_user = relationship.list.find((r) => r.cognito_id = user.cognito_id);

    return (
      <ViewContainer>
        <a id="download_partner_agreement" target="_blank" href={hello_sign.download_link} rel="noopener noreferrer" download="Partner Agreement.pdf">{null}</a>
        <Page paddingleft={1}>
          <PageHeader paddingleft={1} xs={12} sm={12} md={6} lg={6} xl={6} align="left">
            Settings
              </PageHeader>
          <PageAction xs={12} sm={12} md={6} lg={6} xl={6} align={isMobile && !isTablet ? "left" : "right"}>
            {user.is_partner && user.partner_data.signature_request_id && user.partner_data.contract_signed && !session.is_switching
              ? <Button disabled={is_downloading_agreement} onClick={() => this.getHelloSignDownloadLink(user.partner_data.signature_request_id)} blue secondary>{is_downloading_agreement ? <FontAwesomeIcon icon={["far", "spinner"]} spin /> : "Download Agreement"}</Button>
              : null
            }
            {user.is_partner && user.partner_data.is_entity && !session.is_switching && account.features && account.features.org_export
              ? <Button disabled={is_exporting_org} onClick={() => this.generateOrgExport((user.partner_data.name || "").toLowerCase())} blue secondary>{is_exporting_org ? <FontAwesomeIcon icon={["far", "spinner"]} spin /> : "Export Organization Report"}</Button>
              : null
            }
          </PageAction>
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
                                    <Button key={1} small green nomargin marginbottom={5} widthPercent={100}>Apply</Button>
                                  ]}
                                />
                              </ViewContainer>
                            </AvatarContainer>
                          )
                          : relationship_user && !relationship.isFetching ? <SettingsHeaderAvatar src={imageSrc || (`https://${process.env.REACT_APP_STAGE || "development"}-api.hopecareplan.com/support/users/get-user-avatar/${relationship_user.cognito_id}?${Date.now()}`)} /> : <ReactAvatar size={100} name={`${user.first_name} ${user.last_name}`} round />
                        }
                      </Col>
                      <SettingsHeaderInfo xs={12} sm={9} md={9} lg={10} xl={10}>
                        <SettingsHeaderLabel onClick={() => this.set("editing_avatar", !editing_avatar)}>
                          {!editing_avatar
                            ? <Button small green nomargin margintop={isMobile ? 15 : 0} marginbottom={5}>Upload a Photo</Button>
                            : <Button small danger nomargin marginbottom={5}>Cancel</Button>
                          }
                        </SettingsHeaderLabel>
                        <SettingsHeaderName>{user.first_name} {user.middle_name} {user.last_name}</SettingsHeaderName>
                      </SettingsHeaderInfo>
                    </SettingsHeader>
                    <GeneralSettingsForm />
                    {account.features && account.features.change_password
                      ? <ChangePassword />
                      : null
                    }
                    {account.features && account.features.permissions && all_permissions_array.some((permission) => account.permissions.includes(permission))
                      ? <PermissionsSettings />
                      : null
                    }
                    {account.features && account.features.security_questions && !security.isFetching && !security.isFetchingResponses
                      ? <SecurityQuestions />
                      : null
                    }
                    {user.type !== "beneficiary" && !user.is_partner && account.features && account.features.partner_conversion
                      ? <ConvertAccountSetting />
                      : null
                    }
                  </>
                )
                : null
              }

              {active_tabs.map((tab, index) => {
                if (tab.Component && settings.active_tab === tab.slug) return <tab.Component key={index} />;
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
  accounts: state.accounts,
  relationship: state.relationship,
  user: state.user,
  hello_sign: state.hello_sign,
  location: state.router.location,
  security: state.security
});
const dispatchToProps = (dispatch) => ({
  updateUser: (updates) => dispatch(updateUser(updates)),
  changeSettingsTab: (tab) => dispatch(changeSettingsTab(tab)),
  getHelloSignDownloadLink: (request_id) => dispatch(getHelloSignDownloadLink(request_id)),
  generateOrgExport: (organization) => dispatch(generateOrgExport(organization)),
});
export default connect(mapStateToProps, dispatchToProps)(Settings);
