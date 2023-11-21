import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "beautiful-react-redux";
import RequestWrapper from "../RequestWrapper";
import Stepper from "react-stepper-horizontal";
import { theme } from "../../../../global-styles";
import { buildRequestBody } from "./utilities";
import moment from "moment";
import { showNotification } from "../../../../store/actions/notification";
import { openCreateProviderModal } from "../../../../store/actions/provider";
import {
  StepperContainer,
  RequestModal,
  RequestModalPadding,
  RequestModalInner,
  RequestModalBody,
  RequestModalBodyInner,
  RequestModalInnerSection,
  RequestModalButton,
  StepperHeader,
  StepperHeaderMessage,
  StepperHeaderStepInfo,
  RequestNavigation,
  RequestModalNavigationSection
} from "../style";
import { } from "./style";

export const steps = [
  {
    title: "Doctor",
    message: "Which doctor would like to see?",
    required: [
      "provider_acknowledged"
    ]
  },
  {
    title: "Reason",
    message: "Why would you like to see the doctor?",
    required: [
      "request_subcategory",
      "notes"
    ]
  },
  {
    title: "Dates",
    message: "When would you like to see the doctor?",
    required: [
      "date_choices"
    ]
  },
  {
    title: "Priority",
    message: "Priority for your request:",
    required: [
      "priority"
    ]
  }
];

class MedicalRequest extends Component {

  static propTypes = {
    callback: PropTypes.func.isRequired,
    openCreateProviderModal: PropTypes.func.isRequired
  }
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { provider, accounts, session } = props;
    const account = accounts.find((account) => account.account_id === session.account_id);

