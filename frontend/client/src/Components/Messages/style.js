import styled from "styled-components";
import media from "styled-media-query";
import { theme } from "../../global-styles";

export const MessagesMain = styled.div`
  
`;

export const MessagesPadding = styled.div`
  padding: 20px;
`;

export const MessagesInner = styled.div`
  background: ${theme.white};
  border-radius: 8px;
`;

export const EmailContainer = styled.div`
  background: ${theme.white};
  padding: 5px 6px 5px 15px;
  border-radius: 5px;
  box-shadow: 0 1px 1px ${theme.boxShadowLight};
  display: inline-block;
  vertical-align: middle;
  margin-bottom: 10px;

  ${media.lessThan("550px")`
    padding: 5px 6px;
  `};
`;
export const EmailLabel = styled.div`
  display: inline-block;
  vertical-align: middle;
  font-weight: 500;
  color: ${theme.hopeTrustBlue};
  border-right: 1px solid ${theme.lineGrey};
  padding-right: 10px;
  font-size: 12px;

  ${media.lessThan("550px")`
    display: none;
  `};
`;
export const EmailText = styled.div`
  display: inline-block;
  vertical-align: middle;
  font-weight: 400;
  margin-right: 10px;
  padding-left: 8px;
  font-size: 12px;
  ${media.lessThan("550px")`
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    max-width: 63%;
    padding-left: 0;
  `};
`;

export const EmailAppendage = styled.div`
  font-weight: 500;
  color: ${theme.hopeTrustBlue};
  display: inline-block;

  &:hover {
    cursor: pointer;
    font-weight: 400;
  }
`;