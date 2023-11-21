import styled, { css } from "styled-components";
import { theme } from "../../global-styles";
import { Row, Col } from "react-simple-flex-grid";
import media from "styled-media-query";

export const ModalContainer = styled.div`
  margin-top: 50px;

  ${media.lessThan("769px")`
    margin-top: 95px;
  `};
`;

export const ViewCECourseModalInner = styled(Row)`
  padding: 0;
  position: relative;
  transition: 0.5s ease;

  ${(props) => props.isloading && css`
    max-height: 300px;
    overflow: hidden;
  `};
`;
export const ViewCECourseModalInnerHeader = styled(Col)`
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

export const ViewCECourseModalInnerLogo = styled(Col)`
  text-align: center;
  margin-top: -50px;
`;

export const ViewCECourseModalInnerLogoImg = styled.img`
  width: 100px;
  background: #FFF;
  border-radius: 50%;
`;

export const CECourseMainContent = styled(Col)`
  height: 100%;
`;

export const ConditionItem = styled.div`
  width: 100%;
  padding: 10px;
  text-align: left;
  font-size: 14px;
  color: ${theme.hopeTrustBlue};
  border-radius: 0;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  display: flex;
  justify-content: space-between
  margin-bottom: 5px;

  &:first-child {
    border-radius: 8px 8px 0 0;
  }
`;

export const RemoveIcon = styled.div`
  font-size: 15px;
  color: ${theme.errorRed};
`;