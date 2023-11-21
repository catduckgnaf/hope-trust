import React, { Component, lazy, Suspense } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Container from "../../Components/Container";
import { isMobile, isTablet } from "react-device-detect";
import {
  SurveysContainer,
  SurveySection,
  SurveySectionHeader,
  SurveyCardsContainer,
  SurveyCards
} from "./style";
import {
  ViewContainer,
  Error,
  ErrorPadding,
  ErrorInner,
  ErrorInnerRow,
  ErrorIcon,
  ErrorMessage,
  Page,
  PageHeader,
  PageAction,
  Button
} from "../../global-components";
import LoaderSurveyCard from "../../Components/LoaderSurveyCard";
import hopeCarePlan from "../../store/actions/hope-care-plan";
import { uniq } from "lodash";
import { store } from "../../store";

const AsyncSurveyCard = lazy(() => import("../../Components/SurveyCard"));

class HopeCarePlan extends Component {
  static propTypes = {
    user: PropTypes.oneOfType([
      PropTypes.bool.isRequired,
      PropTypes.instanceOf(Object).isRequired
    ]),
    session: PropTypes.instanceOf(Object).isRequired
  }
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { relationship, accounts, user, session } = props;
    document.title = "Hope Care Plan";
    const account = accounts.find((account) => account.account_id === session.account_id);
    const currentUser = relationship.list.find((u) => u.cognito_id === user.cognito_id);
    this.state = { currentUser, account };
  }

  selectSurvey = async (survey) => {
    const { setSurvey } = this.props;
    setSurvey(survey);
  };

  async componentDidMount() {
    const { getSessions, survey } = this.props;
    if (!survey.requested && !survey.isFetching) await getSessions();
  }

  render() {
    const { survey, getSessions, user } = this.props;
    const { currentUser, account } = this.state;
    const catNames = uniq(survey.list.map((s) => s.category));
    const gettingStarted = survey.list.filter((s) => s.survey_id === 5509385);
    const getting_started_complete = gettingStarted.every((s) => s.is_complete);
    return (
      <ViewContainer>
        <Page>
          <PageHeader xs={12} sm={12} md={6} lg={6} xl={6} align="left">Hope Care Plan</PageHeader>
          <PageAction xs={12} sm={12} md={6} lg={6} xl={6} align={isMobile && !isTablet ? "left" : "right"}>
            <Button blue onClick={() => getSessions(true)}>{survey.isFetching ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : "Refresh"}</Button>
          </PageAction>
        </Page>
        {survey.list.length
          ? (
            <>
              {gettingStarted.length && !getting_started_complete
                ? (
                  <SurveysContainer style={{ width: "100%", height: "100%" }}>
                    <SurveySection>
                      <SurveySectionHeader span={12}>{gettingStarted[0].category}</SurveySectionHeader>
                      <SurveyCardsContainer span={12}>
                        <SurveyCards>
                          <Suspense fallback={<LoaderSurveyCard />}>
                            {gettingStarted.map((g, index) => {
                              if (account.permissions.includes("health-and-life-edit")) {
                                return <AsyncSurveyCard key={index} current={g} selectSurvey={this.selectSurvey} />;
                              } else {
                                return <AsyncSurveyCard key={index} current={g} selectSurvey={this.selectSurvey} noaccess message="You do not have permission to access this survey." />;
                              }
                            })}
                          </Suspense>
                        </SurveyCards>
                      </SurveyCardsContainer>
                    </SurveySection>
                  </SurveysContainer>
                )
                : (
                  <SurveysContainer style={{ width: "100%", height: "100%" }}>
                    {catNames.map((category, index) => {
                      const category_surveys = survey.list.filter((s) => s.category === category);
                      return (
                        <SurveySection key={index}>
                          <SurveySectionHeader span={12}>{category}</SurveySectionHeader>
                          <SurveyCardsContainer span={12}>
                            <SurveyCards>
                              <Suspense fallback={<LoaderSurveyCard />}>
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
                                        return <AsyncSurveyCard key={i} current={s} selectSurvey={this.selectSurvey} />;
                                      } else {
                                        return <AsyncSurveyCard key={i} current={s} selectSurvey={this.selectSurvey} noaccess message={s.no_access_message || "You do not have access to this survey."} />;
                                      }
                                    } else {
                                      return <AsyncSurveyCard key={i} current={s} selectSurvey={this.selectSurvey} noaccess message="You must complete additional surveys." />;
                                    }
                                  } else {
                                    return <AsyncSurveyCard key={i} current={s} selectSurvey={this.selectSurvey} noaccess message="You do not have permission to access this survey." />;
                                  }
                                })}
                              </Suspense>
                            </SurveyCards>
                          </SurveyCardsContainer>
                        </SurveySection>
                      );
                    })}
                  </SurveysContainer>
                )
              }
            </>
          )
          : (
            <Container title="" xs={12} sm={12} md={12} lg={12} xl={12} height={255}>
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
            </Container>
          )
        }
      </ViewContainer>
    );
  }
}

const mapStateToProps = (state) => ({
  accounts: state.accounts,
  relationship: state.relationship,
  user: state.user,
  session: state.session,
  survey: state.survey
});
const dispatchToProps = (dispatch) => ({
  getSessions: (override) => dispatch(hopeCarePlan.getSessions(override)),
  setSurvey: (survey) => dispatch(hopeCarePlan.setSurvey(survey))
});
export default connect(mapStateToProps, dispatchToProps)(HopeCarePlan);
