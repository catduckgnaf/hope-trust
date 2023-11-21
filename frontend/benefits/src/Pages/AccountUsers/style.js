import styled, { css } from "styled-components";
import { Row, Col } from "react-simple-flex-grid";
import media from "styled-media-query";
import { theme } from "../../global-styles";
import {
  InputWrapper,
  Input
} from "../../global-components";

export const RelationshipsTable = styled.div`
  width: 100%;
`;

export const RelationshipsTablePadding = styled.div`
  padding: 20px;
`;

export const RelationshipsColumnHeaders = styled(Row)`
  border-bottom: 1px solid rgba(0,0,0,0.1);
  margin-bottom: 10px;
  padding-left: 10px;

  ${media.lessThan("990px")`
    display: none !important;
  `};
`;

export const RelationshipsColumnHeader = styled(Col)`
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

export const RelationshipsColumnHeaderIcon = styled.span`
  margin-right: 5px;
`;

export const RelationshipsOptionsRow = styled(Row)`
  position: sticky;
  top: 0;
  z-index: 1;
  margin: 0 20px;
`;

export const RelationshipsOptionsContainer = styled(Col)`
  margin-bottom: 10px;
`;

export const RelationshipsOptions = styled(Row)`
  padding: 20px 10px;
  justify-content: center;
  align-self: center;
  background:${theme.white};
  box-shadow: 0 2px 4px ${theme.boxShadowLight};
  border-radius: 6px;
  margin: 0;
`;
export const RelationshipsOptionSection = styled(Col)`
  ${(props) => props.align && css`
    text-align: ${props.align};
  `};
`;

export const RelationshipsSearchInputWrapper = styled(InputWrapper)`
  margin-bottom: 0;
  padding: 0 10px;
`;
export const RelationshipsSearchInput = styled(Input)`
  color: ${theme.metadataGrey};
`;

export const RelationshipsSearchButtonWrapper = styled(Col)`
  text-align: center;
  margin-bottom: 0;
  padding: 5px 0px;
`;

export const RelationshipsSearchMessage = styled(Row)`
  text-align: center;
  margin-top: 20px;
`;
export const RelationshipsSearchText = styled(Col)`
  font-size: 14px;
  font-weight: 300;
  color: ${theme.metadataGrey};
`;
export const RelationshipsSearchAction = styled(Col)`
  padding: 20px 0;
`;