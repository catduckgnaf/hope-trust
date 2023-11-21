import styled, { css } from "styled-components";
import { theme } from "../../global-styles";
import { Row, Col } from "react-simple-flex-grid";
import media from "styled-media-query";
import processing from "../../assets/images/processing.gif";

export const ClassMarkerInnerModal = styled(Row)`
  padding: 0;
  position: relative;
  transition: 0.5s ease;

  ${(props) => props.isloading && css`
    overflow: hidden;
  `};
`;

export const ClassMarkerMainModalTitle = styled(Col)`
  color: ${theme.hopeTrustBlue};
  font-size: 25px;
  text-align: center;
  margin-bottom: 20px;
`;

export const ClassMarkerMainButtonContainer = styled(Col)`
  text-align: right;
`;

export const QuizFrame = styled.iframe`
  max-width: 1200px;
  min-width: 650px;
  min-height: 75vh;
  width: 100%;
  border: 0;
  margin-top: 15px;
  background-image: url(${processing});
  background-repeat: no-repeat;
  background-position: center center;

  ${media.lessThan("769px")`
    min-width: 100%;
  `};
`;