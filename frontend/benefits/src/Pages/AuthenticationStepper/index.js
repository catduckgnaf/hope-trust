import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import Stepper from "react-stepper-horizontal";
import { theme } from "../../global-styles";
import { StepperContainer } from "./style";
import { isMobile } from "react-device-detect";

class AuthenitcationStepper extends Component {

  static propTypes = {
    steps: PropTypes.instanceOf(Array).isRequired
  }

  render() {
    const { steps, currentStep } = this.props;
    return (
      <StepperContainer>
        <Stepper
          steps={steps}
          activeStep={currentStep}
          disabledSteps={null}
          circleFontSize={0}
          size={20}
          titleTop={10}
          activeTitleColor={theme.metadataGrey}
          completeTitleColor={theme.buttonGreen}
          defaultTitleColor={theme.fontGrey}
          defaultTitleOpacity="0.4"
          completeTitleOpacity="0.8"
          activeTitleOpacity="1"
          titleFontSize={isMobile ? 10 : 12}
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
    );
  }
}

const mapStateToProps = (state) => ({});
const dispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, dispatchToProps)(AuthenitcationStepper);
