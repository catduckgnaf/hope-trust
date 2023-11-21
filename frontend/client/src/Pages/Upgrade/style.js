import styled, { css } from "styled-components";
import { Row, Col } from "react-simple-flex-grid";
import {
  Button,
  InputLabel
} from "../../global-components";
import { theme } from "../../global-styles";

export const UpgradeContainerMain = styled.div`
  
`;

export const UpgradeContainerPadding = styled.div`
  padding: 10px;
`;

export const UpgradeContainerInner = styled(Row)`
  
`;

export const UpgradeContainerPlans = styled(Col)`
  
`;

export const PaymentFooterInputContainer = styled(Row)`
  padding: 20px 5px 20px 5px;
  ${(props) => props.paddingtop && css`
    padding-top: ${props.paddingtop}px !important;
  `};
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