import styled from "styled-components";
import { theme } from "../../global-styles";
import { Row, Col } from "react-simple-flex-grid";

export const TwoFactorView = styled(Row)`
  text-align: left;
  padding: 0 10px 10px 10px;
  width: auto;
  min-width: 250px;
`;

export const TwoFactorMessage = styled(Col)`
  color: ${theme.metadataGrey};
  font-size: 16px;
  padding: 10px 1px 20px 10px;
`;

export const TwoFactorButton = styled(Col)`

`;
