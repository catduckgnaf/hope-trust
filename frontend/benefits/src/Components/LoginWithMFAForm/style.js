import styled  from "styled-components";
import { theme } from "../../global-styles";
import media from "styled-media-query";
import { Button } from "../../global-components";

export const LoginWithMFAFormMain = styled.div`
  width: 90%;
  position: relative;
  margin: auto;
`;

export const LoginWithMFAFormFields = styled.div`
  padding: 20px 0 0 0;
`;

export const LoginWithMFAButton = styled(Button)`
  margin-bottom: 20px;
`;

export const LoginWithMFAHeader = styled.div`
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

export const LoginWithMFAHeaderMessage = styled.div`
  color: ${theme.metadataGrey};
  font-size: 18px;
  line-height: 30px;
  font-weight: 300;

  ${media.lessThan("768px")`
    font-size: 12px;
  `}
`;

export const LoginWithMFAHeaderSecondaryMessage = styled.div`
  color: ${theme.metadataGrey};
  font-size: 13px;
  font-weight: 300;

  ${media.lessThan("768px")`
    font-size: 10px;
  `}
`;