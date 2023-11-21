import styled, { css } from "styled-components";
import { theme } from "../../global-styles";
import { Row, Col } from "react-simple-flex-grid";
import media from "styled-media-query";

export const PlanTiles = styled(Row)`
  padding: 0 10px 10px 10px;
`;

export const PlanTileSection = styled(Col)`
    padding: 10px;
    min-width: 550px;
  ${(props) => props.sticky && css`
    position: sticky !important;
    top: 20px !important;
  `};
  ${media.lessThan("767px")`
    margin-top: 10px;
    min-width: 100%;
  `};
`;

export const PlanInfoRow = styled(Row)`
  border-radius:5px;
  display: flex;
  flex-direction: column;
`;

export const PlanTileTitleItems = styled(Row)`
  padding: 0 10px;
  margin-bottom: 10px;
`;

export const PlanTileTitleItemMain = styled(Col)`
  color: ${theme.hopeTrustBlue};
  font-size: 25px;
  font-weight: 400;

  ${media.lessThan("900px")`
    font-size: 15px;
  `};
`;

export const PlanTileTitleItemSecondary = styled(Col)`
  color: ${theme.metadataGrey};
  font-size: 12px;
  padding-top: 10px;
  font-weight: 300;
  ${media.lessThan("900px")`
    font-size: 11px;
  `};
`;

export const PlanInfoBody = styled(Col)`
  width: 100%;
  text-align: left;
  justify-content: center;
  padding:  0 10px 10px 10px;
  position: relative;
`;

export const PlanInfoBodyList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

export const PlanInfoBodyListItemIcon = styled.div`
  vertical-align: middle;
  text-align: left;
  font-size: 20px;
  min-width: 40px;
  color: ${theme.buttonGreen};
  display: inline-block;
  align-self: center;

  ${(props) => props.blue && css`
    color: ${theme.hopeTrustBlue};
  `};
  
  ${(props) => props.disabled && css`
    color: ${theme.lineGrey};
  `};
  ${media.lessThan("900px")`
    font-size: 18px;
  `};
  ${media.lessThan("500px")`
    font-size: 15px;
  `};
`;

export const PlanInfoBodyListItem = styled.li`
  width: 100%;
`;

export const PlanInfoBodyListItemPadding = styled.div`
  padding: 5px 0;
`;

export const PlanInfoBodyListItemInner = styled.div`
  border-bottom: 1px solid ${theme.lineGrey};
  padding: 3px 5px 10px 5px;
  display: flex;
`;

export const PlanInfoFooter = styled(Col)`
  width: 100%;
  text-align: center;
  justify-content: center;
  padding-bottom: 10px;
`;

export const PlanFooterPricing = styled(Row)`
  width: 100%;
  text-align: center;
  justify-content: center;
  padding: 15px;
`;

export const PlanFooterPricingItem = styled(Col)`
  padding: 10px;
  font-weight: 400;
  color: ${theme.hopeTrustBlue};
  font-size: 18px;
  position: relative;
`;

export const PlanFooterPricingItemTitle = styled.div`
  font-weight: 300;
  padding: 5px 0;
  background: ${theme.hopeTrustBlue};
  color: ${theme.white};
  margin-bottom: 10px;
  font-size: 18px;
  border-radius: 3px;

  ${media.lessThan("900px")`
    font-size: 16px;
  `};
`;

export const PlanTileRow = styled(Row)`
  border-radius: 5px;
  box-shadow: 0 4px 8px ${theme.boxShadowLight};
`;

export const PlanTilePadding = styled.div`
  
`;

export const PlanTileInner = styled.div`
  color: ${theme.hopeTrustBlue};
  background: #FFFFFF;
  border-radius: 5px;
  padding: 30px 20px;
  font-size: 18px;
  text-align: left;
  text-transform: capitalize;
  cursor: pointer;

  &:hover {
    background: rgba(0,0,0,0.04);
  }
  &:active {
    background: #FFFFFF;
  }
  ${(props) => props.active && css`
    border: 2px solid ${theme.hopeTrustBlue};

    &:hover {
      border: 2px solid ${theme.hopeTrustBlueDarker};
    }
    &:active {
      border: 2px solid ${theme.hopeTrustBlue};
    }
  `};

  ${media.lessThan("900px")`
    padding: 30px 10px;
  `};
`;

export const PlanTile = styled(Col)`
  
`;


export const PlanTilePlanItems = styled(Row)`

`;

export const PlanTilePlanName = styled(Col)`
  text-align: left;
`;

export const PlanTilePlanIcon = styled(Col)`
  text-align: right;
  color: ${theme.hopeTrustBlue};
  ${media.lessThan("900px")`
    font-size: 12px;
  `};
`;

export const FeatureText = styled.div`
  display: inline-block;
  font-weight: 300;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 90%;
  align-self: center;
  white-space: pre-line;
  line-height: 20px;
  
  ${(props) => props.strike && css`
    text-decoration: line-through;
    color: ${theme.lineGrey};
    font-weight: 400;
  `};
  ${media.lessThan("900px")`
    font-size: 12px;
  `};
  ${media.lessThan("500px")`
    font-size: 11px;
  `};
`;