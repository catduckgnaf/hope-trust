import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "beautiful-react-redux";
import RequestWrapper from "../RequestWrapper";
import Stepper from "react-stepper-horizontal";
import { theme } from "../../../../global-styles";
import { showNotification } from "../../../../store/actions/notification";
import { buildRequestBody } from "./utilities";
import moment from "moment";
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
    title: "Destination",
    message: "Where would you like to go?",
    required: [
      "destination",
      "address",
      "city",
      "state",
      "zip"
    ]
  },
  {
    title: "Dropoff",
    message: "When would you like to go?",
    required: [
      "dropoff_date"
    ]
  },
  {
    title: "Pickup",
    message: "When do you need to be picked up?",
    required: []
  },
  {
    title: "Priority",
    message: "Priority for your request:",
    required: [
      "priority"
    ]
  }
];

class TransportationRequest extends Component {

  static propTypes = {
    callback: PropTypes.func.isRequired
  }
  static defaultProps = {};

  constructor(props) {
    super(props);

    this.state = {
      priority: "normal",
      request_type: "transportation",
      destination: "",
      address: "",
      address2: "",
      city: "",
      state: "",
      zip: "",
      pickup_date: null,
      dropoff_date: null,
      currentStep: 0,
      pickup_date_error: false,
      dropoff_date_error: false
    };
  }

  updateRequestBody = (id, value) => this.setState({ [id]: value });

  onChange = (suggestion) => {
    this.setState({
      address: suggestion.name,
      city: suggestion.city || suggestion.suburb || "",
      state: suggestion.administrative,
      zip: suggestion.postcode
    });
  };

  onClear = () => {
    this.setState({
      address: "",
      address2: "",
      city: "",
      state: "",
      zip: ""
    });
  };

  submitRequest = () => {
    const { callback, user, showNotification } = this.props;
    const {
      priority,
      request_type,
      destination,
      address,
      address2,
      city,
      state,
      zip,
      pickup_date,
      dropoff_date
    } = this.state;
    if (dropoff_date && address && destination && city && state && zip && priority) {
      callback({
        title: `${user.first_name} is requesting ${request_type} to ${destination}`,
        body: `${priority === "urgent" ? "An" : "A"} ${priority} priority ${request_type} request from ${user.first_name} ${user.last_name}. ${user.first_name} would like transportation to ${destination} on ${moment(dropoff_date).format("MMMM DD, YYYY [at] h:mm A")}.${pickup_date ? ` ${user.first_name} would like to be picked up on ${moment(pickup_date).format("MMMM DD, YYYY [at] h:mm A")}` : ""}`,
        priority: priority || "normal",
        request_type,
        destination,
        address,
        address2,
        city,
        state,
        zip,
        pickup_date: new Date(pickup_date),
        dropoff_date: new Date(dropoff_date)
      });
    } else {
      showNotification("error", "Missing information", "You need to fill in all required fields.");
    }
  };

  render() {
    const { currentStep } = this.state;
    const required = steps[currentStep].required.map((r) => !!this.state[r]);
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
          <RequestModalBodyInner span={12}>{buildRequestBody(this.state, steps, { updateRequestBody: this.updateRequestBody, onChange: this.onChange, onClear: this.onClear })}</RequestModalBodyInner>
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
  user: state.user
});
const dispatchToProps = (dispatch) => ({
  showNotification: (type, title, message, meta) => dispatch(showNotification(type, title, message, meta))
});
export default connect(mapStateToProps, dispatchToProps)(TransportationRequest);
