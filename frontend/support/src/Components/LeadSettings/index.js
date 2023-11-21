import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { changeLeadsTab } from "../../store/actions/customer-support";
import { HubspotProvider } from "@aaronhayes/react-use-hubspot-form";
import HubspotForm from "../HubspotForm";
import { isMobile, isTablet } from "react-device-detect";
import {
  ViewContainer,
  Page,
  PageHeader,
  PageAction
} from "../../global-components";
import {
  LeadSettingsMain,
  LeadSettingsMainPadding,
  LeadSettingsMainInner,
  SettingsTabs,
  SettingsTabsPadding,
  SettingsTabsInner,
  SettingsTab,
  SettingsTabPadding,
  SettingsTabInner,
  SettingsTabIcon,
  TabContent,
  SettingsTabStatusBar
} from "./style";
const _hsq = window._hsq = window._hsq || [];

let tabs_config = [
  {
    slug: "b2c-config",
    icon: "user",
    title: "B2C Leads Form"
  },
  {
    slug: "b2b-config",
    icon: "user-tie",
    title: "B2B Leads Form"
  }
];

class LeadSettings extends Component {

  constructor(props) {
    super(props);
    document.title = "Lead Settings";
    this.state = {};
  }

  changeTab = (tab) => {
    const { changeLeadsTab } = this.props;
    changeLeadsTab(tab.slug);
    document.title = tab.title;
  };

  componentDidMount() {
     _hsq.push(["doNotTrack"]);
  }

  render() {
    const { customer_support } = this.props;
    return (
      <ViewContainer>
        <Page>
          <PageHeader paddingleftmobile={15} xs={12} sm={12} md={6} lg={6} xl={6} align="left">Lead Management</PageHeader>
          <PageAction xs={12} sm={12} md={6} lg={6} xl={6} align={isMobile && !isTablet ? "left" : "right"}></PageAction>
        </Page>
        <LeadSettingsMain>
          <LeadSettingsMainPadding>
            <LeadSettingsMainInner>
              <SettingsTabs>
                <SettingsTabsPadding span={12}>
                  <SettingsTabsInner>

                    {tabs_config.map((tab, index) => {
                      return (
                        <SettingsTab key={index} span={12 / tabs_config.length} onClick={() => this.changeTab(tab)}>
                          <SettingsTabPadding>
                            <SettingsTabInner active={customer_support.active_lead_tab === tab.slug ? 1 : 0}>
                              <SettingsTabIcon>
                                <FontAwesomeIcon icon={["fad", tab.icon]} />
                              </SettingsTabIcon> {tab.title}
                            </SettingsTabInner>
                            <SettingsTabStatusBar active={customer_support.active_lead_tab === tab.slug ? 1 : 0} />
                          </SettingsTabPadding>
                        </SettingsTab>
                      );
                    })}

                  </SettingsTabsInner>
                </SettingsTabsPadding>
              </SettingsTabs>
              <HubspotProvider>
                <TabContent>
                  {customer_support.active_lead_tab === "b2c-config"
                    ? <HubspotForm formId="ab10157f-a95d-455f-ac80-3950f82bfa12" />
                    : null
                  }
                  {customer_support.active_lead_tab === "b2b-config"
                    ? <HubspotForm formId="f8cdd87b-207c-4f60-b7e0-46505c4579c5" />
                    : null
                  }
                </TabContent>
              </HubspotProvider>
            </LeadSettingsMainInner>
          </LeadSettingsMainPadding>
        </LeadSettingsMain>
      </ViewContainer>
    );
  }
}

const mapStateToProps = (state) => ({
  customer_support: state.customer_support
});
const dispatchToProps = (dispatch) => ({
  changeLeadsTab: (tab) => dispatch(changeLeadsTab(tab))
});
export default connect(mapStateToProps, dispatchToProps)(LeadSettings);
