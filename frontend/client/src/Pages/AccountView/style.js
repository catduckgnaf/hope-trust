import styled, { css } from "styled-components";
import { Row, Col } from "react-simple-flex-grid";
import media from "styled-media-query";
import { theme } from "../../global-styles";

export const ViewContainer = styled.div`
  padding: 20px;
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
export const TabContent = styled.div`
  background: ${theme.white};
  border-radius: 10px;
  box-shadow: 0 4px 8px ${theme.boxShadowLight};
`;

export const ReferralCodeContainer = styled.div`
  background: ${theme.white};
  padding: 5px 6px 5px 15px;
  border-radius: 5px;
  box-shadow: 0 1px 1px ${theme.boxShadowLight};
  display: inline-block;
  vertical-align: middle;

  ${media.lessThan("550px")`
    padding: 5px 6px;
  `};
`;
export const ReferralCodeLabel = styled.div`
  display: inline-block;
  vertical-align: middle;
  font-weight: 500;
  color: ${theme.hopeTrustBlue};
  border-right: 1px solid ${theme.lineGrey};
  padding-right: 10px;
  font-size: 12px;

  ${media.lessThan("550px")`
    display: none;
  `};
`;
export const ReferralCodeText = styled.div`
  display: inline-block;
  vertical-align: middle;
  font-weight: 400;
  margin-right: 10px;
  padding-left: 8px;
  font-size: 12px;
  ${media.lessThan("550px")`
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    max-width: 63%;
    padding-left: 0;
  `};
`;