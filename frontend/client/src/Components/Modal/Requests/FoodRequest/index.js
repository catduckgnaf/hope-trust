import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "beautiful-react-redux";
import RequestWrapper from "../RequestWrapper";
import Stepper from "react-stepper-horizontal";
import moment from "moment";
import { theme } from "../../../../global-styles";
import { buildRequestBody } from "./utilities";
import { showNotification } from "../../../../store/actions/notification";
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
import {} from "./style";

export const steps = [
  {
    title: "Type",
    message: "Reason for your request",
    required: [
      "request_subcategory"
    ]
  },
  {
    title: "Location",
    message: "Where would you like food from?",
    required: [
      "store"
    ]
  },
  {
    title: "Order",
    message: "What food would you like to order?",
    required: [
      "items"
    ]
  },
  {
    title: "Delivery",
    message: "Where and when would you like your food delivered?",
    required: [
      "date",
      "address",
      "city",
      "state",
      "zip"
    ]
  },
  {
    title: "Priority",
    message: "Priority for your request",
    required: [
      "priority"
    ]
  }
];


class FoodRequest extends Component {

  static propTypes = {
    callback: PropTypes.func.isRequired,
    user: PropTypes.oneOfType([
      PropTypes.bool.isRequired,
      PropTypes.instanceOf(Object).isRequired
    ])
  }
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { relationship } = props;
    const beneficiary_user = relationship.list.find((u) => u.type === "beneficiary");

    this.state = {
      priority: "normal",
      request_type: "food",
      request_subcategory: "",
      new_item: "",
      store: "",
      items: [],
      address: beneficiary_user.address,
      address2: beneficiary_user.address2,
      city: beneficiary_user.city,
      state: beneficiary_user.state,
      zip: beneficiary_user.zip,
      date: null,
      date_error: false,
      currentStep: 0
    };
  }

  updateRequestBody = (id, value) => this.setState({ [id]: value });

  updateRequestItems = (item, index) => {
    let { items } = this.state;
    items[index] = item;
    this.setState({ items: items.filter((e) => e) });
  };

  removeItem = (item) => {
    let { items } = this.state;
    items = items.filter((i) => i !== item);
    this.setState({ items: items.filter((e) => e) });
  };

  addNewRequestItem = (event, blurred) => {
    const { showNotification } = this.props;
    let { items } = this.state;
    if (event.key === "Enter") {
      if (event.target.value.length) {
        if (!items.includes(event.target.value)) {
          items.push(event.target.value);
          this.setState({ items, new_item: "" }, () => document.getElementById("addNewItemInput").value = "");
        } else {
          showNotification("error", "Missing information", "This item is already on your list.");
        }
      } else {
        showNotification("error", "Missing information", "You need to enter an item to add.");
      }
    } else if (blurred) {
      if (event.target.value.length) {
        items.push(event.target.value);
        this.setState({ items, new_item: "" }, () => document.getElementById("addNewItemInput").value = "");
      }
    }
  };

  submitRequest = () => {
    const { callback, user, showNotification } = this.props;
    const {
      priority,
      request_type,
      request_subcategory,
      store,
      items,
      date,
      address,
      address2,
      city,
      state,
      zip
    } = this.state;
    let lastItem = items[items.length - 1];
    if (items.length && date && store && address && city && state && zip && priority) {
      callback({
        title: `${user.first_name} is requesting a ${request_subcategory} ${request_type} delivery`,
        body: `${priority === "urgent" ? "An" : "A"} ${priority} priority ${request_type} request from ${user.first_name} ${user.last_name}. ${user.first_name} would like ${items.length > 1 ? `${items.slice(0,-1).join(", ") + " and " + lastItem}` : items[0]} from ${store} delivered on ${moment(date).format("MMMM DD, YYYY [at] h:mm A")}`,
        priority: priority || "normal",
        request_type,
        request_subcategory,
        store,
        items: [...items, lastItem],
        date,
        address,
        address2,
        city,
        state,
        zip
      });
    } else {
      showNotification("error", "Missing information", "You need to fill in all required fields.");
    }
  };

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

  render() {
    const {
      currentStep
    } = this.state;
    let requestView = buildRequestBody(this.state, steps, { onClear: this.onClear, onChange: this.onChange, updateRequest: this.updateRequestBody, updateRequestItems: this.updateRequestItems, addNewRequestItem: this.addNewRequestItem, removeItem: this.removeItem });
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
          <RequestModalBodyInner span={12}>{requestView}</RequestModalBodyInner>
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
                <RequestModalButton disabled={!required.every((req) => req)} width={125} type="button" onClick={this.submitRequest} secondary blue nomargin>Submit</RequestModalButton>
              </RequestModalNavigationSection>
            </RequestNavigation>
          )
        }
      </RequestWrapper>
    );
  }
}

const mapStateToProps = (state) => ({
  relationship: state.relationship,
  user: state.user
});
const dispatchToProps = (dispatch) => ({
  showNotification: (type, title, message, meta) => dispatch(showNotification(type, title, message, meta))
});
export default connect(mapStateToProps, dispatchToProps)(FoodRequest);
