import styled from "styled-components";
import { theme } from "../../global-styles";
import { Row, Col } from "react-simple-flex-grid";
import { HashLink as Link } from "react-router-hash-link";

export const GraphGroupGraphContainer = styled.div`
  max-width: 350px;
  position: relative;
  margin: auto;
  min-height: 175px;
  margin-bottom: 15px;
`;

export const GraphGroupGraphContainerTitle = styled(Link)`
  width: 35%;
  height: 40px;
  position: absolute;
  margin: auto;
  top: 49%;
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
  line-height: 15px;
`;

export const AddtionalGraphInformationIcon = styled.div`
  align-self: center;
  line-height: 20px;
  font-size: 18px;
  opacity: 0.5;
  transition: 0.2s ease;
  cursor: pointer;
`;
export const AddtionalGraphInformationTitle = styled(Link)`
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;