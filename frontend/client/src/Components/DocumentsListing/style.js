import styled, { css } from "styled-components";
import { theme } from "../../global-styles";
import { Row, Col } from "react-simple-flex-grid";

export const DocumentsListingMain = styled(Row)`
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: left;
`;
export const DocumentItem = styled(Col)`
  
`;
export const DocumentItemPadding = styled.div`
  padding: 5px 0;
`;
export const DocumentItemInner = styled.div`
  background: ${theme.white};
  box-shadow: 0 2px 4px ${theme.boxShadowLight};
  border-radius: 10px;
  padding: 10px 20px;
  min-height: 94px;
  display: flex;
`;
export const DocumentItemSections = styled(Row)`
  
`;
export const DocumentItemSection = styled(Col)`
  align-self: center;
`;
export const DocumentItemSectionIcon = styled.div`
  font-size: 30px;
  align-self: center;
  text-align: center;
  color: ${theme.buttonGreen};
`;
export const DocumentItemSectionActionIcon = styled(Col)`
  font-size: 12px;
  text-align: left;
  align-self: center;
  cursor: pointer;
  color: ${theme.buttonLightGreen};
`;
export const DocumentItemSectionItems = styled(Row)`

`;
export const DocumentItemSectionItem = styled(Col)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  align-self: center;
  font-size: 12px;
  font-weight: 300;
  padding: 2px 0;
  max-width: 90%;

  ${(props) => props.weight && css`
    font-weight: ${props.weight};
  `}
  ${(props) => props.size && css`
    font-size: ${props.size};
  `}
  ${(props) => props.transform && css`
    text-transform: ${props.transform};
  `}
`;