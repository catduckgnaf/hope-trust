import styled from "styled-components";
import { theme } from "../../global-styles";
import { Row, Col } from "react-simple-flex-grid";
import media from "styled-media-query";

export const MetricsContainer = styled(Col)`
  margin-bottom: 20px;
  padding: 0 20px;
`;

export const MetricsContainerPadding = styled.div`

`;

export const MetricsContainerInner = styled(Row)`

`;

export const Metric = styled(Col)`
  margin-bottom: 10px;
`;

export const MetricPadding = styled.div`
  
`;

export const MetricInner = styled.div`
  box-shadow: 0 1px 6px ${theme.boxShadowLight};
  border-radius: 8px;
  background: ${theme.white};
  align-self: center;
  align-items: center;
`;

export const MetricBody = styled(Row)`
  
`;

export const MetricHeader = styled(Col)`
  text-align: center;
  background: ${theme.hopeTrustBlue};
  color: ${theme.white};
  border-radius: 6px 6px 0 0;
  padding: 10px;
  font-size: 14px;
  font-weight: 300;
`;

export const MetricIcon = styled(Col)`
  text-align: center;
  padding: 30px 0;
  font-size: 20px;
  font-weight: 300;
  color: ${theme.hopeTrustBlueDarker};
`;

export const MetricValue = styled(Col)`
  text-align: center;
  padding: 30px 0;
  font-size: 20px;
  font-weight: 300;
  color: ${theme.hopeTrustBlueDarker};

  ${media.lessThan("1400px")`
    font-size: 18px;
  `};
`;