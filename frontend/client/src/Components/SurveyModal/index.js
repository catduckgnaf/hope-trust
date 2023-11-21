import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import { Row, Col } from "react-simple-flex-grid";
import { Modal } from "react-responsive-modal";
import moment from "moment";
import { uniq } from "lodash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { capitalize, getUserAge, getUserSurveyLanguage, getReadableUserAddress } from "../../utilities";
import hopeCarePlan from "../../store/actions/hope-care-plan";
import LoaderOverlay from "../../Components/LoaderOverlay";
import IdleTimer from "react-idle-timer";
import ReactAvatar from "react-avatar";
import {
  SurveyModalContent,
  SurveyModalInner,
  SurveyModalInnerInfoSection,
  SurveyFrame,
  NextSurveyButtonText,
  SurveyInfoHeader,
  SurveyInfoHeaderItem,
  SurveyInfoHeaderAvatar
} from "./style";
import { Button } from "../../global-components";
import Container from "../../Components/Container";
import NoPermission from "../../Components/NoPermission";
import { refreshUser } from "../../store/actions/user";
import { store } from "../../store";

const pronouns = {
  "female-pronoun": "She, Her, Hers",
  "male-pronoun": "He, Him, His",
  "nongender-pronoun": "They, Them, Theirs"
};
let categorized = {};

class SurveyModal extends Component {
  static propTypes = {
    user: PropTypes.oneOfType([
      PropTypes.bool.isRequired,
      PropTypes.instanceOf(Object).isRequired
    ]),
    session: PropTypes.object.isRequired
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { customer_support, session, accounts } = this.props;
    const account = accounts.find((account) => account.account_id === session.account_id);

    this.state = {
      isLoading: false,
      is_in_session: false,
      account,
      finance_types: customer_support.core_settings.contact_types.filter((c) => c.child_category === "Finance").map((c) => c.type.toLowerCase())
    };
    
    this.idleTimer = null;
  }

  componentDidMount() {
    const { refreshUser } = this.props;
    this.setState({ is_in_session: true }, () => refreshUser());
  }

  componentWillUnmount() {
    this.setState({ is_in_session: false });
    this.idleTimer = null;
  }

  getResponder = (cognito_id) => {
    const { relationship } = this.props;
    const owner = relationship.list.find((u) => u.cognito_id === cognito_id);
    if (owner) return `${owner.first_name} ${owner.last_name.charAt(0)}.`;
    return false;
  };

  saveResponsesCloseSurvey = (current_survey) => {
    const { closeSurvey, saveCurrentSurvey } = this.props;
    this.setState({ isLoading: true });
    saveCurrentSurvey(current_survey);
    setTimeout(() => {
      closeSurvey();
      this.setState({ isLoading: false });
    }, 3000);
  };

  nextSurvey = (current_survey, next_survey) => {
    const { setSurvey, saveCurrentSurvey } = this.props;
    this.setState({ isLoading: true });
    saveCurrentSurvey(current_survey);
    setSurvey(next_survey);
    setTimeout(() => {
      this.setState({ isLoading: false });
    }, 3000);
  };

  getNextAvailableSurvey = (survey) => {
    const { survey_lookup, user } = this.props;
    const { account } = this.state;
    let remaining_surveys = survey_lookup.list.filter((s) => s.sort_order > survey.sort_order);
    let next_survey;
    for (let i = 0; i < remaining_surveys.length; i++) {
      const remaining_survey = remaining_surveys[i];
      if (remaining_survey.permissions.every((permission) => account.permissions.includes(permission))) {
        const dependants = remaining_survey.depends_on.map((dependant) => survey_lookup.list.find((d) => d.survey_id === Number(dependant)));
        const passedConditions = remaining_survey.conditions.map((func) => {
          let function_args = [store.getState()];
          if (user.is_partner) function_args.push(user.partner_data.name);
          /* eslint-disable no-new-func */
          const myFunc = Function("...args", func.code);
          return myFunc(...function_args);
        });
        if (!dependants.length || dependants.every((d) => d.is_complete)) {
          if (passedConditions.every((e) => e)) {
            next_survey = remaining_survey;
            break;
          }
        }
      }
    }
    if (next_survey) return next_survey;
  };

