import styled from "styled-components";
import { Row, Col } from "react-simple-flex-grid";
import media from "styled-media-query";

export const RelationshipTiles = styled.div`
  padding: 10px;

  ${media.lessThan("767px")`
    padding: 0;
    min-width: 100%;
  `};
`;

export const RelationshipTileRow = styled(Row)`

`;

export const RelationshipHeaderText = styled.div`
  max-width: 60%;
  color: #717171;
  margin: auto;
  padding: 20px;
  line-height: 25px;
`;


export const RelationshipSelectContainer = styled(Col)`

`;