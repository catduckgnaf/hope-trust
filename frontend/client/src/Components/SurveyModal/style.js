import styled, { css } from "styled-components";
import { theme } from "../../global-styles";
import { Row, Col } from "react-simple-flex-grid";
import media from "styled-media-query";
import processing from "../../assets/images/processing.gif";

export const ModalContainer = styled.div`
  margin-top: 50px;

  ${media.lessThan("769px")`
    margin-top: 95px;
  `};
`;

export const SurveyFrame = styled.iframe`
  max-width: 1200px;
  min-width: 650px;
  min-height: 75vh;
  width: 100%;
  background-image: url(${processing});
  background-repeat: no-repeat;
  background-position: center center;
  border-top: 1px solid ${theme.white};

  ${media.lessThan("769px")`
    min-width: 100%;
  `};
`;

export const SurveyModalInner = styled(Row)`
  padding: 0;
  position: relative;
  transition: 0.5s ease;
  height: 100%;
`;
export const SurveyModalInnerHeader = styled(Col)`
  text-align: center;
  padding: 15px;
  border-bottom: 1px solid ${theme.lineGrey}
  margin-bottom: 25px;
  font-size: 24px;
  font-weight: 400;
  color: ${theme.hopeTrustBlue};
  z-index: 1;
  text-transform: capitalize;
`;

export const SurveyModalInnerInfoSection = styled(Col)`
  align-self: center;

  ${(props) => props.float && css`
    text-align: ${props.float};
  `};
`;

export const SurveyModalInnerInfoSectionItem = styled(Col)`
  text-align: left;
  align-self: center;
  font-size: 12px;
  font-weight: 400;
  margin: 3px 0;
`;

export const SurveyModalInnerLogo = styled(Col)`
  text-align: center;
  margin-top: -50px;
`;

export const SurveyModalInnerLogoImg = styled.img`
  width: 100px;
  background: #FFF;
  border-radius: 50%;
`;

export const SurveyModalContent = styled(Col)`
  height: 100%;
`;

export const NextSurveyButtonText = styled.div`
  display: inline-block;
  vertical-align: bottom;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 10px;
`;

export const SurveyInfoHeader = styled.div`
  background: rgb(19, 107, 157);
  margin-top: 15px;
  padding: 10px 25px;
  text-align: left;
  border-radius: 10px 10px 0 0;

  ${media.lessThan("769px")`
    padding-bottom: 5px;
  `};
`;

export const SurveyInfoHeaderItem = styled.div`
  padding: 3px 20px;
  background: ${theme.white};
  color: ${theme.hopeTrustBlue};
  border-radius: 20px;
  margin-right: 5px;
  font-size: 14px;
  text-transform: capitalize;
  width: auto;
  display: inline-block;
  vertical-align: text-top;
  
  ${media.lessThan("769px")`
    margin-bottom: 5px;
    font-size: 11px;
  `};
`;

export const SurveyInfoHeaderAvatar = styled.div`
  border-radius: 50%;
  margin-right: 15px;
  width: auto;
  display: inline-block;
  vertical-align: middle;
  
  ${media.lessThan("769px")`
    margin-bottom: 5px;
  `};
`;