import styled from "styled-components";
import { Row, Col } from "react-simple-flex-grid";
import { theme } from "../../global-styles";

export const NotActiveMain = styled.div`
  width: 100%;
  height: 100%;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
`;
export const NotActivePadding = styled.div`
  
`;
export const NotActiveInner = styled(Row)`
  max-width: 1000px;
  width: 100%;
  padding: 0 20px;
`;
export const NotActiveInnerSection = styled(Col)`
  margin: 15px 0;
`;
export const NotActiveInnerSectionHeader = styled.div`
  font-size: 25px;
  font-weight: 300;
`;

export const NotActiveHint = styled.div`
  font-size: 14px;
  color: ${theme.hopeTrustBlue};
  padding: 15px 0 25px 0;
  font-weight: 300;
  line-height: 21px;
`;