  getProviders = () => {
    const { provider } = this.props;
    const { finance_types } =  this.state;
    const all_providers = provider.list;
    all_providers.forEach((p) => {
      let name = "";
      if (p.contact_first && p.contact_last) name += `${p.contact_first} ${p.contact_last} - `;
      if (p.name) name += `${p.name} - `;
      if (p.specialty) name += `(${p.specialty})`;
      categorized.all_providers.push(name);
      if (finance_types.includes(p.specialty.toLowerCase())) categorized.all_partners.push(name);
      if (p.type === "service") categorized.service_providers.push(name);
      if (p.type === "medical") {
        categorized.medical_providers.push(name);
        categorized.healthcare_relationships.push(name);
      }
      switch(p.specialty) {
        case "accountant":
          categorized.accountant_relationships.push(name);
          categorized.investment_advisors.push(name);
          categorized.financial_providers.push(name);
          break;
        case "attorney":
          categorized.law_relationships.push(name);
          break;
        case "broker":
          categorized.accountant_relationships.push(name);
          categorized.investment_advisors.push(name);
          categorized.financial_providers.push(name);
          break;
        case "trustee":
          categorized.investment_advisors.push(name);
          categorized.financial_providers.push(name);
          break;
        case "trust advisor":
          categorized.investment_advisors.push(name);
          categorized.financial_providers.push(name);
          break;
        case "investment manager":
          categorized.ria_relationships.push(name);
          categorized.investment_advisors.push(name);
          categorized.financial_providers.push(name);
          break;
        case "financial advisor":
          categorized.accountant_relationships.push(name);
          categorized.investment_advisors.push(name);
          categorized.financial_providers.push(name);
          break;
        case "trust officer":
          categorized.bank_trust_relationships.push(name);
          categorized.investment_advisors.push(name);
          categorized.financial_providers.push(name);
          break;
        case "life insurance agent":
          categorized.insurance_relationships.push(name);
          break;
        default:
          break;
      }
      categorized.administrative_trustees.push(...categorized.financial_providers);
      categorized.distribution_advisors.push(...categorized.financial_providers);
    });
  };

  getPartners = () => {
    const { relationship } = this.props;
    const all_relationships = relationship.list || [];
    const all_partners = all_relationships.filter((r) => r.is_partner);
    categorized.all_partners = [];
    categorized.law_relationships = [];
    categorized.bank_trust_relationships = [];
    categorized.insurance_relationships = [];
    categorized.investment_advisors = [];
    categorized.ria_relationships = [];
    categorized.healthcare_relationships = [];
    categorized.accountant_relationships = [];
    categorized.advocate_relationships = [];
    categorized.education_relationships = [];
    categorized.other_relationships = [];
    categorized.administrative_trustees = [];
    categorized.distribution_advisors = [];
    categorized.all_providers = [];
    categorized.service_providers = [];
    categorized.medical_providers = [];
    categorized.financial_providers = [];
    all_partners.forEach((p) => {
      let name = "";
      if (p.first_name && p.last_name) name += `${p.first_name} ${p.last_name}`;
      if (p.partner_data.name) name += ` - (${p.partner_data.name})`;
      categorized.all_partners.push(name);
      switch (p.partner_data.partner_type) {
        case "law":
          categorized.law_relationships.push(name);
          break;
        case "bank_trust":
          categorized.bank_trust_relationships.push(name);
          categorized.investment_advisors.push(name);
          categorized.administrative_trustees.push(name);
          categorized.distribution_advisors.push(name);
          break;
        case "insurance":
          categorized.insurance_relationships.push(name);
          categorized.investment_advisors.push(name);
          break;
        case "ria":
          categorized.ria_relationships.push(name);
          categorized.investment_advisors.push(name);
          break;
        case "healthcare":
          categorized.healthcare_relationships.push(name);
          categorized.medical_providers.push(name);
          break;
        case "accountant":
          categorized.accountant_relationships.push(name);
          break;
        case "advocate":
          categorized.advocate_relationships.push(name);
          break;
        case "education":
          categorized.education_relationships.push(name);
          break;
        case "other":
          categorized.other_relationships.push(name);
          break;
        default:
          break;
      }
    });
  };

