import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import Container from "../Container";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { navigateTo } from "../../store/actions/navigation";
import { Row } from "react-simple-flex-grid";
import hopeCarePlan from "../../store/actions/hope-care-plan";
import DashboardSurveyRow from "../../Components/DashboardSurveyRow";
import NoPermission from "../../Components/NoPermission";
import { getSurveyStatus } from "../../store/actions/utilities";
import { withPolling } from "../../HOC/withPolling";
import {
  SurveyItems,
  SurveyItemsPadding,
  SurveyItemsInner,
  SurveySection,
  SurveySectionHeader,
  SurveyCardsContainer,
  SurveyCards,
  SurveySectionInlineMessage,
  SurveySectionInlineMessageIcon,
  NoPermissionInnerSectionIconSuper,
  NoPermissionInnerSectionIconRegular,
  SurveySectionInlineMessageIconLocked,
  Text,
  Title,
  Indicator,
  Badge
} from "./style";
import {
  Error,
  ErrorPadding,
  ErrorInner,
  ErrorInnerRow,
  ErrorIcon,
  ErrorMessage
} from "../../global-components";
import { uniq } from "lodash";
import { store } from "../../store";

const application_status = {
  maintenance: "Under Maintenance",
  critical: "Critical Outage",
  major: "Major Outage",
  minor: "Minor Outage",
  none: ""
};

class HopeCarePlanWidget extends Component {

