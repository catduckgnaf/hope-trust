import styled, { css } from "styled-components";
import { Row, Col } from "react-simple-flex-grid";
import { theme } from "../../global-styles";

export const InstalliOSWebAppOverlay = styled.div`
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: rgba(0,0,0,0.8);
  z-index: 999999999999999999999;
`;

export const InstalliOSWebAppArrow = styled.div`
  width: 0; 
  height: 0; 
  position: absolute;
  display: none;
`;

export const InstalliOSWebAppInnerModal = styled.div`
  position: fixed;
	background: #ffffff;
  z-index: 10000000000;
  max-width: 300px;
  height: max-content;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  margin: auto;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;

  ${(props) => props.iphone && css`

    left: 0;
    right: 0;
    top: auto;
    bottom: 20px;
    margin: auto;
    
    ${InstalliOSWebAppArrow} {
      bottom: -20px;
      margin: auto;
      left:0;
      right:0;
      display: block;
      border-left: 30px solid transparent;
      border-right: 30px solid transparent;
      border-top: 30px solid #FFFFFF;
    }
  `};

  ${(props) => props.ipad && css`

    right: 59px;
    top: 20px;
    left: auto;
    bottom: auto;
    
    ${InstalliOSWebAppArrow} {
      top: -20px;
      margin: auto;
      right: 50px;
      display: block;
      border-left: 30px solid transparent;
      border-right: 30px solid transparent;
      border-bottom: 30px solid #FFFFFF;
    }
  `};
`;

export const InstalliOSWebAppInner = styled(Row)`
  color: ${theme.hopeTrustBlue};
  font-size: 16px;
  font-weight: 400;
  padding: 20px;
  text-align: center;
`;

export const InstalliOSWebAppTitle = styled(Col)`
  color: ${theme.hopeTrustBlue};
  font-size: 16px;
  font-weight: 400;
  margin-bottom: 10px;
`;

export const InstalliOSWebAppBody = styled(Col)`
  color: ${theme.metadataGrey};
  font-size: 13px;
  font-weight: 300;
  margin-bottom: 10px;
`;

export const AddToHomeScreenButtonImage = styled.img`
  width: 240px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  margin: auto;
`;

export const InstalliOSWebAppButtons = styled(Col)`
  margin-top: 10px;
`;