    this.state = {
      notes: "",
      priority: "normal",
      request_type: "medical",
      request_subcategory: "",
      find_new: false,
      provider: false,
      provider_acknowledged: false,
      date_choices: [],
      date_1_error: false,
      date_2_error: false,
      date_3_error: false,
      currentStep: 0,
      providers: provider.list,
      permissions: account.permissions
    };
  }

  updateRequestBody = (id, value) => this.setState({ [id]: value });

  updateDateChoices = (index, date) => {
    let { date_choices } = this.state;
    date_choices[index] = date;
    this.setState({ date_choices });
  };

  submitRequest = () => {
    const { callback, user, showNotification } = this.props;
    const {
      notes,
      priority,
      request_type,
      request_subcategory,
      provider,
      find_new,
      date_choices
    } = this.state;
    if (notes && date_choices.length && request_subcategory && ((provider && provider.name) || find_new)) {
      callback({
        title: `${user.first_name} is requesting ${request_subcategory !== "other" ? `a ${request_subcategory}.` : "medical attention."}`,
        notes,
        body: `${user.first_name} is requesting ${request_subcategory !== "other" ? `a ${request_subcategory}` : "medical assistance"}${provider && !find_new ? `${(provider.contact_first && provider.contact_last) ? ` with ${provider.contact_first} ${provider.contact_last}` : ""}${provider.name ? ` at ${provider.name}.` : ""}` : "."}${find_new && !provider ? ` ${user.first_name} prefers that we find a new provider.` : ""} ${date_choices.length === 1 ? `The requested date is ${date_choices.map((d) => moment(d).format("MM/DD/YYYY [at] h:mm A"))}.` : `The requested dates are ${date_choices.map((d) => moment(d).format("MM/DD/YYYY [at] h:mm A")).join(", ").replace(/, ((?:.(?!, ))+)$/, " and $1")}.`}\n\n The reason for the request is "${notes}"`,
        priority: priority || "normal",
        request_type,
        request_subcategory,
        provider,
        date_choices
      });
    } else {
      showNotification("error", "Missing information", "You need to fill in all required fields.");
    }
  };

  newProvider = () => {
    const { openCreateProviderModal } = this.props;
    this.setState({
      provider: {},
      find_new: false,
    }, () => openCreateProviderModal());
  };

  render() {
    const { currentStep } = this.state;
    const required = steps[currentStep].required.map((r) => Array.isArray(this.state[r]) ? !!this.state[r].length : !!this.state[r]);
    return (
      <RequestWrapper>
        <RequestModal>
          <RequestModalPadding span={12}>
            <RequestModalInner>
              <RequestModalInnerSection span={12}>
                <StepperHeader>
                  <StepperHeaderMessage>
                    {steps[currentStep].message}
                  </StepperHeaderMessage>
                  <StepperHeaderStepInfo>
                    Step {currentStep + 1} of {steps.length}
                  </StepperHeaderStepInfo>
                </StepperHeader>
                <StepperContainer>
                  <Stepper
                    steps={steps}
                    activeStep={currentStep}
                    disabledSteps={null}
                    circleFontSize={0}
                    size={12}
                    titleTop={10}
                    activeTitleColor={theme.metadataGrey}
                    completeTitleColor={theme.buttonGreen}
                    defaultTitleColor={theme.fontGrey}
                    defaultTitleOpacity="0.4"
                    completeTitleOpacity="0.8"
                    activeTitleOpacity="1"
                    titleFontSize={11}
                    defaultColor={theme.rowGrey}
                    completeColor={theme.buttonGreen}
                    activeColor={theme.buttonLightGreen}
                    defaultBarColor={theme.buttonLightGreen}
                    completeBarColor={theme.buttonGreen}
                    defaultBorderColor={theme.rowGrey}
                    completeBorderColor={theme.buttonLightGreen}
                    activeBorderColor={theme.buttonGreen}
                    defaultBorderStyle="solid"
                    completeBorderStyle="solid"
                    activeBorderStyle="solid"
                    defaultBorderWidth={2}
                  />
                </StepperContainer>
              </RequestModalInnerSection>
            </RequestModalInner>
          </RequestModalPadding>
        </RequestModal>

        <RequestModalBody>
          <RequestModalBodyInner span={12}>{buildRequestBody(this.state, steps, { updateRequestBody: this.updateRequestBody, updateDateChoices: this.updateDateChoices, newProvider: this.newProvider })}</RequestModalBodyInner>
        </RequestModalBody>

        {currentStep + 1 !== steps.length
          ? (
            <RequestNavigation>
              {currentStep > 0
                ? (
                  <RequestModalNavigationSection span={6}>
                    <RequestModalButton width={125} type="button" onClick={() => this.setState({ currentStep: currentStep - 1 })} secondary blue nomargin>Previous</RequestModalButton>
                  </RequestModalNavigationSection>
                )
                : null
              }
              <RequestModalNavigationSection span={currentStep > 0 ? 6 : 12}>
                <RequestModalButton disabled={!required.every((req) => req)} width={125} type="button" onClick={() => this.setState({ currentStep: currentStep + 1 })} secondary blue nomargin>Next</RequestModalButton>
              </RequestModalNavigationSection>
            </RequestNavigation>
          )
          : (
            <RequestNavigation>
              <RequestModalNavigationSection span={6}>
                <RequestModalButton width={125} type="button" onClick={() => this.setState({ currentStep: currentStep - 1 })} secondary blue nomargin>Previous</RequestModalButton>
              </RequestModalNavigationSection>
              <RequestModalNavigationSection span={6}>
                <RequestModalButton disabled={!required.every((req) => req)} width={125} type="button" onClick={() => this.submitRequest()} secondary blue nomargin>Submit</RequestModalButton>
              </RequestModalNavigationSection>
            </RequestNavigation>
          )
        }
      </RequestWrapper>
    );
  }
}

const mapStateToProps = (state) => ({
  accounts: state.accounts,
  user: state.user,
  session: state.session,
  provider: state.provider
});
const dispatchToProps = (dispatch) => ({
  showNotification: (type, title, message, meta) => dispatch(showNotification(type, title, message, meta)),
  openCreateProviderModal: () => dispatch(openCreateProviderModal()),
});
export default connect(mapStateToProps, dispatchToProps)(MedicalRequest);
