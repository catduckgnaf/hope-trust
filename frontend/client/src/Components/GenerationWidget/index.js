import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import BlankSpace from "../../Components/BlankSpace";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Container from "../../Components/Container";
import hopeCarePlan from "../../store/actions/hope-care-plan";
import NoPermission from "../../Components/NoPermission";
import {
  GenerateDocumentButtons,
  GenerateDocumentButtonMain,
  GenerateDocumentButtonPadding,
  GenerateDocumentButtonInner,
  GenerateDocumentIconContainer,
  GenerateDocumentTextContainer
} from "./style";
import { store } from "../../store";

class GenerationWidget extends Component {

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
    const { accounts, session } = props;
    const account = accounts.find((account) => account.account_id === session.account_id);
    this.state = { account };
  }
  
  componentDidMount() {
    const { getSessions, survey } = this.props;
    const { account } = this.state;
    if (!survey.requested && !survey.isFetching && account.permissions.includes("health-and-life-view")) getSessions();
  }

  shouldRender = (s) => {
    const { user, survey } = this.props;
    const dependants = s.depends_on.map((dependant) => survey.list.find((d) => d.survey_id === Number(dependant)));
    const passedConditions = s.conditions.map((func) => {
      let function_args = [store.getState()];
      if (user.is_partner) function_args.push(user.partner_data.name);
      /* eslint-disable no-new-func */
      const myFunc = Function("...args", func.code);
      return myFunc(...function_args);
    });
    if (!dependants.length || dependants.every((d) => d.is_complete)) {
      if (passedConditions.every((e) => e)) return s;
    }
  };

  generateDocument = (type) => {
    const { buildDocument, survey } = this.props;
    let surveys = survey.list;
    let title = "Document";
    switch(type) {
      case "full":
        title = "Care Plan";
        surveys = surveys.filter((s) => {
          if (s.tags.includes("plan")) {
            if (!s.admin_override) {
              if (this.shouldRender(s)) return s;
              return false;
            }
            return false;
          }
          return false;
        });
        break;
      case "finance":
        title = "Financial Overview";
        surveys = surveys.filter((s) => {
          if (s.tags.includes("finance")) {
            if (!s.admin_override) {
              if (this.shouldRender(s)) return s;
              return false;
            }
          }
          return false;
        });
        break;
      case "health":
        title = "Health Overview";
        surveys = surveys.filter((s) => {
          if (s.tags.includes("health")) {
            if (!s.admin_override) {
              if (this.shouldRender(s)) return s;
              return false;
            }
          }
          return false;
        });
        break;
      case "trust":
        title = "Trust";
        surveys = surveys.filter((s) => {
          if (s.tags.includes("trust")) {
            if (!s.admin_override) {
              if (this.shouldRender(s)) return s;
              return false;
            }
          }
          return false;
        });
        break;
      default:
        break;
    }
    surveys = surveys.map((s) => s.survey_id);
    buildDocument(title, surveys);
  };

  render() {
    const { id, survey, title, span, height } = this.props;
    const { account } = this.state;
    const gettingStarted = survey.list.find((s) => s.survey_name === "Getting Started") || {};
    const financial = survey.list.find((s) => s.survey_name === "Financial") || {};
    const Trust = survey.list.find((s) => s.survey_name === "Trust") || {};
    return (
      <Container id={id} title={title} xs={12} sm={12} md={12} lg={span} xl={span} height={height} overflow="auto">
        {account.features && account.features.document_generation
          ? (
            <GenerateDocumentButtons gutter={20}>
              <BlankSpace top={10} />
              <GenerateDocumentButtonMain xs={12} sm={6} md={6} lg={6} xl={6} onClick={((gettingStarted && gettingStarted.is_complete) && (account.permissions.includes("health-and-life-view") && account.permissions.includes("finance-view")) && (!survey.is_retrying && !survey.isFetchingSurvey)) ? () => this.generateDocument("full") : null}>
                <GenerateDocumentButtonPadding>
                  <GenerateDocumentButtonInner disabled={!((gettingStarted && gettingStarted.is_complete) && (account.permissions.includes("health-and-life-view") && account.permissions.includes("finance-view"))) || survey.is_retrying || survey.isFetchingSurvey}>
                    <GenerateDocumentIconContainer span={2}>
                      {(survey.is_retrying || survey.isFetchingSurvey)
                        ? <FontAwesomeIcon icon={["fad", "spinner"]} spin />
                        : <FontAwesomeIcon icon={["fad", "hand-holding-seedling"]} />
                      }
                    </GenerateDocumentIconContainer>
                    <GenerateDocumentTextContainer span={10}>{(survey.is_retrying || survey.isFetchingSurvey) ? "Updating..." : "Full Care Plan"}</GenerateDocumentTextContainer>
                  </GenerateDocumentButtonInner>
                </GenerateDocumentButtonPadding>
              </GenerateDocumentButtonMain>
              <GenerateDocumentButtonMain xs={12} sm={6} md={6} lg={6} xl={6} onClick={((financial && financial.is_complete) && account.permissions.includes("finance-view")) && (!survey.is_retrying && !survey.isFetchingSurvey) ? () => this.generateDocument("finance") : null}>
                <GenerateDocumentButtonPadding>
                  <GenerateDocumentButtonInner disabled={!((financial && financial.is_complete) && account.permissions.includes("finance-view")) || survey.is_retrying || survey.isFetchingSurvey}>
                    <GenerateDocumentIconContainer span={2}>
                      {(survey.is_retrying || survey.isFetchingSurvey)
                        ? <FontAwesomeIcon icon={["fad", "spinner"]} spin />
                        : <FontAwesomeIcon icon={["fad", "hand-holding-usd"]} />
                      }
                    </GenerateDocumentIconContainer>
                    <GenerateDocumentTextContainer span={10}>{(survey.is_retrying || survey.isFetchingSurvey) ? "Updating..." : "Financial Overview"}</GenerateDocumentTextContainer>
                  </GenerateDocumentButtonInner>
                </GenerateDocumentButtonPadding>
              </GenerateDocumentButtonMain>
              <GenerateDocumentButtonMain xs={12} sm={6} md={6} lg={6} xl={6} onClick={((gettingStarted && gettingStarted.is_complete) && account.permissions.includes("health-and-life-view")) && (!survey.is_retrying && !survey.isFetchingSurvey) ? () => this.generateDocument("health") : null}>
                <GenerateDocumentButtonPadding>
                  <GenerateDocumentButtonInner disabled={!((gettingStarted && gettingStarted.is_complete) && account.permissions.includes("health-and-life-view")) || survey.is_retrying || survey.isFetchingSurvey}>
                    <GenerateDocumentIconContainer span={2}>
                      {(survey.is_retrying || survey.isFetchingSurvey)
                        ? <FontAwesomeIcon icon={["fad", "spinner"]} spin />
                        : <FontAwesomeIcon icon={["fad", "user-md"]} />
                      }
                    </GenerateDocumentIconContainer>
                    <GenerateDocumentTextContainer span={10}>{(survey.is_retrying || survey.isFetchingSurvey) ? "Updating..." : "Health Overview"}</GenerateDocumentTextContainer>
                  </GenerateDocumentButtonInner>
                </GenerateDocumentButtonPadding>
              </GenerateDocumentButtonMain>
              <GenerateDocumentButtonMain xs={12} sm={6} md={6} lg={6} xl={6} onClick={(account.features && account.features.trust && Trust.is_complete && account.permissions.includes("finance-view")) && (!survey.is_retrying && !survey.isFetchingSurvey) ? () => this.generateDocument("trust") : null}>
                <GenerateDocumentButtonPadding>
                  <GenerateDocumentButtonInner disabled={!(Trust.is_complete && account.permissions.includes("finance-view")) || survey.is_retrying || survey.isFetchingSurvey || (account.features && !account.features.trust)}>
                    <GenerateDocumentIconContainer span={2}>
                      {(survey.is_retrying || survey.isFetchingSurvey)
                        ? <FontAwesomeIcon icon={["fad", "spinner"]} spin />
                        : <FontAwesomeIcon icon={["fad", "scroll"]} />
                      }
                    </GenerateDocumentIconContainer>
                    <GenerateDocumentTextContainer span={10}>{(survey.is_retrying || survey.isFetchingSurvey) ? "Updating..." : "Trust"}</GenerateDocumentTextContainer>
                  </GenerateDocumentButtonInner>
                </GenerateDocumentButtonPadding>
              </GenerateDocumentButtonMain>
            </GenerateDocumentButtons>
          )
          : <NoPermission message="This feature is not enabled on your account." icon="folder-download" />
        }
      </Container>
    );
  }
}

const mapStateToProps = (state) => ({
  accounts: state.accounts,
  user: state.user,
  session: state.session,
  survey: state.survey
});
const dispatchToProps = (dispatch) => ({
  buildDocument: (name, survey_ids) => dispatch(hopeCarePlan.buildDocument(name, survey_ids)),
  buildAccountSurveys: (override) => dispatch(hopeCarePlan.buildAccountSurveys(override)),
  getSessions: () => dispatch(hopeCarePlan.getSessions())
});
export default connect(mapStateToProps, dispatchToProps)(GenerationWidget);
