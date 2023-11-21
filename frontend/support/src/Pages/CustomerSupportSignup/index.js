import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { Fade } from "@gfazioli/react-animatecss";
import AuthenticationStepper from "../AuthenticationStepper";
import { merge } from "lodash";
import { buildAuthenticationView, steps, step_conditions } from "./utilities";
import { hideLoader } from "../../store/actions/loader";
import { checkUserEmail } from "../../store/actions/user";
import { signup, changeStep, createCustomerSupportSignupError, updateCustomerSupportSignupState } from "../../store/actions/customer-support-signup";
import logo from "../../assets/images/logo-large.svg";
import {
  AuthenticationHeader,
  AuthenticationWrapper,
  AuthenticationWrapperItem,
  AuthenticationLogoContainer,
  AuthenticationLogo,
  AuthenticationFooter,
  Button,
  Hint,
  RequiredStar
} from "../../global-components";
import {
  StepperNavigation,
  AuthenticationStepperHeader,
  AuthenticationStepperHeaderMessage,
  AuthenticationStepperHeaderStepInfo
} from "../AuthenticationStepper/style";
import { SignupViewContainer } from "./style";

class CustomerSupportSignup extends Component {

  constructor(props) {
    super(props);
    const { customerSupportSignupState } = props;
    document.title = "Customer Support Signup";
    const storedState = customerSupportSignupState.state;

    this.state = {
      creatorDetails: {
        first_name: "",
        middle_name: "",
        last_name: "",
        address: "",
        address2: "",
        city: "",
        state: "",
        zip: "",
        email: "",
        birthday: "",
        home_phone: "",
        other_phone: "",
        fax: "",
        password: "",
        confirmPassword: "",
        avatar: "",
        gender: ""
      },
      code: "",
      steps,
      untouched: "",
      avatar_error: "",
      avatar_rotation: 0,
      missingFields: {},
      creator_email_error: "",
      creator_email_valid: false,
      is_checking_creator_email: false,
      ...storedState
    };
  }

  throwAvatarError = (type) => {
    switch (type) {
      case "not_image":
        this.setNewState("avatar_error", "This file type is not supported.");
        break;
      case "maxsize":
        this.setNewState("avatar_error", "Avatar must be less than 2MB");
        break;
      default:
        break;
    }
    setTimeout(() => {
      this.setNewState("avatar_error", "");
    }, 3000);
  };

  validateForm = () => {
    const { creatorDetails, creator_email_valid } = this.state;
    const { createCustomerSupportSignupError, hideLoader } = this.props;
    if (creatorDetails.email.includes("@hopetrust.com")) {
      let missingFields = {};
      if (!creator_email_valid && creatorDetails.email) {
        missingFields["email"] = true;
        createCustomerSupportSignupError("This email is already in use.", "Email Error");
        this.setNewState("missingFields", missingFields);
        hideLoader();
        return false;
      }
      let notRequired = [
        "address2",
        "avatar",
        "middle_name",
        "fax",
      ];

      if (creatorDetails.password !== creatorDetails.confirmPassword) {
        createCustomerSupportSignupError("Passwords do not match", "Required form fields");
        this.setNewState("missingFields", { ...missingFields, password: true, confirmPassword: true });
        hideLoader();
        return false;
      } else if (creatorDetails.password.length < 16) {
        createCustomerSupportSignupError("Password is not long enough, must be at least 16 characters", "Required form fields");
        this.setNewState("missingFields", { ...missingFields, password: true, confirmPassword: true });
        hideLoader();
        return false;
      } else if (!creatorDetails.password.replace(/[^A-Z]/g, "").length) {
        createCustomerSupportSignupError("Password must contain at least 1 uppercase letter.", "Required form fields");
        this.setNewState("missingFields", { ...missingFields, password: true, confirmPassword: true });
        hideLoader();
        return false;
      } else if (!/\d/.test(creatorDetails.password)) {
        createCustomerSupportSignupError("Password must contain at least 1 number.", "Required form fields");
        this.setNewState("missingFields", { ...missingFields, password: true, confirmPassword: true });
        hideLoader();
        return false;
      } else {
        let fields;
        fields = creatorDetails;
        Object.keys(fields).forEach((argument) => {
          if (!notRequired.includes(argument) && !fields[argument]) {
            missingFields[argument] = true;
          }
        });

        const requiredFields = Object.keys(fields).filter((field) => !notRequired.includes(field));
        if (Object.values(requiredFields).every((argument) => fields[argument].length > 0)) {
          return true;
        } else {
          let missingFields = {};
          Object.keys(fields).forEach((argument) => {
            if (!notRequired.includes(argument) && (!fields[argument].length > 0 || !fields[argument])) {
              missingFields[argument] = true;
            }
          });
          if (Object.keys(missingFields).length) {
            createCustomerSupportSignupError(`You must fill in all required fields. ${Object.keys(missingFields).length} fields are missing`, "Required form fields");
          }
          this.setNewState("missingFields", missingFields);
          hideLoader();
          return false;
        }
      }
    } else {
      createCustomerSupportSignupError("Email must be a Hope Trust email.", "Required form fields");
      this.setNewState("missingFields", { email: true });
      hideLoader();
      return false;
    }
  };

