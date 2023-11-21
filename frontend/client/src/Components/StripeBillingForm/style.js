import styled, { css } from "styled-components";
import { theme } from "../../global-styles";
import { FormButton } from "../../Components/multipart-form/elements.styles";
import { Row, Col } from "react-simple-flex-grid";
import { darken } from "polished";
import media from "styled-media-query";

export const StripeForm = styled("form")`
  
`;
export const StripeBillingFormRow = styled(Row)`
  
`;

export const StripeBillingFormCol = styled(Col)`
  
`;

export const StripeBillingFormInput = styled.input`
  background: ${theme.white};
  width: 100%;
  display: block;
  width: 100%;
  height: 2.75rem;
  padding: 0 0.5rem;

  border-radius: 4px;
  border: 1px solid #EBEDEE;

  &::placeholder {
    color: ${darken(0.09, theme.lineGrey)};
  }

  ${(props) => !props.valid && css`
    outline: 1px solid red;
  `};
`;

export const StripeInputWrapper = styled.div`
  width: 100%;
  padding: 0.77rem 0.5rem;
  border-radius: 4px;
  border: 1px solid #EBEDEE;
  background: ${theme.white};
  margin-bottom: 10px;
  position: relative;
`;

export const CustomFormStyles = {
  style: {
    base: {
      fontSmoothing: "antialiased",
      ":-webkit-autofill": {
        color: "#fce883",
      },
      "::placeholder": {
        color: `${darken(0.09, theme.lineGrey)}`
      }
    },
    invalid: {
      color: "red"
    }
  }
};

export const BrandElement = styled.div`
  position: absolute;
  right: 15px;
  top: 0;
  bottom: 0;
  margin: auto;
  height: 27px;
  font-size: 20px;
`;

export const StripeBillingFormLabel = styled.label`
  margin: 1rem 0 0.5rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;

  ${media.lessThan("medium")`
    flex-direction: column;
    align-items: start;
  `};

  ${media.lessThan("small")`
    font-size: 12px;
  `};

  ${(props) => props.required && css`
    justify-content: start;

    &::before {
      content: "*";
      color: red;
      margin-right: 5px;
      text-align: right;
      font-size: 11px;
    }
  `};
`;

export const StripeBillingFormLineItem = styled.div`
  
`;
export const StripeBillingFormLineItemPadding = styled.div`
  
`;
export const StripeBillingFormLineItemInner = styled(Row)`
  border-bottom: 0.35px solid rgba(133, 149, 162, 0.2);
  margin-bottom: 10px;
  padding-bottom: 10px;

  ${(props) => props.margintop && css`
    margin-top: ${props.margintop}px;
  `};
`;
export const StripeBillingFormLineItemSection = styled(Col)`
  align-self: center;
`;
export const StripeBillingFormLineItemText = styled.div`
  font-family: Noto Sans;
  font-style: normal;
  font-weight: bold;
  font-size: 17px;
  line-height: 23px;
  text-align: left;
  color: #2E395A;
`;
export const StripeBillingFormLineItemCost = styled.div`
  font-family: Merriweather;
  font-style: normal;
  font-weight: bold;
  font-size: 20px;
  line-height: 34px;
  text-align: right;
  color: #8DD69A;
`;
export const StripeBilllingFormInputSections = styled(Row)`
  align-items: center;
`;
export const StripeBillingFormInputSection = styled(Col)`
  align-self: center;
  position: relative;
`;

export const StripeBillingFormInputApplyLink = styled.button`
  font-family: Noto Sans;
  font-style: normal;
  font-weight: bold;
  font-size: 15px;
  line-height: 20px;
  text-align: right;
  text-decoration-line: underline;
  color: #2E395A;
  position: relative;
  display: inline-block;
  cursor: pointer;
  background: transparent;
  border: none;
  vertical-align: middle;
  height: 2rem;

  ${(props) => props.disabled && css`
    color: grey;
    cursor: no-drop;
  `};

`;

export const StripeBillingFormLineItemSubText = styled.div`
  font-size: 12px;
  color: grey;
  margin-top:5px;
`;

export const DiscountFieldMessage = styled.div`
  font-size: 12px;
  color: ${theme.buttonGreen};
  margin-top: 5px;
`;

export const CardInfoOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
`;
export const CardInfoOverlayPadding = styled.div`
  height: 100%;
  width: 100%;
`;
export const CardInfoOverlayInner = styled.div`
  height: 100%;
  width: 100%;
  background: rgba(255,255,255,0.9);
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  flex-direction: column;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
`;

export const CardInfoOverlayText = styled.div`
  font-family: Noto Sans;
  font-style: normal;
  font-weight: bold;
  font-size: 15px;
  line-height: 20px;
  display: block;
  margin-bottom: 20px;
`;

export const CardInfoOverlayBrand = styled.div`
  font-family: Noto Sans;
  font-style: normal;
  font-weight: bold;
  font-size: 35px;
  line-height: 20px;
  display: block;
  margin-bottom: 20px;
`;

export const CardInfoOverlayButton = styled(FormButton)`
  
`;