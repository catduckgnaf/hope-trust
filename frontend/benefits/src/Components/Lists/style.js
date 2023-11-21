import styled, { css } from "styled-components";
import { theme } from "../../global-styles";
import { Row, Col } from "react-simple-flex-grid";
import {
  SelectWrapper,
  Select
} from "../../global-components";

export const ListContainer = styled(Col)`
  margin-bottom: 20px;
  padding: 0;
`;

export const ListContainerPadding = styled.div`

`;

export const ListContainerInner = styled(Row)`
  
`;

export const Lists = styled(Col)`
  margin-bottom: 10px;
  transition: 1s ease
`;

export const ListPadding = styled.div`
  
`;

export const ListInner = styled.div`
  box-shadow: 0 1px 6px ${theme.boxShadowLight};
  border-radius: 4px;
  background: ${theme.white};
  align-self: center;
  align-items: center;
  max-height: 400px;
  min-height: 400px;
  overflow: auto;
`;

export const ListBody = styled(Row)`
  position: relative;
`;

export const ListHeader = styled(Col)`
  text-align: center;
  background: ${theme.hopeTrustBlue};
  color: ${theme.white};
  border-radius: 4px 4px 0 0;
  padding: 10px;
  font-size: 14px;
  font-weight: 300;
  position: sticky !important;
  top: 0;
  z-index: 1;
`;

export const ListIcon = styled(Col)`
  text-align: center;
  padding: 30px 0;
  font-size: 20px;
  font-weight: 300;
  color: ${theme.hopeTrustBlueDarker};
`;

export const ListItem = styled(Col)`
  width: 100%;

  ${(props) => props.sticky && css`
    position: sticky !important;
    top: 45px;
    z-index: 1;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    margin-bottom: 10px;
  `};
`;

export const ListItemPadding = styled.div`
  padding: 0 10px;
`;

export const ListItemInner = styled.div`
  background: ${theme.white};
  padding: 10px 0 10px 10px;
  margin: 5px 0;
  border-radius: 0 5px 5px 0;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
`;

export const ListItemKey = styled.div`
  background: ${theme.white};
  padding: 10px 0 10px 10px;
`;

export const ListItemSections = styled.div`
  display: grid;
  grid-auto-columns: 1fr;
  grid-auto-flow: column;
`;

export const ListItemSection = styled.div`
  font-size: 13px;
  max-width: 90%;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  width: min-content;

  ${(props) => props.bold && css`
    font-weight: bold;
  `};
`;

export const HeaderInner = styled(Row)`
  align-items: center !important;
`;
export const HeaderSection = styled(Col)`
  font-weight: 300;
  vertical-align: middle;
`;

export const SearchContainer = styled(Col)`
  width: 100%;
`;

export const SearchSelectWrapper = styled(SelectWrapper)`
  margin-bottom: 0;
  padding: 5px 0;
  border-bottom: 1px solid ${theme.lineGrey};
`;
export const SearchSelect = styled(Select)`
  margin-top: 0;
  border: none;
  border-radius: 0;
  font-size: 12px;
  padding: 6px 20px;
  color: ${theme.metadataGrey};
`;

export const LoadingIcon = styled.div`
  display: inline-block;
  vertical-align: middle;
  margin-left: 5px;
`;