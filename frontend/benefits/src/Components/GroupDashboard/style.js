import styled from "styled-components";
import { Row } from "react-simple-flex-grid";
import { theme } from "../../global-styles";

export const Main = styled.div`
  width: 100%;
  height: 100%;
`;

export const Content = styled.div`
  flex: 1 1 auto;
`;

export const Header = styled.header`
  background-color: transparent;
  flex: 0 0 auto;
  padding: 0;
  z-index: 99;
`;

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const Footer = styled.footer`
  background-color: transparent;
  flex: 0 0 auto;
  padding: 0;
`;

export const MetricsContainer = styled(Row)`
  
`;

export const MetricsLoader = styled.div`
  width: 100%;
  margin-bottom: 20px;
`;

export const MetricsLoaderPadding = styled.div`
  
`;

export const MetricsLoaderInner = styled.div`
  padding: 30px;
  background: ${theme.white};
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  border-radius: 5px;
  text-align: center;
  font-size: 30px;
`;