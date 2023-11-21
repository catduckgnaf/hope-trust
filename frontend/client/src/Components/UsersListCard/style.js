import styled, { css } from "styled-components";
import { theme } from "../../global-styles";
import { Row, Col } from "react-simple-flex-grid";
import media from "styled-media-query";

export const UsersListCardMain = styled(Col)`
  
`;
export const UsersListCardPadding = styled.div`
  padding-left: 10px;
`;
export const UsersListCardInner = styled(Row)`
  background: ${theme.white};
  padding: 10px 0 10px 20px;
  margin: 5px 0;
  border-radius: 0 5px 5px 0;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  border-left: 3px solid ${theme.lineGrey};
  transition: 0.2s ease;
  cursor: pointer;
  position: relative;

  ${(props) => props.emergency && css`
    border-left: 5px solid ${theme.errorRed};
  `};

  ${(props) => props.primary && css`
    border-left: 5px solid ${theme.buttonGreen};
  `};

  ${(props) => props.secondary && css`
    border-left: 5px solid ${theme.notificationOrange};
  `};
  

  &:hover {
    box-shadow: 0 1px 2px rgba(0,0,0,0.3);

    ${(props) => props.emergency && css`
      border-left: 10px solid ${theme.errorRed};
    `};

    ${(props) => props.primary && css`
      border-left: 10px solid ${theme.buttonGreen};
    `};

    ${(props) => props.secondary && css`
    border-left: 10px solid ${theme.notificationOrange};
  `};
    
  }
`;
export const UsersListCardInnerSection = styled(Col)`
  align-self: center;
  font-size: 12px;
  font-weight: 300;

  ${(props) => props.transform && css`
    text-transform: ${props.transform};
  `};

  ${(props) => props.text_align && css`
    text-align: ${props.text_align};
  `};

  ${media.lessThan("500px")`
    font-size: 11px;
  `};
`;

export const AvatarContainer = styled.div`
  width: auto;
  height: 32px;
  left: -17px;
  position: absolute;
  margin: auto;
  top: 0;
  bottom: 0;
`;

export const OnlineIndicator = styled.div`
  position: absolute;
  font-size: 8px;
  right: 0;
  color: ${theme.errorRed};

  ${(props) => props.online && css`
    color: ${theme.buttonGreen}
  `};

  ${(props) => props.idle && css`
    color: ${theme.notificationYellow}
  `};
`;