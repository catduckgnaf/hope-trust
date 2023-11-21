import styled, { css } from "styled-components";
import { theme } from "../../global-styles";
import media from "styled-media-query";
import { Button } from "../../global-components";
import { Row, Col } from "react-simple-flex-grid";

export const AccountEditModalMain = styled.div`
  
`;

export const FeatureItems = styled(Row)`
  
`;

export const FeatureItem = styled(Col)`
  
`;

export const FeatureFooter = styled(Row)`
  border-top: 1px solid ${theme.lineGrey};
  padding: 30px 15px 10px 15px;
  margin-top: 25px;
`;

export const FeatureFooterSection = styled(Col)`
  
`;

export const ItemsHeader = styled(Col)`
  text-align: left;
  font-size: 16px;
  color: ${theme.hopeTrustBlue};
  font-weight: 400;
  border-bottom: 1px solid ${theme.lineGrey};
  padding: 0 15px 15px 15px;
  margin-bottom: 25px;
`;

export const ViewUserModalInnerLogo = styled(Col)`
  text-align: center;
  margin-top: -50px;

  ${(props) => props.editing && css`
    margin-top: 20px;
  `};
`;

export const ViewUserModalInnerLogoOverlay = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  position: absolute;
  background: rgba(0,0,0,0.3);
  z-index: 1;
  top: 0;
  left: 0;
  opacity: 0;
  transition: 0.5s ease;
  cursor: pointer;
`;

export const ViewUserModalInnerLogoContainer = styled.div`
  width: 100px;
  border-radius: 50%;
  position: relative;
  margin: auto;
  margin-bottom: 20px;

  &:hover {
    ${ViewUserModalInnerLogoOverlay} {
      opacity: 1;
    }
  }
`;

export const ViewUserModalInnerLogoImg = styled.img`
  width: 100px;
  background: #FFF;
  border-radius: 50%;
  box-shadow: 0 4px 3px rgba(0,0,0,0.3);
`;

export const ViewUserModalInnerLogoOverlayIcon = styled.div`
  position: absolute;
  margin: auto;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 40px;
  text-align: center;
  font-size: 40px;
  color: ${theme.white};
  align-self: center;
`;

export const ButtonsContainer = styled(Row)`
  
`;

export const ButtonItem = styled(Col)`
  
`;

export const EditButton = styled(Button)`
  width: 100%;
`;

export const ButtonItemMessage = styled.div`
  width: 100%;
  font-size: 12px;
  color: ${theme.labelGrey};
  text-align: center;
  margin-top: 5px;
  color: ${theme.errorRed};
`;

export const SettingsTabs = styled(Row)`
  
`;
export const SettingsTabsPadding = styled(Col)`
  padding-bottom: 15px;
  ${media.lessThan("321px")`
    padding-bottom: 5px;
  `};
`;
export const SettingsTabsInner = styled(Row)`
  
`;
export const SettingsTabPadding = styled.div`
  padding-right: 5px;
`;
export const SettingsTab = styled(Col)`
  &:last-child {
    ${SettingsTabPadding} {
      padding-right: 0px;
    };
  }
`;
export const SettingsTabStatusBar = styled.div`
  height: 4px;
  background: ${theme.lightGrey};
  width: 100%;
  transition: all 0.4s linear;

  ${(props) => props.active && css`
    background: ${theme.buttonLightGreen};
  `};
`;
export const SettingsTabInner = styled.div`
  padding: 15px 20px 15px 20px;
  font-size: 16px;
  font-weight: 400;
  color: ${theme.labelGrey};
  background: ${theme.white};
  border-radius: 5px 5px 0 0;
  ${media.lessThan("900px")`
    font-size: 14px;
  `};
  ${media.lessThan("500px")`
    font-size: 11px;
    text-align: center;
    padding: 15px 10px 15px 10px;
  `};
  ${media.lessThan("400px")`
    font-size: 10px;
  `};
  ${media.lessThan("321px")`
    font-size: 9px;
    padding: 10px;
  `};
  &:hover {
    background: rgba(255,255,255,0.7);
    cursor: pointer;
  }
`;

export const SettingsTabIcon = styled.div`
  display: inline-block;
  font-size: 18px;
  vertical-align: text-bottom;
  margin-right: 10px;
  ${media.lessThan("900px")`
    font-size: 14px;
    margin-right: 5px;
    vertical-align: text-top;
  `};
  ${media.lessThan("500px")`
    font-size: 10px;
    margin-right: 3px;
    display: none;
  `};
  ${media.lessThan("400px")`
    font-size: 9px;
    margin-right: 2px;
  `};
  ${media.lessThan("321px")`
    font-size: 8px;
  `};
`;
export const TabContent = styled(Col)`
  background: ${theme.white};
  padding: 20px 0;
`;

export const Group = styled.div`
  display: inline-block;
  cursor: pointer;
`;

export const Icon = styled.div`
  display: inline-block;
  margin-left: 5px;
  cursor: pointer;
`;