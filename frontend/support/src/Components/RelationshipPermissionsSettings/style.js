import styled from "styled-components";
import { Col, Row } from "react-simple-flex-grid";
import { theme } from "../../global-styles";
import media from "styled-media-query";

export const SliderContainer = styled(Col)`
  align-self: center;
`;

export const SwitchAndLabelRow = styled(Row)`
  margin-bottom: 20px;
  border-bottom: 1px solid ${theme.lineGrey};
  padding-bottom: 40px;

  ${media.lessThan("500px")`
    padding-bottom: 0;
  `}
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
export const RowContentHeader = styled(Col)`
  font-size: 18px;
  font-weight: 300;
  text-align: center;
  padding: 10px;
  border-top: 1px solid ${theme.lineGrey};
  border-bottom: 1px solid ${theme.lineGrey};
  padding-bottom: 10px;
  padding-top: 10px;
  margin-bottom: 20px;
`;