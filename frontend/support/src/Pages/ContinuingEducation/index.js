import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import CEStates from "../../Components/CEStates";
import CECredits from "../../Components/CECredits";
import CECourses from "../../Components/CECourses";
import { isMobile, isTablet } from "react-device-detect";
import { Page, PageHeader, PageAction } from "../../global-components";
import { Row, Col } from "react-simple-flex-grid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { changeCETab, getCEConfigs, getCECredits } from "../../store/actions/ce-management";
import {
  ViewContainer,
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

let tabs_config = [
  {
    slug: "ce-states",
    icon: "flag-usa",
    title: "States",
    Component: CEStates,
    payload: "list"
  },
  {
    slug: "ce-credits",
    icon: "coins",
    title: "Course Attempts",
    Component: CECredits,
    payload: "credits_list"
  },
  {
    slug: "ce-courses",
    icon: "screen-users",
    title: "Courses",
    Component: CECourses,
    payload: "courses"
  }
];

class ContinuingEducation extends Component {
  constructor(props) {
    super(props);
    const { location, ce_management } = props;
    const active_tab = location.query.tab || ce_management.active_tab;
    document.title = "Continuing Education";
    this.state = { active_tab };
  }

  componentDidMount() {
    const { getCEConfigs, getCECredits, ce_management } = this.props;
    if (!ce_management.requested && !ce_management.isFetching) getCEConfigs();
    if (!ce_management.requestedCredits && !ce_management.isFetchingCredits) getCECredits();
  }

  changeTab = (tab) => {
    const { changeCETab } = this.props;
    this.setState({ active_tab: tab.slug }, () => changeCETab(tab.slug));
    document.title = tab.title;
  };

  render() {
    const { ce_management } = this.props;
    const { active_tab } = this.state;
    return (
      <ViewContainer>
        <Page paddingleft={1}>
          <PageHeader paddingleft={1} xs={12} sm={12} md={6} lg={6} xl={6} align="left">
            Continuing Education
          </PageHeader>
          <PageAction xs={12} sm={12} md={6} lg={6} xl={6} align={isMobile && !isTablet ? "left" : "right"}></PageAction>
        </Page>
        <Row>
          <Col span={12}>
            <SettingsTabs>
              <SettingsTabsPadding span={12}>
                <SettingsTabsInner>

                  {tabs_config.map((tab, index) => {
                    return (
                      <SettingsTab key={index} span={12 / tabs_config.length} onClick={() => this.changeTab(tab)}>
                        <SettingsTabPadding>
                          <SettingsTabInner>
                            <SettingsTabIcon>
                              <FontAwesomeIcon icon={["fad", tab.icon]} />
                            </SettingsTabIcon> {tab.title} {tab.payload && ce_management[tab.payload] && ce_management[tab.payload].length ? `(${ce_management[tab.payload].length})` : null}
                          </SettingsTabInner>
                          <SettingsTabStatusBar active={active_tab === tab.slug ? 1 : 0} />
                        </SettingsTabPadding>
                      </SettingsTab>
                    );
                  })}

                  </SettingsTabsInner>
                </SettingsTabsPadding>
              </SettingsTabs>
            <TabContent>

              {tabs_config.map((tab, index) => {
                if (tab.Component && active_tab === tab.slug) return <tab.Component key={index} title={tab.title}/>;
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
  ce_management: state.ce_management,
  location: state.router.location
});
const dispatchToProps = (dispatch) => ({
  changeCETab: (tab) => dispatch(changeCETab(tab)),
  getCEConfigs: (override) => dispatch(getCEConfigs(override)),
  getCECredits: (override) => dispatch(getCECredits(override)),
});
export default connect(mapStateToProps, dispatchToProps)(ContinuingEducation);