import styled from "styled-components";
import { theme } from "../../global-styles";
import media from "styled-media-query";
import { Button } from "../../global-components";

export const ForgotPasswordFormMain = styled.div`
  width: 70%;
  position: relative;
  margin: auto;
`;

export const ForgotPasswordButton = styled(Button)`
  margin-bottom: 15px;
`;

export const ForgotPasswordFormFields = styled.div`
  padding: 20px 0 0 0;
`;

export const ForgotPasswordHeader = styled.div`
  color: ${theme.hopeTrustBlue};
  font-size: 30px;
  font-weight: 300;
  margin-bottom: 20px;
  margin-top: 20px;
  font-weight: 200;

  ${media.lessThan("768px")`
    font-size: 25px;
    margin-bottom: 10px;
  `}
`;

export const ForgotPasswordHeaderMessage = styled.div`
  color: ${theme.metadataGrey};
  font-size: 18px;
  line-height: 30px;
  font-weight: 300;

  ${media.lessThan("768px")`
    font-size: 12px;
  `}
`;