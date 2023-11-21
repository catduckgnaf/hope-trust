import styled from "styled-components";
import { Button } from "../../global-components";
import { theme } from "../../global-styles";

export const SaveProfileButton = styled(Button)`
  
`;

export const TwoFactorSection = styled.div`
  padding: 10px 0;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const TwoFactorText = styled.div`
  font-size: 12px;
  color: ${theme.fontGrey};
  line-height: 16px;
  align-self: center;
  display: flex;
`;

export const TwoFactorSwitch = styled.div`
  align-self: center;
  display: flex;
  padding: 10px 0;
`;