import styled from "styled-components";
import { theme } from "../../global-styles";
import { Col } from "react-simple-flex-grid";

export const ConvertMessage = styled(Col)`
  color: ${theme.metadataGrey};
  font-size: 16px;
  padding: 10px 1px 10px 10px;
`;