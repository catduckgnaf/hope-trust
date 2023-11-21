import styled, { css } from "styled-components";
import { theme } from "../../global-styles";
import { Row, Col } from "react-simple-flex-grid";

export const MaintenanceModeMain= styled.div`
  
`;

export const MaintenanceModeMainPadding = styled.div`
  
`;

export const MaintenanceModeMainInner = styled(Row)`
  
`;

export const MaintenanceModeMainInnerSection = styled(Col)`
  ${(props) => props.align && css`
    text-align: ${props.align};
  `};
`;

export const MaintenanceModeHeader = styled.div`
  color: ${theme.hopeTrustBlue};
  padding: 10px 10px 30px 10px;
  text-align: center;
  font-size: 22px;
  font-weight: 400;
  border-bottom: 1px solid ${theme.lineGrey};
`;

export const MaintenanceModeMessage = styled.div`
  color: ${theme.hopeTrustBlue};
  padding: 20px 30px;
  text-align: center;
  font-weight: 500;
  font-size: 15px;
  line-height: 22px;
  white-space: pre-wrap;
`;

export const MaintenanceModeHeaderIcon = styled.div`
  font-size: 50px;
  margin: auto;
  margin-top: -70px;
  width: 100px;
  height: 100px;
  position: relative;
  border-radius: 50%;
  background: ${theme.white};
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  margin-bottom: 20px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  display: flex;
  text-align: center;
  color: ${theme.hopeTrustBlue};
`;