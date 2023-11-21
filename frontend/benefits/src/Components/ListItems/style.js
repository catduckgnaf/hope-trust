import styled, { css } from "styled-components";
import { theme } from "../../global-styles";
import { Col } from "react-simple-flex-grid";

export const ListItemMain = styled(Col)`
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
  position: relative;
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
  overflow: auto;
`;

export const ListItemSectionText = styled.div`
  
`;

export const ListItemSectionTextItem = styled.div`
  font-size: 13px;
  color: ${theme.metadataGrey};
  max-width: 90%;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  width: min-content;
  ${(props) => props.bold && css`
    font-weight: bold;
  `};

  ${(props) => props.clickable && css`
    font-weight: 500;
    color: ${theme.hopeTrustBlue};
    cursor: pointer;
    border-bottom: 1px dashed;

    &:hover {
      font-weight: 600;
    }
  `};
`;

export const LoadingContainer = styled.div`
  width: 100%;
  height: 100%;
  padding: 20px;
  text-align: center;
`;

export const ListItemMessage = styled.div`
  width: 100%;
`;
export const ListItemMessagePadding = styled.div`
  padding: 0 10px 10px 10px;
`;
export const ListItemMessageInner = styled.div`
  padding: 10px;
  position: relative;
  margin: auto;
  border-radius: 0 5px 5px 0;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
`;
export const ListItemMessageText = styled.div`
  text-align: center;
  color: ${theme.hopeTrustBlue};
  font-size: 16px;
`;