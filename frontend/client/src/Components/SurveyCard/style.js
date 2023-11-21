import styled, { css } from "styled-components";
import { theme } from "../../global-styles";
import { Row, Col } from "react-simple-flex-grid";

export const SurveyCardMain = styled(Col)`
  
`;

export const SurveyCardPadding = styled.div`
  padding: 10px;
`;

export const RefreshSurveyContainer = styled.div`
  position: absolute;
  top: -20px;
  right: 2px;
  background: #FFF;
  padding: 5px 3px;
  border-radius: 50%;
  box-shadow: 0 0 3px 1px rgba(0,0,0,0.1);
  height: 25px;
  width: 25px;
  font-size: 13px;
  text-align: center;
  opacity: 0;
  transition: 0.5s ease;

  &:hover {
    transform: rotate(180deg)
  }
`;

export const SurveyCardInner = styled.div`
  color: ${theme.buttonGreen};
  cursor: pointer;
  padding: 20px 15px;
  background: ${theme.white};
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border-radius: 4px;
  min-height: 100px;

  &:hover {
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);

    ${RefreshSurveyContainer} {
      opacity: 1;
      top: 2px;
    }
  }

  ${(props) => props.disabled && css`
    background: ${theme.disabled};
  `};
`;

export const SurveyCardInfo = styled(Row)`

`;

export const SurveyCardTitle = styled(Col)`
  color: ${theme.buttonGreen};
  font-size: 14px;
  margin-bottom: 5px;
  line-height: 20px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;

  ${(props) => props.disabled && css`
    color: ${theme.labelGrey};
  `};
`;

export const SurveyCardSubtitle = styled(Col)`
  color: ${theme.metadataGrey};
  font-size: 11px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;

  ${(props) => props.status === "Complete" && css`
    color: ${theme.buttonGreen};
  `};
`;

export const SurveyCardDate = styled(Col)`
  color: ${theme.buttonGreen};
  font-size: 11px;
  margin-top: 5px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

export const SurveyCardInnerMain = styled(Row)`

`;

export const SurveyCardIconContainer = styled(Col)`
  font-size: 30px;
  align-self: center;
`;

export const SurveyCardInfoContainer = styled(Col)`
  padding-left: 20px;
`;