import styled from "styled-components";
import { Row, Col } from "react-simple-flex-grid";

export const NotFoundMain = styled.div`
  width: 100%;
  height: 100%;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
`;
export const NotFoundPadding = styled.div`
  
`;
export const NotFoundInner = styled(Row)`
  max-width: 1000px;
  width: 100%;
  padding: 0 20px;
`;
export const NotFoundInnerSection = styled(Col)`
  margin: 15px 0;
`;
export const NotFoundInnerSectionHeader = styled.div`
  font-size: 25px;
  font-weight: 300;
`;