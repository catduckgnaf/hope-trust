import styled, { css } from "styled-components";
import { theme } from "../../global-styles";
import { Row, Col } from "react-simple-flex-grid";
import media from "styled-media-query";

export const RelationshipTiles = styled.div`
  padding: 10px;
  max-width: 955px;

  ${media.lessThan("767px")`
    padding: 0;
    min-width: 100%;
  `};
`;

export const RelationshipTileRow = styled(Row)`

`;

export const RelationshipTile = styled(Col)`

`;

export const RelationshipTilePadding = styled.div`
  padding: 20px;
`;

export const RelationshipTileInner = styled(Row)`
  color: ${theme.hopeTrustBlue};
  text-align: center;
  background: #FFFFFF;
  border-radius: 8px;
  box-shadow: 0 4px 8px ${theme.boxShadowLight};
  padding: 30px 1rem;
  cursor: pointer;

  &:hover {
    background: rgba(0,0,0,0.04);
  }
  &:active {
    background: #FFFFFF;
  }
  ${(props) => props.active && css`
    background: ${theme.hopeTrustBlue};
    color: ${theme.white};

    &:hover {
      background: ${theme.hopeTrustBlueDarker}
    }
    &:active {
      background: ${theme.hopeTrustBlue}
    }
  `};

  ${media.lessThan("1400px")`
    padding: 30px 40px;
  `};
`;

export const RelationshipTileInnerSection = styled(Col)`
  padding: 5px 5px 0 5px;
  font-size: 12px;

  ${(props) => props.heading && css`
    font-size: 18px;
    text-transform: capitalize;
  `};
`;
