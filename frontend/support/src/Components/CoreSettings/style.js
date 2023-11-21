import styled, { css } from "styled-components";
import { Row, Col } from "react-simple-flex-grid";
import { theme } from "../../global-styles";
import media from "styled-media-query";
import { Button } from "../../global-components";

export const SaveProfileButton = styled(Button)`
  
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
  justify-content: space-evenly !important;
  flex-wrap: wrap;
  flex-direction: row;
`;
export const SettingsTabPadding = styled.div`
  padding-right: 5px;
`;
export const SettingsTab = styled(Col)`
  flex: auto;
  flex-grow: 1;
  width: 25%;
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
  padding: 15px 20px 15px 10px;
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
    padding: 10px;
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
  
`;

export const SectionHeader = styled.div`
  color: ${theme.labelGrey};
  padding: 0 5px;
  margin-bottom: 10px;

  ${(props) => props.margintop && css`
    margin-top: ${props.margintop}px;
  `};
`;

export const SuggestionsContainer = styled.div`
  position: relative;
  margin: 0 5px;

  .react-autosuggest__suggestions-list {
    position: absolute;
    top: 2px;
    background: #FFF;
    width: 100%;
    z-index: 1;
    list-style: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
    margin: 0px;
    padding: 0px;
    border-radius: 0 0 4px 4px;
  }
`;

export const SuggestionMain = styled.div`
  
`;
export const SuggestionPadding = styled.div`
  
`;
export const SuggestionInner = styled.div`
  padding: 5px;
  text-align: left;
  cursor: pointer;
  
  ${(props) => props.isHighlighted && css`
    background: rgba(0,0,0,0.05);
  `};
  strong {
    font-weight: bold;
  }
`;