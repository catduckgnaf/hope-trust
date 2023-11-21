import styled from "styled-components";
import { theme } from "../../global-styles";
import media from "styled-media-query";

export const StepperContainer = styled.div`
  width: 100%;
`;

export const StepperNavigation = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-self: center;
`;

export const AuthenticationStepperHeader = styled.div`
  width: 100%;
  text-align: center;
`;

export const AuthenticationStepperHeaderMessage = styled.div`
  color: ${theme.activeTextGrey};
  font-size: 24px;
  font-weight: 400;
  padding: 30px 10px 10px;

  ${media.lessThan("769px")`
    font-size: 18px;
    line-height: 30px;
  `}
`;

export const AuthenticationStepperHeaderStepInfo = styled.div`
  color: ${theme.metadataGrey};
  font-size: 22px;
  font-weight: 400;
  padding-top: 10px;
`;