  categorizeRelationships = () => {
    const { relationship } = this.props;
    const { finance_types } = this.state;
    const all_relationships = relationship.list || [];
    this.getPartners();
    this.getProviders();
    const financial_users = all_relationships.filter((u) => {
      return (!u.is_partner && u.type && finance_types.includes(u.type.toLowerCase()));
    }).map((p) => {
      return `${p.first_name} ${p.last_name}${p.type ? ` - (${capitalize(p.type)})` : ""}`;
    });
    const non_finance_partners_finance = all_relationships.filter((u) => {
      return (u.is_partner && u.type && finance_types.includes(u.type.toLowerCase()));
    }).map((p) => {
      return `${p.first_name} ${p.last_name}${p.type ? ` - (${capitalize(p.type)})` : ""}`;
    });
    categorized.administrative_trustees.push(...financial_users);
    categorized.distribution_advisors.push(...financial_users);

    categorized.relationships = all_relationships.filter((r) => {
      return !r.is_partner && r.type !== "beneficiary";
    }).map((p) => {
      return `${p.first_name} ${p.last_name}${p.type ? ` - (${capitalize(p.type)})` : ""}`;
    });
    categorized.financial_professionals = [
      ...categorized.bank_trust_relationships,
      ...categorized.investment_advisors,
      ...categorized.insurance_relationships,
      ...categorized.ria_relationships,
      ...categorized.accountant_relationships,
      ...categorized.financial_providers,
      ...non_finance_partners_finance,
      ...financial_users
    ];
    categorized.all_account_users = [
      ...categorized.relationships,
      ...categorized.all_partners
    ];
    categorized.all_relationships = [...categorized.relationships, ...financial_users, ...categorized.all_partners, ...categorized.all_providers]; // all account users, all partners
    return categorized;
  };

