import styled, { css } from "styled-components";
import { Row, Col } from "react-simple-flex-grid";
import { theme } from "../../global-styles";
import { lighten, darken } from "polished";
import media from "styled-media-query";
import {
  InputWrapper,
  Input,
  SelectWrapper,
  Select
} from "../../global-components";

export const ActivityFeedRequests = styled.div`

`;

export const ActivityFeedContainer = styled.div`
  ${(props) => props.padding && css`
    padding: ${props.padding}px;
  `};
`;

export const ActivityFeedCards = styled(Row)`

`;

export const ActivityFeedTabs = styled(Row)`
  margin-bottom: 5px;
  padding: 10px 5px 5px 5px;
  position: sticky;
  top: 0;
  z-index: 1;
  background: ${theme.backgroundGrey};

  ${media.lessThan("769px")`
    position: relative;
  `}
`;

export const ActivityFeedTab = styled(Col)`
  text-align: center;
  align-self: flex-end;
`;

export const FeedTabRequestButtonIcon = styled.div`
  display: inline-block;
  font-size: 15px;
  vertical-align: middle;
  margin: 0 15px 0 0;
  color: ${theme.hopeTrustBlue};

  ${media.lessThan("769px")`
    width: 100%;
    text-align: center;
    margin: 0;
  `}
`;

export const FeedTabRequestButtonInner = styled(Col)`
  padding: 2px;
`;

export const FeedTabRequestButton = styled.button`
  outline: 0;
  border: none;
  padding: 10px 3px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 300;
  color: ${lighten(0.1, theme.metadataGrey)};

  background: ${theme.white};
  width: 100%;
  box-shadow: 0 1px 1px ${theme.boxShadowLight};
  border-radius: 3px;
  transition: 0.2s ease;

  &:hover {
    box-shadow: 0 2px 2px ${theme.boxShadowLight};
    color: ${darken(0.1, theme.metadataGrey)};
  }
`;

export const ActivityFeedInner = styled(Row)`
  padding: 20px 10px;
  justify-content: center;
  align-self: center;
  background: ${theme.white};
  box-shadow: 0 2px 4px ${theme.boxShadowLight};
  border-radius: 6px 6px 0 0;
  color: ${theme.metadataGrey};
  border-bottom: 3px solid ${lighten(0.1, theme.metadataGrey)};

  &:hover {
    color: rgba(0,0,0,0.9);
    background: rgba(255, 255, 255, 0.7);
    cursor: pointer;
  }
  ${(props) => props.active === "true" && css`
    color: rgba(0,0,0,0.9);
    background: rgba(255, 255, 255, 0.7);
  `};

  ${(props) => props.type === "money" && css`
    border-bottom: 3px solid ${lighten(0.2, theme.moneyRequestColor)};
  `};
  ${(props) => props.type === "medical" && css`
    border-bottom: 3px solid ${lighten(0.1, theme.medicalRequestColor)};
  `};
  ${(props) => props.type === "food" && css`
    border-bottom: 3px solid ${lighten(0.05, theme.foodRequestColor)};
  `};
  ${(props) => props.type === "transportation" && css`
    border-bottom: 3px solid ${lighten(0.1, theme.transportationRequestColor)};
  `};
  ${(props) => props.type === "other_request_type" && css`
    border-bottom: 3px solid ${lighten(0.1, theme.otherRequestColor)};
  `};
  ${(props) => props.type === "permission" && css`
    border-bottom: 3px solid ${lighten(0.1, theme.black)};
  `};
`;

export const ActivityFeedIcon = styled(Col)`
  font-size: 19px;
  align-self: center;

  ${(props) => props.type === "money" && css`
    color: ${theme.moneyRequestColor};
  `};
  ${(props) => props.type === "medical" && css`
    color: ${theme.medicalRequestColor};
  `};
  ${(props) => props.type === "food" && css`
    color: ${theme.foodRequestColor};
  `};
  ${(props) => props.type === "transportation" && css`
    color: ${theme.transportationRequestColor};
  `};
  ${(props) => props.type === "other_request_type" && css`
    color: ${theme.otherRequestColor};
  `};
`;

export const ActivityFeedTitle = styled(Col)`
  align-self: center;
  font-size: 12px;
  font-weight: 400;
  vertical-align: middle;
  text-align: left;
`;

export const ActivityFeedOptions = styled(Row)`
  padding: 10px;
  justify-content: center;
  align-self: center;
  background:${theme.white};
  box-shadow: 0 2px 4px ${theme.boxShadowLight};
  border-radius: 6px;
  margin: 0;
`;
export const ActivityFeedOptionSection = styled(Col)`
  ${(props) => props.align && css`
    text-align: ${props.align};
  `};
`;

export const ActivityFeedSearchMain = styled(Col)`
  margin-bottom: 15px;
`;

export const ActivityFeedSearchInputWrapper = styled(InputWrapper)`
  margin-bottom: 0;
  padding: 0 10px;
`;
export const ActivityFeedSearchInput = styled(Input)`
  color: ${theme.metadataGrey};
`;
export const ActivityFeedSearchSelectWrapper = styled(SelectWrapper)`
  margin-bottom: 0;
  padding: 10px 20px;
`;
export const ActivityFeedSearchSelect = styled(Select)`
  margin-top: 0;
  border: none;
  border-bottom: 1px solid ${theme.lineGrey};
  border-radius: 0;
  padding: 0 3px;
  font-size: 12px;
  color: ${theme.metadataGrey};
`;

export const ActivityFeedSearchMessage = styled(Row)`
  text-align: center;
  margin-top: 20px;
`;
export const ActivityFeedSearchText = styled(Col)`
  font-size: 14px;
  font-weight: 300;
  color: ${theme.metadataGrey};
`;
export const ActivityFeedSearchAction = styled(Col)`
  padding: 20px 0;
`;

export const ActivityFeedSearchButtonWrapper = styled(Col)`
  text-align: center;
  margin-bottom: 0;
  padding: 5px 0px;
`;

export const ActivityFeedRequestButtons = styled(Row)`
  padding: 0 5px 0 5px;
  position: sticky;
  top: 0;
  z-index: 1;
  background: ${theme.backgroundGrey};

  ${media.lessThan("769px")`
    position: relative;
  `}
`;