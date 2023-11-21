import styled from "styled-components";
import { theme } from "../../global-styles";
import media from "styled-media-query";
import { Button } from "../../global-components";

export const ConfirmSignupFormMain = styled.div`
  width: 60%;
  position: relative;
  margin: auto;
`;

export const ConfirmSignupFormFields = styled.div`
  padding: 20px 0 0 0;
`;

export const ConfirmSignupButton = styled(Button)`
  width: 100%;
  margin-bottom: 20px;
`;

export const ConfirmSignupHeader = styled.div`
  color: ${theme.hopeTrustBlue};
  font-size: 30px;
  font-weight: 300;
  margin-bottom: 20px;
  margin-top: 20px;
  font-weight: 200;

  ${media.between("small", "medium")`
    font-size: 28px;
    margin-bottom: 10px;
  `}
`;

export const ConfirmSignupHeaderMessage = styled.div`
  color: ${theme.metadataGrey};
  font-size: 18px;
  line-height: 30px;
  margin-bottom: 60px;
  font-weight: 300;

  ${media.between("small", "medium")`
    font-size: 12px;
    margin-bottom: 30px;
  `}
`;
