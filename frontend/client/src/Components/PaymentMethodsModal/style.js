import styled, { css } from "styled-components";
import { theme } from "../../global-styles";
import { Row, Col } from "react-simple-flex-grid";

export const PaymentMethodsMain= styled.div`
  
`;

export const PaymentMethodsMainPadding = styled.div`
  
`;

export const PaymentMethodsMainInner = styled(Row)`
  
`;

export const PaymentMethodsMainInnerSection = styled(Col)`
  
`;

export const PaymentMethodHeader = styled.div`
  color: ${theme.hopeTrustBlue};
  padding: 10px 10px 20px 10px;
  text-align: center;
  font-size: 22px;
  font-weight: 400;
  border-bottom: 1px solid ${theme.lineGrey};

  ${(props) => !props.show_payment_method_messaging && css`
    margin-bottom: 30px;
  `};
`;

export const PaymentMethodMessage = styled.div`
  color: ${theme.hopeTrustBlue};
  padding: 20px;
  text-align: center;
  font-weight: 300;
  font-size: 12px;
`;

export const PaymentMethodHint = styled.div`
  color: ${theme.hopeTrustBlue};
  text-align: center;
  font-weight: 300;
  font-size: 12px;
  width: 100%;
`;