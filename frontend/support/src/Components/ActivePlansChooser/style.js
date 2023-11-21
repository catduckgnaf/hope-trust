import styled, { css } from "styled-components";
import { theme } from "../../global-styles";
import { Row, Col } from "react-simple-flex-grid";
import media from "styled-media-query";

export const ActivePlansMain = styled.div`
  min-width: 400px;
  ${(props) => props.width && css`
    max-width: ${props.width}px;
  `};
  ${media.lessThan("768px")`
      min-width: 100%;
  `}
  position: relative;
`;

export const ActivePlansPadding = styled.div`

`;

export const ActivePlansInner = styled.div`

`;

export const ActivePlans = styled(Row)`

`;

export const ActivePlan = styled(Col)`
  ${(props) => (props.plans > 2) && css`
    ${media.lessThan("1200px")`
      margin-bottom: 20px;
    `}
  `};

  ${(props) => (props.plans <= 2) && css`
    ${media.lessThan("992px")`
      margin-bottom: 20px;
    `}
  `};
  ${(props) => (props.page === "upgrade") && css`
    margin-bottom: 20px;
  `};
`;

export const ActivePlanPadding = styled.div`
  position: relative;
`;

export const ActivePlanHeader = styled.div`

`;

export const ActivePlanHeaderPadding = styled.div`
  
`;

export const ActivePlanHeaderInner = styled.div`
  background: #8595A2;
  padding: 20px;
  text-align: left;
  border-radius: 12px 12px 0 0;
  border-top: 1px solid #EBEDEE;
  border-left: 1px solid #EBEDEE;
  border-right: 1px solid #EBEDEE;

  ${(props) => (props.cost > 0) && css`
    background: #7BCACB;
  `};
`;

export const ActivePlanHeaderTitle = styled.div`
  color: ${theme.white};
  font-family: Merriweather;
  font-style: normal;
  font-weight: normal;
  font-size: 24px;
  line-height: 30px;
`;

export const ActivePlanHeaderSubTitle = styled.div`
  color: ${theme.white};
  font-family: Noto Sans;
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 19px;
`;

export const ActivePlanInner = styled.div`
  max-height: 400px;
  min-height: 400px;
  background: ${theme.white};
  border-left: 1px solid #EBEDEE;
  border-right: 1px solid #EBEDEE;
  box-sizing: border-box;
  padding: 30px;
  overflow: auto;

  ${media.lessThan("1200px")`
    max-width: 100%;
  `}

  ${(props) => props.expanded && css`
    max-height: 100%;
  `};
`;

export const ActivePlanInnerFade = styled.div`
  position: absolute;
  z-index: 1;
  bottom: 105px;
  left: 0;
  pointer-events: none;
  background-image: linear-gradient(to bottom, rgba(255,255,255, 0), rgba(255,255,255, 1) 90%);
  width: 100%;
  height: 10rem;
  border-left: 1px solid #EBEDEE;
  border-right: 1px solid #EBEDEE;
`;

export const ActivePlanExpand = styled.div`
  position: relative;
  z-index: 2;
  width: 100%;
  font-family: Noto Sans;
  font-style: normal;
  font-weight: bold;
  font-size: 14px;
  line-height: 20px;
  text-align: center;
  text-decoration-line: underline;
  color: #2E395A;
  background: ${theme.white};
  padding: 8px 0;
  cursor: pointer;
  border-left: 1px solid #EBEDEE;
  border-right: 1px solid #EBEDEE;
`;

export const ActivePlanFeature = styled.div`
  font-family: Noto Sans;
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 20px;
  color: #2E395A;
  text-align: left;
`;

export const ActivePlanFeaturePadding = styled.div`
  
`;

export const ActivePlanFeatureInner = styled(Row)`
  border-bottom: 1px solid ${theme.lineGrey};
  padding: 10px 0;
`;

export const ActivePlanFeatureIcon = styled(Col)`
  color: #8DD69A;
  align-self: center;
  font-size: 17px;

  ${(props) => props.disabled && css`
    color: rgba(0,0,0,0.2);
    font-size: 20px;
  `};
  ${(props) => props.blue && css`
    color: ${theme.hopeTrustBlue};
  `};
`;

export const ActivePlanFeatureText = styled(Col)`
  font-family: Noto Sans;
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 20px;

  ${(props) => props.disabled && css`
    color: rgba(0,0,0,0.2);
  `};
  ${(props) => props.blue && css`
    color: ${theme.hopeTrustBlue};
  `};
`;

export const ActivePlanFooter = styled.div`
  position: relative;
  z-index: 2;
`;

export const ActivePlanFooterPadding = styled.div`
  
`;

export const ActivePlanFooterInner = styled(Row)`
  background: ${theme.white};
  border-radius: 0 0 12px 12px;
  padding: 20px;
  border-bottom: 1px solid #EBEDEE;
  border-left: 1px solid #EBEDEE;
  border-right: 1px solid #EBEDEE;
`;

export const ActivePlanFooterTitle = styled(Col)`
  font-family: Merriweather;
  font-style: normal;
  font-weight: bold;
  font-size: 20px;
  line-height: 34px;
  text-align: left;
  ${media.greaterThan("1500px")`
    font-size: 15px;
  `};
`;

export const ActivePlanFooterTitleCost = styled(ActivePlanFooterTitle)`
  color: #8DD69A;
  display: inline-block;
`;


export const ActivePlanFooterAction = styled(Col)`
  text-align: right;
`;

export const ActivePlanFooterActionButton = styled.button`
  background: #136B9D;
  border-radius: 4px;
  font-family: Noto Sans;
  font-style: normal;
  font-weight: bold;
  font-size: 16px;
  line-height: 22px;
  text-align: center;
  color: ${theme.white}
  outline: 0;
  border: 0;
  padding: 8px 30px;
  cursor: pointer;
  ${media.greaterThan("1500px")`
    padding: 4px 15px;
    font-size: 13px;
  `};
`;