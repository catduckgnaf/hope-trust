import styled, { css } from "styled-components";
import { theme } from "../../global-styles";
import { Row, Col } from "react-simple-flex-grid";
import media from "styled-media-query";
import { lighten } from "polished";

export const MessageListMain = styled(Row)`
  
`;
export const MessagesListPadding = styled(Col)`
  
`;
export const MessagesListInner = styled(Row)`
  
`;
export const MessagesListCardMain = styled(Col)`
  
`;
export const MessagesListCardPadding = styled.div`
  
`;
export const MessagesListCardInner = styled(Row)`
  background: ${theme.white};
  padding: 10px 0 10px 10px;
  margin: 5px 0;
  border-radius: 0 5px 5px 0;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  transition: 0.2s ease;
  cursor: pointer;

  &:hover {
    box-shadow: 0 1px 2px rgba(0,0,0,0.3);
  }
`;
export const MessagesListCardInnerSection = styled(Col)`
  align-self: center;
  font-size: 12px;
  font-weight: 300;
  padding: 0 10px;

  ${(props) => props.overflow && css`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `};

  ${(props) => props.icon && css`
    color: ${lighten(0.1, theme.hopeTrustBlue)};
    font-size: 16px;
    text-align: center;
  `};

  ${(props) => props.transform && css`
    text-transform: ${props.transform};
  `};

  ${(props) => props.text_align && css`
    text-align: ${props.text_align};
  `};

  ${(props) => props.paddingright && css`
    padding-right: ${props.paddingright}px;
  `};

  ${media.lessThan("500px")`
    font-size: 11px;
  `};
`;