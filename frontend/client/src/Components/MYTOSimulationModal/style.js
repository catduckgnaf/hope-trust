import styled from "styled-components";
import { theme } from "../../global-styles";
import { Row, Col } from "react-simple-flex-grid";
import { Button } from "../../global-components";

export const MYTOSimulationModalTitle = styled(Col)`
  color: ${theme.hopeTrustBlue};
  font-size: 25px;
  text-align: center;
  margin-bottom: 20px;
`;

export const MYTOSimulation = styled(Col)`
  padding: 30px 0;
`;

export const MYTOSimulationButtonContainer = styled(Col)`
  text-align: right;
`;

export const ChartContainer = styled.div`
  min-height: 220px;
  padding: 0 0 25px 0;
  margin: 5px 0;
  position: relative;
`;

export const GraphGroupGraphContainerTitle = styled.div`
  width: 35%;
  height: 40px;
  position: absolute;
  margin: auto;
  top: 42%;
  right: 0;
  left: 3px;
  margin-top: -19px;
  line-height: 28px;
  text-align: center;
  z-index: 0;
  font-weight: 300;
  font-size: 1.3em;
  text-decoration: none;
  color: ${theme.hopeTrustBlue};
`;

export const GraphGroupGraphContainerSubtitle = styled.div`
  color: ${theme.metadataGrey};
  font-size: 13px;
  line-height: 25px;
`;

export const ChartDataOutput = styled(Row)`
  padding: 20px 0;
  width: 100%;
`;
export const ChartDataOutputSection = styled(Col)`
  text-align: center;
`;
export const ChartDataOutputSectionPadding = styled.div`
  padding: 10px;
`;
export const ChartDataOutputSectionInner = styled.div`
  background: ${theme.white};
  padding: 15px 0 15px 10px;
  margin: 5px 0;
  border-radius: 0 5px 5px 0;
  box-shadow: ${theme.boxShadowDefault};
  transition: 0.2s ease;

  &:hover {
    box-shadow: 0 1px 2px rgba(0,0,0,0.3);
  }
`;
export const ChartDataOutputSectionTitle = styled.div`
  width: 100%;
  color: ${theme.hopeTrustBlue};
  font-weight: 400;
  font-size: 1.1em;
`;
export const ChartDataOutputSectionHeader = styled.div`
  width: 100%;
  color: ${theme.buttonGreen};
  font-weight: 500;
  font-size: 1.5em;
`;

export const ChartDataOutputSectionValue = styled.div`
  width: 100%;
  color: ${theme.hopeTrustBlue};
  font-weight: 300;
  font-size: 1em;
  padding: 10px 0;
`;
export const Sign = styled.div`
  font-size: 25px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.4)
`;

export const AddtionalGraphInformationIcon = styled.div`
  align-self: center;
  line-height: 20px;
  font-size: 18px;
  opacity: 0.5;
  transition: 0.2s ease;
  cursor: pointer;
`;
export const AddtionalGraphInformationTitle = styled.div`
  color: ${theme.metadataGrey};
  font-size: 12px;
  align-self: center;
  line-height: 18px;
  margin-left: 10px;
  opacity: 0.5;
  transition: 0.2s ease;
  cursor: pointer;
  text-decoration: none;
`;

export const AddtionalGraphInformation = styled.div`
  width: 100%;
  margin-top: 3px;

  &:hover ${AddtionalGraphInformationIcon} {
    opacity: 1;
    color: ${theme.buttonLightGreen};
  }
  &:hover ${AddtionalGraphInformationTitle} {
    opacity: 1;
  }
`;
export const AddtionalGraphInformationPadding = styled.div`

`;
export const AddtionalGraphInformationInner = styled(Row)`
  padding: 2px;
  align-self: center;
`;
export const AddtionalGraphInformationSection = styled(Col)`
  align-self: center;
`;
export const MYTOHint = styled(Col)`
  margin-bottom: 25px;
`;
export const MYTOHintPadding = styled.div`
  padding: 0 15px;
`;
export const MYTOHintInner = styled.div`
  font-size: 12px;
  text-align: center;
  color: ${theme.metaDataGrey};
  font-weight: 400;
  padding: 15px;
  color: #856404;
  background-color: #fff3cd;
  border-color: #ffeeba;
  border-radius: 6px;
`;

export const GraphGroupGraphContainerTitleNoLink = styled.div`
  width: 35%;
  height: 40px;
  position: absolute;
  margin: auto;
  top: 42%;
  right: 0;
  left: 3px;
  margin-top: -19px;
  line-height: 28px;
  text-align: center;
  z-index: 0;
  font-weight: 300;
  font-size: 1.3em;
  text-decoration: none;
  color: ${theme.hopeTrustBlue};
`;
export const ResetGraph = styled(Button)`
  position: absolute;
  right: 25px;
  top: 25px;
  z-index: 2;
`;