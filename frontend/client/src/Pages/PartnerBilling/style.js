import styled, { css } from "styled-components";
import { Row, Col } from "react-simple-flex-grid";

export const BillingSections = styled(Row)`

`;

export const AddPaymentMethodContainer = styled(Col)`
  ${(props) => props.align === "left" && css`
    text-align: ${props.align};
    padding: 0 0 30px 20px;
  `};

  ${(props) => props.align === "right" && css`
    text-align: ${props.align};
    padding: 0 20px 30px 0;
  `};
`;