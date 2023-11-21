import styled, { css } from "styled-components";
import { Row, Col } from "react-simple-flex-grid";
import { lighten } from "polished";
import { theme } from "../../global-styles";

export const PushNotifications = styled.div`
  position: fixed;
  margin: auto;
  z-index: 2147483647 !important;
  max-width: 350px;
  width: 100%;
  height: auto;
  overflow: auto;

  ${(props) => props.location === "top_left" && css`
    left: 0;
  `};
  ${(props) => props.location === "top_right" && css`
    right: 0;
  `};
  ${(props) => props.location === "bottom_left" && css`
    left: 0;
    bottom: 0;
  `};
  ${(props) => props.location === "bottom_right" && css`
    right: 0;
    bottom: 0;
  `};
`;

export const PushNotificationsList = styled.ul`
  padding:0;
  margin:0;
  overflow: auto;
  padding-bottom: 20px;
`;

export const PushMain = styled.div`
  transition: 0.5s ease;
  list-style; none;
  position: relative;
  margin: auto;
  max-width: 350px;
  width: 100%;
`;
export const PushPadding = styled.div`
  padding: 10px 10px 0 10px;
`;
export const PushActions = styled(Row)`
  text-align: right;
  padding: 10px;
  border-top: 1px solid;
`;
export const PushTime = styled(Col)`
  font-size: 11px;
  color: ${theme.metadataGrey};
  text-align: right;
  padding: 5px 10px;
  vertical-align: middle;
  ${(props) => props.hide_buttons && css`
    padding: 5px 10px 10px 10px;
  `};
`;
export const PushInner = styled(Row)`
  background: ${theme.white};
  box-shadow: 0 2px 8px rgba(0,0,0,0.25);
  border-radius: 12px;
  color: ${theme.white};
  overflow: hidden;

  ${(props) => props.type === "error" && css`
    background: ${lighten(0.1, theme.errorRed)};
    color: ${theme.white};
    ${PushActions} {
      color: rgba(255, 255, 255, 0.3);
    }
    ${PushTime} {
      color: rgba(255, 255, 255, 0.7);
    }
  `};
  ${(props) => props.type === "info" && css`
    background: ${theme.noticeYellowBackground};
    color: ${theme.noticeYellow};
    ${PushActions} {
      color: ${lighten(0.2, theme.noticeYellow)};
    }
    ${PushTime} {
      color: ${theme.noticeYellow};
    }
  `};
  ${(props) => props.type === "success" && css`
    background: ${lighten(0.1, theme.buttonGreen)};
    color: ${theme.white};
    ${PushActions} {
      color: rgba(255, 255, 255, 0.3);
    }
    ${PushTime} {
      color: rgba(255, 255, 255, 0.7);
    }
  `};
`;
export const PushSection = styled(Col)`
  align-self: flex-start;
`;
export const PushIcon = styled.div`
  text-align: center;
  font-size: 35px;
  padding-top: 16px;
`;
export const PushTitle = styled.div`
  text-align: left;
  font-size: 15px;
  padding: 20px 20px 15px 0;
`;
export const PushBody = styled.div`
  text-align left;
  font-size: 13px;
  white-space: pre-line;
  padding: 13px 20px 30px 0;
  line-height: 20px;
  font-weight: 300;
  ${(props) => props.has_title && css`
    padding: 0 20px 30px 0;
  `};
`;
export const PushMetaRow = styled(Row)`
  
`;
export const ButtonLink = styled.a`
  text-decoration: none;
`;