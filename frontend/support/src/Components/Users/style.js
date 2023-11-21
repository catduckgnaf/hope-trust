import styled, { css } from "styled-components";
import { Row } from "react-simple-flex-grid";
import media from "styled-media-query";
import { theme } from "../../global-styles";

export const UsersTable = styled.div`
  width: 100%;
`;

export const UsersTablePadding = styled.div`
  padding: 20px 30px;
`;

export const UsersColumnHeaders = styled(Row)`
  border-bottom: 1px solid rgba(0,0,0,0.1);
  margin-bottom: 10px;
  padding-left: 10px;

  ${media.lessThan("990px")`
    display: none !important;
  `};
`;

export const UsersMain = styled.div`
  
`;

export const UsersPadding = styled.div`
  padding: 20px;
`;

export const UsersInner = styled.div`
  background: ${theme.white};
  border-radius: 0 0 8px 8px;
`;

export const OnlineNow = styled.div`
  display: inline-block;
  ${(props) => props.clickable && css`
    color: ${theme.hopeTrustBlue};
    border-bottom: 1px dashed;
    width: fit-content;
    cursor: pointer;
  `};
`;

export const OnlineIndicator = styled.div`
  display: inline-block;
  font-size: 9px;
  margin-left: 10px;
  color: ${theme.errorRed};

  ${(props) => props.online && css`
    color: ${theme.buttonGreen}
  `};
`;

export const PushButton = styled.div`
  display: block;
`;