  render() {
    const { survey, surveyUser, beneficiary, session, user, refreshUser, closeSurvey } = this.props;
    const { isLoading, account, is_in_session } = this.state;
    this.categorizeRelationships();
    const current_plan = user.is_partner && !session.is_switching ? account.partner_plan : account.user_plan;
    const next_survey = this.getNextAvailableSurvey(survey);
    const now = moment();
    const updated = moment(survey.access_time);
    const duration = moment.duration(now.diff(updated));
    const minutes = duration.asMinutes();
    const respondent_address = getReadableUserAddress(beneficiary);
    const beneficiary_address = getReadableUserAddress(user);
    const params = new URLSearchParams({
      account_id: session.account_id,
      cognito_id: user.cognito_id,
      first_name: beneficiary.first_name,
      last_name: beneficiary.last_name,
      respondent_first: user.first_name,
      respondent_last: user.last_name,
      respondent_email: user.email,
      respondent_phone: user.home_phone,
      gender: beneficiary.gender,
      stage: process.env.REACT_APP_STAGE || "development",
      user_type: surveyUser.type,
      financePermission: surveyUser.permissions.includes("finance-edit"),
      healthPermission: surveyUser.permissions.includes("health-and-life-edit"),
      hopetrustSuperAdminPermission: survey.admin_override,
      age: getUserAge(beneficiary.birthday),
      sglocale: getUserSurveyLanguage(surveyUser.type, beneficiary.pronouns),
      programmatic: false,
      is_complete: survey.is_complete ? true : false,
      user_tier: current_plan.name,
      relationships: uniq(categorized.all_relationships).join(";"),
      all_account_users: uniq(categorized.all_account_users).join(";"),
      account_users: uniq(categorized.relationships).join(";"),
      financial_professionals: uniq(categorized.financial_professionals).join(";"),
      organization_name: (user && user.is_partner) ? user.partner_data.name : "Not Partner",
      partner_title: (user && user.is_partner) ? user.partner_data.title : "Not Partner",
      partner_role: (user && user.is_partner) ? user.partner_data.role : "Not Partner"
    });
    if (respondent_address) params.append("respondent_address", respondent_address);
    if (beneficiary_address) params.append("beneficiary_address", beneficiary_address);
    if (survey.session_id) params.append("snc", survey.session_id);
    if (survey.is_complete) params.append("sg_navigate", "start");
    if (minutes > 30) params.append("refresh", true);
    if (survey.survey_name.includes("Trust")) {
      params.append("administrative_trustees", categorized.administrative_trustees.length ? `${[...categorized.administrative_trustees, "Hope Trust"].join(";")}` : "Hope Trust");
      params.append("distribution_advisors", categorized.distribution_advisors.length ? `${[...categorized.distribution_advisors, "Hope Trust"].join(";")}` : "Hope Trust");
      params.append("investment_advisors", categorized.investment_advisors.length ? `${categorized.investment_advisors.join(";")}` : "Hope Investment Services, Inc.");
    }
    return (
      <Modal animationDuration={100} closeOnOverlayClick={false} styles={{ modal: { paddingBottom: 0, maxWidth: "1200px", minHeight: account.features && account.features.surveys ? "80%" : "350px", borderRadius: "5px", zIndex: 2147483646 }, overlay: { zIndex: 2147483646 } }} open={true} showCloseIcon={false} center>

        <SurveyModalInner align="middle" justify="center">
          <LoaderOverlay show={isLoading} message="Saving..." />
          <Col span={12}>
            <Row>
              <SurveyModalInnerInfoSection span={4} float="left">
                <Button nomargin primary blue onClick={!account.features && account.features.surveys ? () => closeSurvey() : () => this.saveResponsesCloseSurvey(survey)}>{account.features && account.features.surveys ? "Close Survey" : "Close"}</Button>
              </SurveyModalInnerInfoSection>
              {account.features && account.features.surveys
                ? (
                  <SurveyModalInnerInfoSection span={8} float="right">
                    <Row>
                      {survey && next_survey
                        ? (
                          <Col span={12}>
                            <Button nomargin primary blue onClick={() => this.nextSurvey(survey, next_survey)}><NextSurveyButtonText>{next_survey.survey_name}</NextSurveyButtonText> &nbsp;&nbsp;<FontAwesomeIcon icon={["fas", "chevron-right"]} /></Button>
                          </Col>
                        )
                        : null
                      }
                    </Row>
                  </SurveyModalInnerInfoSection>
                )
                : null
              }
            </Row>
          </Col>
          <SurveyModalContent span={12}>
            <Row>
                {account.features && account.features.surveys
                  ? (
                  <Col span={12}>
                    <SurveyInfoHeader>
                      {beneficiary
                        ? (
                          <SurveyInfoHeaderAvatar>
                            <ReactAvatar size={30} src={beneficiary.avatar} name={`${beneficiary.first_name} ${beneficiary.last_name}`} className="survey_avatar" round />
                          </SurveyInfoHeaderAvatar>
                        )
                        : null
                      }
                      {beneficiary.first_name && beneficiary.last_name
                        ? <SurveyInfoHeaderItem>{beneficiary.first_name} {beneficiary.last_name}</SurveyInfoHeaderItem>
                        : null
                      }
                      {beneficiary.birthday
                        ? <SurveyInfoHeaderItem>{moment(beneficiary.birthday).format("MM/DD/YYYY")}</SurveyInfoHeaderItem>
                        : null
                      }
                      {beneficiary.birthday
                        ? <SurveyInfoHeaderItem>{getUserAge(beneficiary.birthday)} years old</SurveyInfoHeaderItem>
                        : null
                      }
                      {beneficiary.gender
                        ? <SurveyInfoHeaderItem>{beneficiary.gender}</SurveyInfoHeaderItem>
                        : null
                      }
                      {beneficiary.pronouns && pronouns[beneficiary.pronouns]
                        ? <SurveyInfoHeaderItem>{pronouns[beneficiary.pronouns]}</SurveyInfoHeaderItem>
                        : null
                      }
                    </SurveyInfoHeader>
                    <SurveyFrame title={survey.survey_name} src={`https://www.surveygizmo.com/s3/${survey.survey_id}/${survey.slug}?${params.toString()}`} frameBorder="0"></SurveyFrame>
                  </Col>
                  )
                  : (
                    <Container title="Surveys" span={12} height={255} paddingtop={20}>
                      <NoPermission message="This feature is not enabled on your account." icon="hand-holding-seedling" />
                    </Container>
                  )
                }
            </Row>
          </SurveyModalContent>
        </SurveyModalInner>

        {is_in_session
          ? (
            <IdleTimer
              ref={(ref) => this.idleTimer = ref}
              element={document}
              onIdle={() => refreshUser()}
              debounce={250}
              timeout={3600000} // 1 hour timeout on each move
              startOnMount={true}
            />
          )
          : null
        }
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  accounts: state.accounts,
  session: state.session,
  user: state.user,
  survey_lookup: state.survey,
  provider: state.provider,
  relationship: state.relationship,
  customer_support: state.customer_support
});
const dispatchToProps = (dispatch) => ({
  closeSurvey: () => dispatch(hopeCarePlan.closeSurvey()),
  setSurvey: (survey) => dispatch(hopeCarePlan.setSurvey(survey)),
  saveCurrentSurvey: (survey) => dispatch(hopeCarePlan.saveCurrentSurvey(survey)),
  refreshUser: () => dispatch(refreshUser())
});
export default connect(mapStateToProps, dispatchToProps)(SurveyModal);
