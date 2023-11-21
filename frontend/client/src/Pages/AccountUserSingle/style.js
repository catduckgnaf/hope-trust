import styled, { css } from "styled-components";
import { theme } from "../../global-styles";
import { Row, Col } from "react-simple-flex-grid";
import media from "styled-media-query";
import bg from "./bg-blue.jpg";

export const UserProfileMain = styled(Row)`
  max-width: 1500px;
  position: relative;
  margin: auto;
`;

export const UserProfileMainHeader = styled(Col)`
  
`;

export const UserProfileMainSection = styled(Col)`
  ${media.lessThan("1200px")`
    margin-bottom: 20px;
  `};
  ${(props) => props.sticky && css`
    position: sticky !important;
    top: 10px !important;
  `};
`;

export const UserProfileMainSectionPadding = styled.div`
  padding: 0 18px;
`;

export const UserProfileMainSectionInner = styled.div`
  background: ${theme.white};
  box-shadow: ${theme.boxShadowDefault};
  border-radius: ${theme.defaultBorderRadius};
  overflow: hidden;
  height: 100%;
`;

export const UserProfileSectionBody = styled.div`
  flex: 1 1 auto;
  overflow-y: auto;
  ${(props) => props.margintop && css`
    margin-top: ${props.margintop}px;
  `};
  ${(props) => props.paddingtop && css`
    padding-top: ${props.paddingtop}px;
  `};
  border-bottom: 1px solid ${theme.lineGrey};
  border-top: 1px solid ${theme.lineGrey};
`;

export const UserProfileHeaderBackground = styled.div`
  height: 150px;
  background-image: url(${bg});
  background-size: 80%;
  background-position: bottom center;
`;

export const UserProfileSectionHeader = styled.header`
  background-color: transparent;
  flex: 0 0 auto;
  padding: 0;
`;
export const UserProfileSectionFooter = styled.footer`
  background-color: transparent;
  flex: 0 0 auto;
  padding: 0;
`;

export const UserProfileAvatarContainer = styled.div`
  width: 100%;
  text-align: center;
  margin-top: -100px;
  padding: 20px;
`;

export const UserProfileSectionPadding = styled.div`
  padding: 20px;
  ${(props) => props.nopadding && css`
    padding: 0;
  `};
`;

export const UserProfileHeaderTitle = styled.div`
  font-size: 20px;
  color: ${theme.hopeTrustBlue};
  font-weight: 400;
`;

export const UserProfileName = styled.div`
  font-size: 20px;
  color: ${theme.black};
  text-transform: capitalize;
  width: 100%;
  text-align: center;
  margin-top: 10px;
`;

export const UserProfileSecondaryInfo = styled.div`
  font-size: 16px;
  text-transform: capitalize;
  color: ${theme.metadataGrey};
  width: 100%;
  text-align: center;
  margin-top: 5px;
`;

export const UserProfileContactIcons = styled(Row)`
  position: absolute;
  top: 10px;
  right: 20px;
  background: transparent;
`;

export const UserProfileContactIcon = styled(Col)`
  text-align: center;
  font-size: 20px;
  min-width: 50px;
  color: ${theme.white};
  cursor: pointer;
  transition: 0.5s ease;
  &:hover {
    transform: scale(0.9);
  }
`;

export const UserProfileContactLink = styled.a`
  text-decoration: none;
  color: ${theme.white};
`;