  static propTypes = {
    survey: PropTypes.instanceOf(Object).isRequired,
    navigateTo: PropTypes.func.isRequired
  }
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { user, accounts, relationship, session } = props;
    const account = accounts.find((account) => account.account_id === session.account_id);
    const currentUser = relationship.list.find((u) => u.cognito_id === user.cognito_id);
    this.state = { currentUser, account, override_notice: false };
  }

  async componentDidMount() {
    const { account } = this.state;
    const { getSessions, survey } = this.props;
    if (!survey.requested && !survey.isFetching && account.permissions.includes("health-and-life-edit")) {
      getSurveyStatus();
      await getSessions();
    }
  }

  render() {
    const { survey, navigateTo, id, user } = this.props;
    const { currentUser, account, override_notice } = this.state;
    const catNames = uniq(survey.list.map((s) => s.category));
    const gettingStarted = survey.list.filter((s) => s.survey_id === 5509385);
    const getting_started_complete = gettingStarted.every((s) => s.is_complete);
    let status = (survey.status && survey.status.alchemer) ? survey.status.alchemer.status : false;
    let is_shut_down = status && status.indicator && ["critical", "major", "minor", "maintenance"].includes(status.indicator);
    if (!is_shut_down) {
      const data = hopeCarePlan.checkSurveyStatus();
      status = data.status || {};
      is_shut_down = data.result || false;
    }
    return (
        <>
          {account.features && account.features.surveys
            ? (
              <Container id={id} title={<Title><Indicator title={is_shut_down ? application_status[status.indicator] : "All Systems Operational"} status={is_shut_down ? status.indicator : "none"} /> Care Plan Surveys {application_status[status.indicator] && is_shut_down ? <Badge status={status.indicator}>{application_status[status.indicator]}</Badge> : null}</Title>} viewall={{ title: "View All", func: () => navigateTo("/hope-care-plan") }} xs={12} sm={12} md={12} lg={7} xl={7} height={320} overflow="auto" hide_buttons={is_shut_down}>
                <SurveyItems>
                  <SurveyItemsPadding span={12}>
                    {survey.list.length && !survey.isFetching
                      ? (
                        <>
                          {is_shut_down && !override_notice
                            ? (
                              <SurveyItemsInner>
                                <SurveySection span={12}>
                                  <SurveySectionInlineMessage>
                                    <SurveySectionInlineMessageIconLocked className="fa-layers fa-fw" onClick={process.env.REACT_APP_STAGE !== "production" ? () => this.setState({ override_notice: true }) : null}>
                                      <NoPermissionInnerSectionIconRegular>
                                        <FontAwesomeIcon icon={["fad", status.indicator === "maintenance" ? "tools" : "exclamation-circle"]} />
                                      </NoPermissionInnerSectionIconRegular>
                                      <NoPermissionInnerSectionIconSuper>
                                        <FontAwesomeIcon icon={["fad", "lock-alt"]} size="sm" transform="shrink-9 down-5 left-6" />
                                      </NoPermissionInnerSectionIconSuper>
                                    </SurveySectionInlineMessageIconLocked>
                                    {status.indicator === "maintenance"
                                      ? (
                                        <Text>
                                          {`We are currently performing maintenance on our surveys. For your convenience, and in an effort to prevent any interruption to your data entry, we have temporarily closed access to our surveys.\n\nThank you for your understanding, surveys will be back online shortly.`}
                                        </Text>
                                      )
                                      : (
                                        <Text>
                                        {`We are currently experiencing a ${status.indicator} outage. For your convenience, and in an effort to prevent any interruption to your data entry, we have temporarily closed access to our surveys.\n\nThank you for your understanding, surveys will be back online as soon as possible.`}
                                        </Text>
                                      )
                                    }
                                  </SurveySectionInlineMessage>
                                </SurveySection>
                              </SurveyItemsInner>
                            )
                            : (
                              <SurveyItemsInner>
                                {gettingStarted.length && !getting_started_complete
                                  ? (
                                    <SurveySection span={12}>
                                      <Row>
                                        <SurveySectionHeader span={12}>{gettingStarted[0].parent_category}</SurveySectionHeader>
                                        <SurveyCardsContainer span={12}>
                                          <SurveyCards>
                                            {gettingStarted.map((g, index) => {
                                              if (account.permissions.includes("health-and-life-edit")) {
                                                return <DashboardSurveyRow key={index} survey={g} />;
                                              } else {
                                                return <DashboardSurveyRow key={index} survey={g} noaccess />;
                                              }
                                            })}
                                          </SurveyCards>
                                        </SurveyCardsContainer>
                                      </Row>
                                      <SurveySection span={12}>
                                        {!account.permissions.includes("health-and-life-edit")
                                          ? (
                                            <SurveySectionInlineMessage>
                                              <SurveySectionInlineMessageIconLocked className="fa-layers fa-fw">
                                                <NoPermissionInnerSectionIconRegular>
                                                  <FontAwesomeIcon icon={["fad", "info-circle"]} />
                                                </NoPermissionInnerSectionIconRegular>
                                                <NoPermissionInnerSectionIconSuper>
                                                  <FontAwesomeIcon icon={["fad", "lock-alt"]} size="sm" transform="shrink-9 down-5 left-6" />
                                                </NoPermissionInnerSectionIconSuper>
                                              </SurveySectionInlineMessageIconLocked>
                                              Please have an authorized user complete the Getting Started survey to unlock the rest of the Care Plan Surveys.
                                            </SurveySectionInlineMessage>
                                          )
                                          : (
                                            <SurveySectionInlineMessage>
                                              <SurveySectionInlineMessageIcon>
                                                <FontAwesomeIcon icon={["fad", "info-circle"]} />
                                              </SurveySectionInlineMessageIcon>
                                              Please complete the Getting Started survey to unlock the rest of the Care Plan Surveys.
                                            </SurveySectionInlineMessage>
                                          )
                                        }
                                      </SurveySection>
                                    </SurveySection>
                                  )
                                  : (
                                    <>
                                      {catNames.map((category, index) => {
                                        const category_surveys = survey.list.filter((s) => s.category === category);
                                        return (
                                          <SurveySection key={index} span={12}>
                                            <Row>
                                              <SurveySectionHeader span={12}>{category}</SurveySectionHeader>
                                              <SurveyCardsContainer span={12}>
                                                <SurveyCards>
                                                  {category_surveys.map((s, i) => {
                                                    if (s.permissions.every((permission) => currentUser.permissions.includes(permission))) {
                                                      const passedConditions = s.conditions.map((func) => {
                                                        let function_args = [store.getState()];
                                                        if (user.is_partner) function_args.push(user.partner_data.name);
                                                        /* eslint-disable no-new-func */
                                                        const myFunc = Function("...args", func.code);
                                                        return myFunc(...function_args);
                                                      });
                                                      const dependants = s.depends_on.map((dependant) => survey.list.find((d) => d.survey_id === Number(dependant)));
                                                      if (!dependants.length || dependants.every((d) => d.is_complete)) {
                                                        if (passedConditions.every((e) => e)) {
                                                          return <DashboardSurveyRow key={i} survey={s} />;
                                                        } else {
                                                          return <DashboardSurveyRow key={i} survey={s} noaccess />;
                                                        }
                                                      } else {
                                                        return <DashboardSurveyRow key={i} survey={s} noaccess />;
                                                      }
                                                    } else {
                                                      return <DashboardSurveyRow key={i} survey={s} noaccess />;
                                                    }
                                                  })}
                                                </SurveyCards>
                                              </SurveyCardsContainer>
                                            </Row>
                                          </SurveySection>
                                        );
                                      })}
                                    </>
                                  )
                                }
                              </SurveyItemsInner>
                            )
                          }
                        </>
                      )
                      : (
                        <Error span={12}>
                          <ErrorPadding>
                            <ErrorInner span={12}>
                              <ErrorInnerRow>
                                <ErrorIcon span={12}>
                                  <FontAwesomeIcon icon={["fad", "clipboard-list-check"]} />
                                </ErrorIcon>
                                <ErrorMessage span={12}>You do not have any surveys.</ErrorMessage>
                              </ErrorInnerRow>
                            </ErrorInner>
                          </ErrorPadding>
                        </Error>
                      )
                    }
                  </SurveyItemsPadding>
                </SurveyItems>
              </Container>
            )
            : (
              <Container id={id} title="Care Plan Surveys" xs={12} sm={12} md={12} lg={6} xl={6} height={320} overflow="auto">
                <NoPermission message="This feature is not enabled on your account." icon="hand-holding-heart" />
              </Container>
            )
          }
        </>
    );
  }
}

const mapStateToProps = (state) => ({
  survey: state.survey,
  user: state.user,
  session: state.session,
  accounts: state.accounts,
  relationship: state.relationship
});
const dispatchToProps = (dispatch) => ({
  navigateTo: (location, query) => dispatch(navigateTo(location, query)),
  getSurveyStatus: () => dispatch(getSurveyStatus()),
  getSessions: (override) => dispatch(hopeCarePlan.getSessions(override))
});

export default connect(mapStateToProps, dispatchToProps)(withPolling(getSurveyStatus, 120000, [])(HopeCarePlanWidget));
