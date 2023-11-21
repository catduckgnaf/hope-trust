import styled, { css } from "styled-components";
import { Row, Col } from "react-simple-flex-grid";
import { theme } from "../../global-styles";
import media from "styled-media-query";
import {
  InputWrapper,
  Input,
  SelectWrapper,
  Select,
  Button
} from "../../global-components";

export const DocumentCards = styled(Row)`
  padding: 0 10px;
`;

export const DocumentCard = styled(Col)`
  
`;

export const DocumentCardPadding = styled.div`
  padding: 10px;
`;

export const DocumentCardInner = styled.div`
  background: ${theme.white};
  box-shadow: 0 2px 4px ${theme.boxShadowLight};
  border-radius: 5px;
  padding: 10px;

  ${(props) => props.height && css`
    min-height: ${props.height}px;
  `}
`;

export const DocumentCardInnerItem = styled.div`
  padding: 5px 0;
  font-size: 12px;
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  ${(props) => props.scroll && css`
    overflow: auto;
    text-overflow: initial;
  `}
  ${(props) => props.fontsize && css`
    font-size: ${props.fontsize}px;
  `}
  ${(props) => props.transform && css`
    text-transform: ${props.transform};
  `}
  ${(props) => props.multiline && css`
    overflow: visible;
    white-space: pre-wrap;
    text-overflow: unset;
    line-height: 18px;
  `}
`;

export const DocumentCardInnerViewButton = styled(Button)`
  margin-top: 10px;
`;

export const DocumentCardInnerButtons = styled(Row)`
  
`;

export const DocumentCardInnerButtonContainer = styled(Col)`
  
`;

export const DocumentCardContent = styled(Row)`
  
`;

export const DocumentCardSection = styled(Col)`
  justify-content: center;
  align-self: center;
  
  ${(props) => props.minheight && css`
    min-height: ${props.minheight}px !important;
  `}
`;

export const DocumentCardIcon = styled.div`
  font-size: 40px;
  text-align: center;
  color: ${theme.buttonGreen};
`;

export const DocumentFeedOptionsRow = styled(Row)`
  position: sticky;
  top: 0;
  z-index: 1;
  margin: 0 20px;
`;

export const BackButtonRow = styled(Row)`
  margin: 0 20px;
`;

export const DocumentFeedOptionsContainer = styled(Col)`
  margin-bottom: 10px;
`;

export const DocumentFeedOptions = styled(Row)`
  padding: 20px 10px;
  justify-content: center;
  align-self: center;
  background:${theme.white};
  box-shadow: 0 2px 4px ${theme.boxShadowLight};
  border-radius: 6px;
  margin: 0;
`;
export const DocumentFeedOptionSection = styled(Col)`
  ${(props) => props.align && css`
    text-align: ${props.align};
  `};
`;

export const DocumentFeedSearchInputWrapper = styled(InputWrapper)`
  margin-bottom: 0;
  padding: 0 10px;
`;
export const DocumentFeedSearchInput = styled(Input)`
  color: ${theme.metadataGrey};
`;
export const DocumentFeedSearchSelectWrapper = styled(SelectWrapper)`
  margin-bottom: 0;
  padding: 10px 20px;
  ${media.lessThan("769px")`
     padding: 10px 10px;
  `}
`;
export const DocumentFeedSearchSelect = styled(Select)`
  margin-top: 0;
  border: none;
  border-bottom: 1px solid ${theme.lineGrey};
  border-radius: 0;
  padding: 0 3px;
  font-size: 12px;
  color: ${theme.metadataGrey};
`;

export const DocumentFeedSearchMessage = styled(Row)`
  text-align: center;
  margin-top: 20px;
`;
export const DocumentFeedSearchText = styled(Col)`
  font-size: 14px;
  font-weight: 300;
  color: ${theme.metadataGrey};
`;
export const DocumentFeedSearchAction = styled(Col)`
  padding: 20px 0;
`;

export const DocumentFeedSearchButtonWrapper = styled(Col)`
  text-align: center;
  margin-bottom: 0;
  padding: 5px 0px;
`;

export const CurrentVaultUsage = styled.div`
  display: inline-block;
  vertical-align: middle;
  font-weight: 500;

  ${(props) => props.usage < props.limit && css`
    color: ${theme.buttonGreen};
  `};
  ${(props) => (((props.usage * 100) / props.limit) > 50) && ((props.usage * 100) / props.limit) < 90 && css`
    color: ${theme.notificationOrange};
  `};
  ${(props) => (((props.usage * 100) / props.limit) > 90) && css`
    color: ${theme.errorRed};
  `};
`;

export const TotalVaultUsage = styled.div`
  color: ${theme.hopeTrustBlue};
  display: inline-block;
  vertical-align: middle;
  font-weight: 500;
`;