  signupUser = async () => {
    const { updateCustomerSupportSignupState, signup } = this.props;
    updateCustomerSupportSignupState({ state: this.state });
    const { creatorDetails } = this.state;
    if (this.validateForm()) return await signup(creatorDetails);
  };

  setNewState = (id, value) => {
    const { creatorDetails } = this.state;
    if(this.mounted) {
      if (creatorDetails.hasOwnProperty(id)) {
        const newState = merge(this.state.creatorDetails, { [id]: value });
        this.setState({ creatorDetails: newState });
      } else {
        this.setState({ [id]: value });
      }
    }
  };

  updateBulkState = (type, updates) => {
    const newState = merge(this.state[type], { ...updates });
    this.setState({ [type]: newState });
  };

  checkUserEmail = async (email, type) => {
    const { checkUserEmail } = this.props;
    this.setState({ is_checking_creator_email: true });
    const is_valid_email = await checkUserEmail(email, type);
    this.setState({ creator_email_error: is_valid_email.message, creator_email_valid: is_valid_email.success, is_checking_creator_email: false });
  };

  componentDidMount() {
    this.mounted = true;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  render() {
    let {
      steps
    } = this.state;
    const { customerSupportSignupState, changeStep } = this.props;
    const required = steps[customerSupportSignupState.currentStep].required.map((r) => steps[customerSupportSignupState.currentStep].slug ? !!this.state[steps[customerSupportSignupState.currentStep].slug][r] : !!this.state[r]);
    const conditions = step_conditions(this.state)[steps[customerSupportSignupState.currentStep].title].map((r) => r());

    return (
    <SignupViewContainer>
      <AuthenticationHeader>
        <AuthenticationLogoContainer>
          <AuthenticationLogo src={logo} alt="HopeTrust Logo"/>
          {!customerSupportSignupState.confirmationRequired
            ? (
              <AuthenticationStepperHeader>
                <AuthenticationStepperHeaderMessage>{steps[customerSupportSignupState.currentStep].message}</AuthenticationStepperHeaderMessage>
                <AuthenticationStepperHeaderStepInfo>Step {customerSupportSignupState.currentStep + 1} of {steps.length}</AuthenticationStepperHeaderStepInfo>
              </AuthenticationStepperHeader>
            )
            : null
          }
        </AuthenticationLogoContainer>
        {!customerSupportSignupState.confirmationRequired
          ? <AuthenticationStepper steps={steps} currentStep={customerSupportSignupState.currentStep} />
          : null
        }
      </AuthenticationHeader>
      <AuthenticationWrapper>
        <AuthenticationWrapperItem maxWidth={!customerSupportSignupState.confirmationRequired ? 1280 : 780}>
          <Fade animate={true}>
            {buildAuthenticationView({ ...this.state, steps }, { checkUserEmail: this.checkUserEmail, setNewState: this.setNewState, updateBulkState: this.updateBulkState, throwAvatarError: this.throwAvatarError })}
            {steps[customerSupportSignupState.currentStep].required.length && !customerSupportSignupState.confirmationRequired
              ? <Hint paddingtop={10}><RequiredStar>*</RequiredStar> indicates a required field.</Hint>
              : null
            }
          </Fade>
        </AuthenticationWrapperItem>
      </AuthenticationWrapper>
      <AuthenticationFooter>
        {!customerSupportSignupState.confirmationRequired
          ? (
            <StepperNavigation>
              {customerSupportSignupState.currentStep > 0
                ? (
                  <Fade animate={true}>
                    <Button type="button" onClick={() => changeStep("backward", this.state)} primary outline>Previous</Button>
                  </Fade>
                )
                : null
              }
              {customerSupportSignupState.currentStep === steps.length - 1
                ? (
                  <Fade animate={true}>
                    <Button
                      secondary
                      outline
                      type="button"
                      disabled={!required.every((req) => req) || !conditions.every((con) => con)}
                      onClick={() => this.signupUser()}>
                      Complete
                    </Button>
                  </Fade>
                  )
                : (
                  <Fade animate={true}>
                    <Button
                      secondary
                      outline
                      type="button"
                      disabled={!required.every((req) => req) || !conditions.every((con) => con)}
                      onClick={() => changeStep("forward", this.state)}>
                      Next
                    </Button>
                  </Fade>
                  )
              }
            </StepperNavigation>
          )
          : null
        }
      </AuthenticationFooter>
    </SignupViewContainer>
    );
  }
}

const mapStateToProps = (state) => ({
  customerSupportSignupState: state.customer_support_signup
});
const dispatchToProps = (dispatch) => ({
  signup: (details) => dispatch(signup(details)),
  hideLoader: () => dispatch(hideLoader()),
  changeStep: (step, state) => dispatch(changeStep(step, state)),
  checkUserEmail: (email, type) => dispatch(checkUserEmail(email, type)),
  updateCustomerSupportSignupState:(updates) => dispatch(updateCustomerSupportSignupState(updates)),
  createCustomerSupportSignupError: (error, resource) => dispatch(createCustomerSupportSignupError(error, resource)),
});
export default connect(mapStateToProps, dispatchToProps)(CustomerSupportSignup);
