import styled from "styled-components";
import { theme } from "../../global-styles";
import { Row, Col } from "react-simple-flex-grid";
import media from "styled-media-query";

export const ClassMarkerInnerModal = styled(Row)`
  padding: 0;
  position: relative;
  transition: 0.5s ease;
`;

export const ClassMarkerMainModalTitle = styled(Col)`
  color: ${theme.hopeTrustBlue};
  font-size: 25px;
  text-align: center;
  margin-bottom: 20px;

  ${media.lessThan("500px")`
    margin-bottom: 10px;
    font-size: 15px;
  `};
`;

export const ClassMarkerMainButtonContainer = styled(Col)`
  text-align: right;
`;

export const IFrameContainer = styled(Col)`
  height: 450px;

  ${media.lessThan("845px")`
    height: auto;
  `};
`;