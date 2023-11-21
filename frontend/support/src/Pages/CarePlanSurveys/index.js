import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import Surveys from "../../Components/Surveys";
import Sessions from "../../Components/Sessions";
import { isMobile, isTablet } from "react-device-detect";
import { Page, PageHeader, PageAction } from "../../global-components";
import { Row, Col } from "react-simple-flex-grid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { changeSurveyTab, getSurveys, getSurveySessions } from "../../store/actions/survey";
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
    slug: "surveys",
    icon: "poll-people",
    title: "Surveys",
    Component: Surveys,
    payload: "list"
  },
  {
    slug: "sessions",
    icon: "list-check",
    title: "Sessions",
    Component: Sessions,
    payload: "sessions"
  }
];

class CarePlanSurveys extends Component {
  constructor(props) {
    super(props);
    const { location, survey } = props;
    const active_tab = location.query.tab || survey.active_tab;
    document.title = "Care Plan Surveys";
    this.state = { active_tab };
  }

  componentDidMount() {
    const { getSurveys, getSurveySessions, survey } = this.props;
    if (!survey.requested && !survey.isFetching) getSurveys();
    if (!survey.requestedCredits && !survey.isFetchingCredits) getSurveySessions();
  }

  changeTab = (tab) => {
    const { changeSurveyTab } = this.props;
    this.setState({ active_tab: tab.slug }, () => changeSurveyTab(tab.slug));
    document.title = tab.title;
  };

  render() {
    const { survey } = this.props;
    const { active_tab } = this.state;
    return (
      <ViewContainer>
        <Page paddingleft={1}>
          <PageHeader paddingleft={1} xs={12} sm={12} md={6} lg={6} xl={6} align="left">
            Care Plan Surveys
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
                            </SettingsTabIcon> {tab.title} {tab.payload && survey[tab.payload] && survey[tab.payload].length ? `(${survey[tab.payload].length})` : null}
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
  survey: state.survey,
  location: state.router.location
});
const dispatchToProps = (dispatch) => ({
  changeSurveyTab: (tab) => dispatch(changeSurveyTab(tab)),
  getSurveys: (override) => dispatch(getSurveys(override)),
  getSurveySessions: (override) => dispatch(getSurveySessions(override)),
});
export default connect(mapStateToProps, dispatchToProps)(CarePlanSurveys);