import styled, { css } from "styled-components";
import { theme } from "../../global-styles";
import media from "styled-media-query";
import { Row, Col } from "react-simple-flex-grid";
import { Button } from "../../global-components";

export const ViewContainer = styled.div`
  padding: 20px;
`;

export const RowHeader = styled.div`
  color: ${theme.metadataGrey};
  background: ${theme.rowGrey};
  font-size: 11px;
  padding: 8px 20px;
  text-transform: uppercase;
  width: 100%;
  position: sticky;
  top: 0;
  z-index: 1;
`;

export const RowBody = styled(Row)`
  background: ${theme.white};

  ${(props) => props.paddingbottom && css`
    padding-bottom: ${props.paddingbottom}px;
  `}
`;

export const RowBodyPadding = styled(Row)`
  margin-bottom: 0;
  padding: 20px 10px 15px;
  flex: auto;
  position: relative;

  ${media.lessThan("990px")`
    ${(props) => props.padding_override_mobile && css`
      padding: ${props.padding_override_mobile}px ${props.padding_override_mobile}px 0 ${props.padding_override_mobile}px;
    `}
  `}

  ${(props) => props.paddingtop && css`
    padding-top: ${props.paddingtop}px;
  `}

  ${(props) => props.paddingbottom && css`
    padding-bottom: ${props.paddingbottom}px;
  `}

  ${(props) => props.nopadding && css`
    padding: 0;
  `}
`;

export const RowContentSection = styled(Col)`
`;

export const RowSectionLegend = styled(Col)`
  color: ${theme.metadataGrey};
  font-size: 13px;
  font-weight: 400;

  ${media.lessThan("500px")`
    margin-bottom: 10px;
  `}

  ${(props) => props.marginbottom && css`
    margin-bottom: ${props.marginbottom}px;
  `}

  ${(props) => props.margintop && css`
    margin-top: ${props.margintop}px;
  `}
`;

export const SwitchGroup = styled(Row)`
  margin-bottom: 20px;

  ${media.lessThan("500px")`
    margin-bottom: 40px;
  `}

  ${(props) => props.bordered && css`
    border-bottom: 1px solid rgba(0,0,0,0.1);
    padding-bottom: 35px;
    margin-bottom: 40px;
  `}
`;

export const SwitchLabel = styled(Col)`
  align-self: center;
`;

export const SwitchLabelText = styled.div`
  color: ${theme.activeTextGrey};
  font-size: 12px;
  font-weight: 300;
  align-self: center;
  line-height: 20px;
  white-space: pre-line;
  max-width: 75%;

  ${media.lessThan("500px")`
    max-width: 100%;
  `}
`;

export const LabelAppendage = styled.div`
  display: inline-block;
  margin-left: 5px;

  ${(props) => props.success && css`
    color: ${theme.buttonGreen};
  `}
  ${(props) => props.error && css`
    color: ${theme.errorRed};
  `}
`;

export const VerifyAttributeButton = styled(Button)`
  margin: 8px 0 0 0;
  font-size: 10px;
  padding: 3px 10px;
`;

export const SendVerificationButton = styled(Button)`
  margin: 5px 0 0 10px;
  font-size: 11px;
  padding: 6px 10px;
`;

export const SettingsButtonContainer = styled(Col)`
  margin: 0 0 10px 0;
  padding: 0 0 5px 10px;

  ${(props) => props.paddingleft && css`
    padding-left: ${props.paddingleft}px;
  `}
`;

export const SettingsHeader = styled(Row)`
  display: flex;
  align-items: center;
  flex-direction: row;
  transition: 0.5s ease;
  padding: 25px;
  width: 100%;

  ${media.lessThan("900px")`
    flex-direction: column;
    text-align: center;
  `}
`;

export const SettingsHeaderLabel = styled.label`
  color: ${theme.hopeTrustBlue};
  cursor: pointer;
  font-size: 14px;

`;

export const SettingsHeaderAvatar = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  box-shadow: 0 4px 8px ${theme.boxShadowLight};
  transition: 0.5s ease;
  object-fit: cover;

  ${media.greaterThan("768px")`
    width: 150px;
    height: 150px;
  `}
`;

export const SettingsHeaderInfo = styled(Col)`
  ${media.greaterThan("768px")`
    margin-top: 10px;
  `}
`;

export const SettingsHeaderName = styled.div`
  font-size: 36px;
  font-weight: 300;
  margin-top: 10px;
  color: #000;
  transition: 0.5s ease;

  ${media.lessThan("500px")`
    font-size: 22px;
  `}
`;

export const UploadAvatarInput = styled.input`
  opacity: 0;
  position: absolute;
  z-index: -1:
`;

export const CropContainer = styled.div`
  position: relative;
  width: 150px;
  height: 150px;
  box-shadow: 0 4px 8px ${theme.boxShadowLight};
  transition: 0.5s ease;
  overflow: hidden;
  margin: auto;

  ${media.between("small", "medium")`
    width: 200px;
    height: 200px;
  `}
`;

export const SliderContainer = styled(Col)`
  align-self: center;
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

export const AvatarContainer = styled(Col)`
  ${media.lessThan("900px")`
    position: relative;
    margin: auto;
    width: 150px;
    margin-bottom: 15px;
  `};
`;