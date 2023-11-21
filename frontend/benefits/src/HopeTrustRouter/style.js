import styled, { css } from "styled-components";
import { theme } from "../global-styles";
import media from "styled-media-query";
import { Row, Col } from "react-simple-flex-grid";
import { ViewContainer } from "../global-components";

export const MainViewContainer = styled(ViewContainer)`
  width: 100%;
  height: 100%;
`;

export const MainWrapper = styled.div`
  height: 100%;
  width: 100%;
  display: -moz-box;
  display: -webkit-box;
  display: -ms-flexbox;
  display: -webkit-flex;
  display: flex;
`;
export const MainWrapperHeader = styled.div`
  display: none;

  ${media.lessThan("1024px")`
    width: 100%;
    display: flex;
    flex-direction: row;
  `};
`;
export const MainWrapperHeaderPadding = styled.div`
  width: 100%;
`;
export const MainWrapperInner = styled(Row)`
  width: 100%;
  align-items: center !important;
  background: ${theme.hopeTrustBlue};
  height: auto;
`;
export const MainWrapperSection = styled(Col)`
  padding: 10px;
  color: #FFFFFF;

  ${(props) => props.align && css`
    text-align: ${props.align};
  `};
`;
export const MainWrapperSectionInner = styled.div`

`;
export const MainWrapperHeaderLogo = styled.img`
  width: 100px;
  cursor: pointer;
  ${(props) => props.width && css`
    width: ${props.width}px;
  `};
`;
export const MainWrapperHeaderMenu = styled.div`

`;
export const MainContent = styled.div`
  -moz-box-flex: 1;
  -webkit-box-flex: 1;
  -ms-flex: 1;
  -webkit-flex: 1;
  flex: 1;

  ${(props) => props.logged_in && css`
    padding: 0 0 0 15px;
    overflow-x: hidden !important;
  `};
`;
export const LogoHeader = styled.div`
  min-height: 85px;
  padding: 30px 0;
  text-align: center;
`;
export const LogoIconLoader = styled.div`
  min-height: 85px;
  padding: 30px 0;
  text-align: center;
  font-size: 100px;
  color: ${theme.hopeTrustBlue};
`;

export const LogoImg = styled.img`
  width: 100px;
  cursor: pointer;
`;
export const AccountAvatarContainer = styled.div`
  position: relative;
`;
export const AccountAvatarTitle = styled.div`
  width: 100%;
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 165px;
  margin: auto;
  margin-top: 10px;
`;
export const AccountAvatar = styled.img`
  width: 100px;
  border-radius: 50%;
  box-shadow: 0 4px 3px rgba(0,0,0,0.3);
  padding: 2px;
  border: 1px solid #252525;
`;
export const PartnerLogo = styled.div`
  position: absolute;
  top: 0;
  right: 50px;
`;
export const SideBarNav = styled.nav`
  padding-bottom: 10px;
`;
export const SideBar = styled.div`
  width: 220px;
  transition: 0.1s ease;
  position: relative;
  max-height: 100%;
  overflow: initial;
  background: #FFFFFF;
  box-shadow: 0 4px 8px rgb(0 0 0 / 10%);

  ::-webkit-scrollbar {
    display: none;
  }

  ${(props) => props.open && css`
      z-index: 99999999999999;
  `};

  ${media.lessThan("1024px")`
    opacity: 0;
    margin-left: -220px;

    ${(props) => props.open && css`
      opacity: 1;
      display: block;
      margin-left: 0;
      height: 100vh;
      z-index: 99999999999999;
      box-shadow: 0 4px 8px ${theme.boxShadowLight};
    `};
  `};
`;
export const SideBarList = styled.ul`
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  list-style: none;
  -ms-overflow-style: none;

  ${media.lessThan("1024px")`
    padding-bottom: 51px;
  `};

  ::-webkit-scrollbar {
    display: none;
  }
`;

export const SideBarItemIcon = styled.span`
  display: block;
  float: left;
  line-height: 40px;
  margin-right: 10px;
  position: relative;
  text-align: center;
  width: 40px;
  transition: 0.1s ease;
  font-size: 16px;
  color: ${theme.hopeTrustBlue};

  ${media.lessThan("1024px")`
    line-height: 35px;
  `};
`;

export const SideBarItem = styled.li`
  width: 100%;
  cursor: pointer;

  ${(props) => props.separate && css`
    border-bottom: 1px solid ${theme.lineGrey};
    margin-bottom: 10px;
    padding-bottom: 10px;
  `};
`;

export const SideBarItemTitle = styled.span`
  color: ${theme.activeTextGrey};

  ${(props) => props.hide && css`
      display: none;
  `};
`;
export const SideBarItemLink = styled.div`
  display: block;
  font-size: 14px;
  line-height: 40px;
  position: relative;
  border-right: 4px solid transparent;

  ${media.lessThan("1024px")`
    font-size: 12px;
    line-height: 35px;
  `};

  &:hover {
    border-right: 4px solid ${theme.hopeTrustBlue};
  }

  ${(props) => props.active && css`
    border-right: 4px solid ${theme.hopeTrustBlue};
  `};
  ${(props) => props.disabled && css`
    pointer-events: none;
  `};
`;

export const MobileContent = styled.div`
  flex: 1 1 auto;
  overflow-y: auto !important;
`;

export const MobileHeader = styled.header`
  background-color: transparent;
  flex: 0 0 auto;
  padding: 0;
  z-index: 99;
`;

export const MobileWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const MobileFooter = styled.footer`
  background-color: transparent;
  flex: 0 0 auto;
  padding: 0;
`;

export const SidebarBody = styled.div`
  flex: 1 1 auto;
  overflow-y: auto;
`;

export const SidebarHeader = styled.header`
  background-color: transparent;
  flex: 0 0 auto;
  padding: 0;
`;

export const SidebarWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  ${(props) => props.open && css`
    height: auto;
  `};
`;

export const SidebarFooter = styled.footer`
  background-color: transparent;
  flex: 0 0 auto;
  padding: 10px 0 0 0;
  border-top: 1px solid ${theme.lineGrey};
`;

export const Badge = styled.span`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 3px;
  margin: auto;
  width: 1.5rem;
  height: 1.5rem;
  align-items: center;
  display: inline-flex;
  justify-content: center;
  pointer-events: none;
  background: #136B9D;
  color: #FFFFFF;
  border-radius: 50%;
  font-size: .625rem;
  font-weight: 400;
  letter-spacing: .0357142857em;
  ${(props) => props.color && css`
    background: ${props.color};
  `};
`;