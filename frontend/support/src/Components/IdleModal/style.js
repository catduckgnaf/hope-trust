import styled from "styled-components";
import { theme } from "../../global-styles";
import { Col } from "react-simple-flex-grid";

export const IdleMainModalTitle = styled(Col)`
  color: ${theme.hopeTrustBlue};
  font-size: 25px;
  text-align: center;
  margin-bottom: 20px;
`;

export const IdleMainButtonContainer = styled(Col)`
  text-align: right;
`;


export const IdleMainModalBody = styled.div`
  text-align: center;
  font-size: 20px;
  font-weight: 300;
  padding: 20px 30px;
`;