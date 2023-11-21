import React from "react";
import ConfirmCustomerSupportSignUpForm from "../../Components/ConfirmCustomerSupportSignUpForm";
import CustomerSupportUserSignUpForm from "../../Components/CustomerSupportUserSignUpForm";
import { AuthenticationWrapperItemInner, ViewContainer, Button } from "../../global-components";
import AvatarImageCr from "react-avatar-image-cropper";
import Resizer from "react-image-file-resizer";
import { verifyPhoneFormat, checkPasswordConditions } from "../../utilities";
import { store } from "../../store";
import { theme } from "../../global-styles";
import {
  ImageCropperPreview,
  ImageCropperStartOver
} from "./style";

const switchStep = (state, helpers) => {
  let creator = state.creatorDetails;

  const getAvatarBlob = async (event) => {
    Resizer.imageFileResizer(
      event,
      200,
      200,
      "JPEG",
      100,
      state.avatar_rotation,
      (uri) => {
        helpers.setNewState("avatar", uri);
        helpers.setNewState("avatar_error", "");
      },
      "base64"
    );
  };
  switch(state.steps[store.getState().customer_support_signup.currentStep].title) {
    case "About You":
      return (
        <CustomerSupportUserSignUpForm
          is_checking_creator_email={state.is_checking_creator_email}
          creator_email_valid={state.creator_email_valid}
          creator_email_error={state.creator_email_error}
          checkUserEmail={helpers.checkUserEmail}
          updateBulkState={helpers.updateBulkState}
          setNewState={helpers.setNewState}
          details={{ ...creator }}
          missingFields={state.missingFields}
        />
      );
    case "Photo":
      const hasAvatar = (state.creatorDetails.avatar);
      return (
        <ViewContainer style={!hasAvatar ? { height: "335px", marginTop: "15px" } : {}}>
          {!hasAvatar
            ? (
              <ViewContainer style={{ width: "300px", height: "300px", margin: "auto", border: `2px dashed ${state.avatar_error ? theme.errorRed : theme.hopeTrustBlue}` }}>
                <AvatarImageCr maxsize={1024 * 1024 * 10} apply={(e) => getAvatarBlob(e)} isBack={false} text={state.avatar_error ? state.avatar_error : "Drag a File or Click to Browse"} errorHandler={(type) => helpers.throwAvatarError(type)} iconStyle={{ marginBottom: "20px", width: "100px", height: "65px" }} sliderConStyle={{ position: "relative", top: "5px", background: "transparent" }}/>
              </ViewContainer>
            )
            : (
              <ViewContainer>
                <ImageCropperPreview src={state.creatorDetails.avatar} />
                <ImageCropperStartOver>
                  <Button blue secondary small rounded onClick={() => helpers.setNewState("avatar", "")}>Start Over</Button>
                </ImageCropperStartOver>
              </ViewContainer>
            )
          }
        </ViewContainer>
      );
    default:
      return (
        <div>Default view</div>
      );
  }
};

export const buildAuthenticationView = (state, helpers) => {
  if (!store.getState().customer_support_signup.confirmationRequired) {
    return (
      <AuthenticationWrapperItemInner>
        {switchStep(state, helpers)}
      </AuthenticationWrapperItemInner>
    );
  } else {
    return (
      <AuthenticationWrapperItemInner>
        <ConfirmCustomerSupportSignUpForm
          setNewState={helpers.setNewState}
          details={state}
        />
      </AuthenticationWrapperItemInner>
    );
  }
};

export const steps = [
  {
    title: "About You",
    message: "Add Some Information About Yourself",
    slug: "creatorDetails",
    required: [
      "first_name",
      "last_name",
      "address",
      "city",
      "state",
      "zip",
      "email",
      "birthday",
      "home_phone",
      "password",
      "confirmPassword",
      "gender"
    ]
  },
  {
    title: "Photo",
    message: "Add a Photo of Yourself",
    slug: "creatorDetails",
    required: [
      "avatar"
    ]
  }
];

export const step_conditions = (state) => {
  return {
    "About You": [
      () => state.creator_email_valid,
      () => !!state.creatorDetails.email,
      () => (state.creatorDetails.password && state.creatorDetails.confirmPassword) && checkPasswordConditions(8, state.creatorDetails.password, state.creatorDetails.confirmPassword).pass,
      () => verifyPhoneFormat(state.creatorDetails.home_phone),
      () => verifyPhoneFormat(state.creatorDetails.other_phone)
    ],
    "Photo": []
  };
};
