import styled, { css } from "styled-components";
import { theme } from "../../global-styles";
import { Row, Col } from "react-simple-flex-grid";

export const UserPlanMain = styled.div`
  
`;

export const UserPlanPadding = styled.div`
  
`;

export const UserPlanInner = styled(Row)`
  padding: 0;
  position: relative;
  transition: 0.5s ease;

  ${(props) => props.isloading && css`
    max-height: 300px;
    overflow: hidden;
  `};
`;

export const UserPlanInnerSection = styled(Col)`
  
`;

export const UserPlanButtonContainer = styled(Row)`
  border-top: 1px solid ${theme.lineGrey};
  padding: 20px 10px 0 10px;
  margin-top: 20px;
`;

export const UserPlanButton = styled(Col)`
  
`;

export const FeatureItemInputMain = styled.div`
  
`;

export const FeatureItemInputPadding = styled.div`
  
`;

export const FeatureItemInputInner = styled(Row)`
  
`;

export const FeatureItemInput = styled(Col)`
  
`;

export const FeatureItemRemove = styled(Col)`
    align-self: center;
    cursor: pointer;
    color: ${theme.errorRed};
`;