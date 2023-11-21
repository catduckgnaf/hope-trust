import styled from "styled-components";
import { Row, Col } from "react-simple-flex-grid";
import { theme } from "../../global-styles";

export const SliderContainer = styled(Col)`
  align-self: center;
`;

export const SwitchAndLabelRow = styled(Row)`
  margin-bottom: 20px;
`;

export const RowSectionLegendIcon = styled.div`
  display: inline-block;
  color: ${theme.buttonLightGreen};
  margin-right: 10px;
  font-size: 16px;
  align-self: center;
  vertical-align: middle;
`;

export const RowSectionLegendText = styled.div`
  display: inline-block;
  align-self: center;
  vertical-align: middle;
`;