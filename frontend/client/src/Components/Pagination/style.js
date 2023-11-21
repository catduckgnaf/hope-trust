import styled, { css } from "styled-components";
import { Row, Col } from "react-simple-flex-grid";
import { theme } from "../../global-styles";
import media from "styled-media-query";

export const PaginationMain = styled.div`
  
`;

export const PaginationContainer = styled(Row)`
  padding: 20px 30px 0 30px;
  display: flex;

  ${(props) => props.padding && css`
    padding: ${props.padding};
  `};
`;

export const PaginationSection = styled(Col)`
  font-size: 16px;
  color: ${theme.metadataGrey};
  align-self: center;
  vertical-align: middle;
  ${(props) => props.align && css`
    text-align: ${props.align};
  `};
  ${media.lessThan("990px")`
    text-align: left;
    margin-bottom: 10px;
  `};
`;