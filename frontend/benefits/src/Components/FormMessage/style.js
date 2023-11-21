import styled from "styled-components";
import { theme } from "../../global-styles";

export const FormMessageMain = styled.div`
  max-width: 500px;
`;
export const FormMessagePadding = styled.div`
  
`;
export const FormMessageInner = styled.div`
  display: flex;
  align-items: center;
`;
export const FormMessageIcon = styled.div`
  font-size: 35px;
  color: ${theme.hopeTrustBlue};
  margin-right: 20px;
`;
export const FormMessageText = styled.div`
  font-size: 15px;
  color: ${theme.metadataGrey};

  a {
    color: ${theme.hopeTrustBlueDarker};
  }
`;