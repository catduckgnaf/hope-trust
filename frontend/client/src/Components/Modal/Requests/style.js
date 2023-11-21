import styled from "styled-components";
import { Row, Col } from "react-simple-flex-grid";
import { Button } from "../../../global-components";
import { theme } from "../../../global-styles";

export const StepperContainer = styled.div`
  width: 100%;
`;

export const RequestModal = styled(Row)`
  position: sticky;
  top: 40px;
  background: ${theme.white};
  z-index: 1;
`;

export const RequestModalPadding = styled(Col)`
  
`;

export const RequestModalInner = styled(Row)`
  
`;

export const RequestModalInnerSection = styled(Col)`
  
`;

export const RequestModalBody = styled(Row)`
`;

export const RequestModalBodyInner = styled(Col)`
  padding: 20px 10px 0 10px;
`;

export const RequestModalButton = styled(Button)`
    
`;

export const StepperHeader = styled.div`
  width: 100%;
  text-align: center;
`;

export const StepperHeaderMessage = styled.div`
  color: ${theme.activeTextGrey};
  font-size: 16px;
  font-weight: 400;
  padding: 30px 10px 10px;
`;

export const StepperHeaderStepInfo = styled.div`
  color: ${theme.metadataGrey};
  font-size: 16px;
  font-weight: 400;
  padding-top: 10px;
`;

export const RequestNavigation = styled(Row)`
  text-align: center;
  padding: 10px 0;
  position: sticky;
  bottom: 0;
  background: ${theme.white};
  z-index: 1;
`;

export const RequestModalNavigationSection = styled(Col)`
    
`;
