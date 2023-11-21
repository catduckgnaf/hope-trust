import styled from "styled-components";
import { theme } from "../../../../global-styles";
import { Row, Col } from "react-simple-flex-grid";

export const OrderItemInputMain = styled.div`
  
`;

export const OrderItemInputPadding = styled.div`
  
`;

export const OrderItemInputInner = styled(Row)`
  
`;

export const OrderItemInput = styled(Col)`
  
`;

export const OrderItemRemove = styled(Col)`
    align-self: center;
    cursor: pointer;
    color: ${theme.errorRed};
`;