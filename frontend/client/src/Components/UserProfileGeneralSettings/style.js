import styled, { css } from "styled-components";
import { Row, Col } from "react-simple-flex-grid";

export const ViewUserModalInner = styled(Row)`
  padding: 0;
  position: relative;
  transition: 0.5s ease;

  ${(props) => props.isloading && css`
    max-height: 300px;
    overflow: hidden;
  `};
`;

export const UserMainContent = styled(Col)`
  height: 100%;
`;