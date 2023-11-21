import styled, { css } from "styled-components";
import { theme } from "../../global-styles";
import { ViewContainer, Button, InputLabel } from "../../global-components";
import { Row, Col } from "react-simple-flex-grid";

export const BillingContainer = styled(Col)`
  margin-bottom: 20px;
  padding: 0 20px;
`;

export const StripePaymentMain = styled(ViewContainer)`
  position: relative;
  margin: auto;
  align-self: center;
`;

export const StripePaymentSections = styled(Row)`

`;

export const StripePaymentSection = styled(Col)`

`;

export const PaymentCardInfoContainer = styled(Row)`
  box-shadow: 0 1px 6px ${theme.boxShadowLight};
  border-radius: 8px;
  width: 100%;
  overflow: hidden;
  background: ${theme.white};
`;

export const PaymentCardInfo = styled(Col)`
  padding: 10px;
`;


export const PaymentReviewContainer = styled(Row)`
  box-shadow: 0 1px 6px ${theme.boxShadowLight};
  border-radius: 8px;
  width: 100%;
  overflow: hidden;
`;

export const PaymentReviewSection = styled(Col)`

`;

export const PaymentReviewHeader = styled.div`
  font-size: 22px;
  font-weight: 300;
  padding: 15px;
  text-align: left;
  background: ${theme.hopeTrustBlue};
  color: ${theme.white};
  border-radius: 6px 6px 0 0;
`;

export const PaymentReviewBody = styled.div`
  padding: 10px;
`;

export const PaymentReviewLineItems = styled.ul`
  list-style: none;
  text-align: left;
  margin: 0;
  padding: 0;
`;

export const PaymentReviewLineItem = styled.li`
  border-bottom: 1px solid ${theme.lineGrey};
  display: flex;
  flex-direction: row;
  padding: 15px 5px;

  &:last-child {
    border-bottom: 0;
  }
`;

export const PaymentReviewFooter = styled.div`
  font-size: 16px;
  font-weight: 300;
  border-top: 1px solid ${theme.lineGrey};
  padding: 15px 10px;
`;

export const PaymentFooterInputContainer = styled(Row)`
  padding: 20px 5px 20px 5px;
`;

export const PaymentFooterInput = styled(Col)`

`;

export const PaymentFooterInputLabel = styled(InputLabel)`
  display: inline-block;
  font-weight: 500;
  width: 50%;
  text-align: left;
  color: ${theme.fontGrey};
  font-size: 15px;
  padding-bottom: 10px;
`;

export const PaymentFooterInputButtonContainer = styled(Col)`
  align-self: center;
`;

export const PaymentFooterInputButton = styled(Button)`
  margin: 8px 0 0 0;
  font-size: 11px;
  padding: 5px 15px;
`;

export const LineItemTitle = styled.div`
  display: inline-block;
  font-weight: 500;
  width: 50%;
  text-align: left;
  color: ${theme.fontGrey};
  font-size: 15px;
`;

export const LineItemCost = styled.div`
  display: inline-block;
  width: 50%;
  text-align: right;
`;

export const LineItemCostText = styled.span`
  background: ${theme.hopeTrustBlue};
  padding: 4px 15px;
  border-radius: 30px;
  color: ${theme.white}
  font-weight: 300;
  font-size: 15px;

  ${(props) => props.green && css`
    background: ${theme.buttonGreen};
  `};
`;

export const CustomFormStyles = {
  style: {
    base: {
      color: `${theme.fontGrey}`,
      lineHeight: "40px",
      "::placeholder": {
        color: `${theme.lineGrey}`,
        fontWeight: "300",
        fontSize: "13px"
      },
    },
    invalid: {
      color: "#9e2146",
    },
  }
};

export const PaymentHint = styled.span`
  width: 100%;
  text-align:center;
  position: relative;
  top: 5px;
  font-size: 12px;
  font-weight: 300;
  color: ${theme.metadataGrey};
`;

export const PaymentButtonContainer = styled(Row)`
  margin-top: 10px;
  margin-bottom: 10px;
`;

export const PaymentButtonItem = styled(Col)`
  
`;