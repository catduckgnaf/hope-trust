import styled from "styled-components";
import { theme } from "../../global-styles";

export const Main = styled.div`
  max-width: 500px;
  width: 100%;
  text-align: center;
  position: relative;
  margin: auto;
`;

export const Notice = styled.div`
  color: ${theme.hopeTrustBlue};
  margin-top: 20px;
`;

export const Bold = styled.b`
  font-weight: 600;
`;