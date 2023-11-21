import styled, { css } from "styled-components";
import { Row, Col } from "react-simple-flex-grid";
import { Button } from "../../global-components";
import { theme } from "../../global-styles";
import media from "styled-media-query";

export const MYTOWrapper = styled.div`
  width: 100%;
`;

export const StepperContainer = styled.div`
  width: 100%;
`;

export const MYTOModal = styled(Row)`
  z-index: 1;
`;

export const MYTOModalPadding = styled(Col)`
  
`;

export const MYTOModalInner = styled(Row)`
  
`;

export const MYTOModalInnerSection = styled(Col)`
  
`;

export const MYTOModalBody = styled(Row)`
  justify-content: center;
`;

export const MYTOModalBodyInner = styled(Col)`
  padding: 10px 10px 0 10px;
`;

export const MYTOModalButton = styled(Button)`
    
`;

export const StepperHeader = styled.div`
  width: 100%;
  text-align: center;
`;

export const StepperHeaderMessage = styled.div`
  color: ${theme.activeTextGrey};
  position: relative;
  font-weight: 200;
  line-height: 2;
  font-size: 2em;
  margin-top: 10px;
`;

export const StepperHeaderStepInfo = styled.div`
  color: ${theme.metadataGrey};
  margin: 0 auto;
  max-width: 100%;
  font-weight: 400;
  line-height: 1.7;
  margin-top: 10px;
`;

export const MYTONavigation = styled(Row)`
  text-align: center;
  padding: 10px 0;
  z-index: 1;
  background: ${theme.backgroundGrey};
`;

export const MYTOModalNavigationSection = styled(Col)`
    
`;

export const MYTOStepBody = styled(Row)`

`;

export const MYTOStepBodyPadding = styled(Col)`
  background: ${theme.white};
  padding: 30px 0 30px 0;
  border-radius: 6px;
  margin-top: 10px;
`;

export const MYTOStepBodyInner = styled.div`
  max-width: 65%;
  width: 100%;
  position: relative;
  margin: auto;

  ${media.lessThan("small")`
    max-width: 90%;
  `}
`;

export const RadioLabel = styled.div`
  margin-left: 10px;
  margin-right: 20px;
  display: inline-block;
  font-size: 12px;
`;

export const BenefitSection = styled(Col)`
  display: flex;
  align-self: center;
`;

export const DependentCount = styled.span`
  margin-left: 10px;
  display: inline-block;
  font-size: 12px;
`;

export const BenefitAppendage = styled.span`
  margin-left: 10px;
  display: inline-block;
  font-size: 12px;
  letter-spacing: 0.4px;
  vertical-align: middle;
`;

export const ExpensePrependage = styled(Col)`
  align-self: center;
`;

export const ExpensePrependagePadding = styled.div`
  align-self: center;
`;
export const ExpensePrependageInner = styled(Row)`
  text-align: center;
`;

export const TotalCategoryPercentage = styled(Col)`
  background: ${theme.lineGrey};
  padding: 14px 6px;
  border-radius: 50%;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  color: #FFF;
  font-size: 14px;
  height: 45px;
  width: 45px;

  ${(props) => props.category === "housing" && css`
    background: rgb(67, 206, 140);
  `}

  ${(props) => props.category === "health care" && css`
    background: rgb(78, 208, 225);
  `}

  ${(props) => props.category === "transportation" && css`
    background: rgb(111, 184, 252);
  `}

  ${(props) => props.category === "personal" && css`
    background: rgb(130, 132, 229);
  `}

  ${(props) => props.category === "children" && css`
    background: rgb(236, 64, 122);
  `}

  ${(props) => props.category === "recreation" && css`
    background: rgb(255, 110, 64);
  `}
`;

export const ExpenseAccordians = styled(Row)`
  
`;

export const ExpenseAccordian = styled(Col)`
  
`;

export const AccordianHeader = styled(Row)`
  vertical-align: middle;
  font-size: 18px;
  text-align: left;
  width: 100%;
  padding: 25px 20px;
  background: rgba(0, 0, 0, 0.03);
  color: ${theme.labelGrey};
  cursor: pointer;

  ${(props) => props.border && css`
    border-${props.border}: 1px solid rgba(0, 0, 0, 0.2);
  `}
`;

export const AccordianIcon = styled(Col)`
  text-align: left;
  color: ${theme.buttonGreen};
`;

export const AccordianTitle = styled(Col)`
  text-align: left;
  font-size: 16px;
  font-weight: 400;
`;

export const AccordianAction = styled(Col)`
  text-align: right;
`;

export const MytoCategoryMeta = styled(Row)`
  
`;

export const MytoCategoryTotal = styled(Col)`
  font-size: 14px;
  font-weight: 300;
`;

export const MytoCategoryIcon = styled(Col)`
  color: ${theme.buttonGreen};
`;

export const ExpenseWrapper = styled.div`
   padding: 20px 0 0px 55px
`;

export const Hint = styled.div`
  font-size: 12px;
  color: rgba(0,0,0,0.3);
  width: 100%;
  text-align: left;
  margin-top: 10px;

  ${(props) => props.top && css`
     margin-top: ${props.top}px;
  `}
`;

export const EditLink = styled.div`
  display: inline-block;
  float: right;
`;