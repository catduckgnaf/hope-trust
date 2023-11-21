import styled, { css } from "styled-components";
import { theme } from "../../global-styles";
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

export const RelationshipTile = styled(Col)`

`;

export const RelationshipTilePadding = styled.div`
  padding: 20px;
`;

export const RelationshipTileInner = styled.div`
  color: ${theme.hopeTrustBlue};
  text-align: center;
  background: #FFFFFF;
  border-radius: 8px;
  box-shadow: 0 4px 8px ${theme.boxShadowLight};
  padding: 30px 20px;
  font-size: 18px;
  text-transform: capitalize;
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

  ${(props) => props.disabled && css`
    background: ${theme.disabled};
    color: ${theme.labelGrey};
    cursor: no-drop !important;
  `};
`;

export const RelationshipHeaderText = styled.div`
  max-width: 60%;
  color: #717171;
  margin: auto;
  padding: 20px;
  line-height: 25px;
`;

export const RelationshipInnerRow = styled(Row)`
  
`;

export const RelationshipInnerCol = styled(Col)`
  align-self: center;

  ${(props) => props.align && css`
    text-align: ${props.align};
  `};
`;

export const RelationshipInnerIcon = styled.div`
  padding: 0 20px 0 0;
  font-size: 1.5em;
`;

export const Text = styled.div`
  font-size: 20px;
  font-weight: 400;
  width: auto;
  display: inline;
  margin-left: 10px;
`;