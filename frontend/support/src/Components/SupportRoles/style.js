import styled, { css } from "styled-components";
import { Row, Col } from "react-simple-flex-grid";
import { theme } from "../../global-styles";
import { Button } from "../../global-components";

export const SupportRolesContainer = styled(Row)`
  
`;

export const SaveProfileButton = styled(Button)`
  
`;

export const OptionContainer = styled.div`
  
`;
export const OptionImageContainer = styled.div`
  display: inline-block;
  margin-right: 10px;
`;
export const OptionTextContainer = styled.div`
  display: inline-block;
`;
export const Icon = styled.span`
  margin-right: 5px;
  font-size: 11px;
  color: ${theme.hopeTrustBlue};
`;

export const RoleSection = styled(Col)`
  text-align: left;
  align-self: center;
  justify-content: center;
  ${(props) => props.align && css`
    text-align: ${props.align};
  `};
  img.avatar {
    border: 2px solid ${theme.hopeTrustBlue};
    padding: 1px;
  }
`;

export const RoleInner = styled(Row)`
  
`;

export const RoleInnerSection = styled(Col)`
  margin-bottom: 20px;
`;