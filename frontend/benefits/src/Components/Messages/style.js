import styled, { css } from "styled-components";
import { Row, Col } from "react-simple-flex-grid";
import media from "styled-media-query";
import { theme } from "../../global-styles";
import {
  InputWrapper,
  Input
} from "../../global-components";

export const MessagesTable = styled.div`
  width: 100%;
`;

export const MessagesTablePadding = styled.div`
  padding: 20px;
`;

export const MessagesColumnHeaders = styled(Row)`
  border-bottom: 1px solid rgba(0,0,0,0.1);
  margin-bottom: 10px;
  padding-left: 10px;

  ${media.lessThan("990px")`
    display: none !important;
  `};
`;

export const MessagesMain = styled.div`
  
`;

export const MessagesPadding = styled.div`
  padding: 20px;
`;

export const MessagesInner = styled.div`
  background: ${theme.white};
  border-radius: 8px;
`;

export const MessagesColumnHeader = styled(Col)`
  font-weight: 500;
  padding: 5px 0;
  font-size: 12px;

  ${(props) => props.sortable && css`
    color: ${theme.hopeTrustBlue};

    &:hover {
      cursor: pointer;
      font-weight: 600;
    }
  `};
`;

export const MessagesColumnHeaderIcon = styled.span`
  margin-right: 5px;
`;

export const MessagesOptionsRow = styled(Row)`
  position: sticky;
  top: 0;
  z-index: 1;
  margin: 0 20px;
`;

export const MessagesOptionsContainer = styled(Col)`
  margin-bottom: 10px;
  margin-top: 20px;
`;

export const MessagesOptions = styled(Row)`
  padding: 20px 10px;
  justify-content: center;
  align-self: center;
  background:${theme.white};
  box-shadow: 0 2px 4px ${theme.boxShadowLight};
  border-radius: 6px;
  margin: 0;
`;
export const MessagesOptionSection = styled(Col)`
  ${(props) => props.align && css`
    text-align: ${props.align};
  `};
`;

export const MessagesSearchInputWrapper = styled(InputWrapper)`
  margin-bottom: 0;
  padding: 0 10px;
`;
export const MessagesSearchInput = styled(Input)`
  color: ${theme.metadataGrey};
`;

export const MessagesSearchButtonWrapper = styled(Col)`
  text-align: center;
  margin-bottom: 0;
  padding: 5px 0px;
`;

export const MessagesSearchMessage = styled(Row)`
  text-align: center;
  margin-top: 20px;
`;
export const MessagesSearchText = styled(Col)`
  font-size: 14px;
  font-weight: 300;
  color: ${theme.metadataGrey};
`;
export const MessagesSearchAction = styled(Col)`
  padding: 20px 0;
`;

export const EmailContainer = styled.div`
  background: ${theme.white};
  padding: 5px 6px 5px 15px;
  border-radius: 5px 20px 20px 5px;
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