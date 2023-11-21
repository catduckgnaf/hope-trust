import styled, { css } from "styled-components";
import { Row, Col } from "react-simple-flex-grid";
import media from "styled-media-query";
import { theme } from "../../global-styles";

export const UpgradeAppNoticeMain = styled.div`
  position: fixed;
  margin: auto;
  bottom: 0;
  right: 20px;
  z-index: 2147483646 !important;
  max-width: 350px;
  transition: 0.5s ease;
  display: none;
  margin-bottom: -500px;

  ${(props) => props.show && css`
    display: block;
    margin-bottom: 0;
  `};

  ${media.lessThan("500px")`
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
  `};
`;

export const UpgradeAppNoticePadding = styled.div`
  
`;

export const UpgradeAppNoticeInner = styled(Row)`
  background: ${theme.white};
  padding: 15px 0 15px 10px;
  margin: 5px 0;
  border-radius: 5px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);

  &:hover {
    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
  }
`;

export const UpgradeAppNoticeInnerSection = styled(Col)`

`;

export const UpgradeAppSectionHeader = styled.div`
  border-bottom: 1px solid ${theme.lineGrey};
  padding-bottom: 20px;
  margin-top: 25px;
  text-align: center;
  margin-bottom: 20px;
  color: ${theme.hopeTrustBlue};
  font-size: 18px;
  font-weight: 500;
`;

export const UpgradeAppSectionMessage = styled.div`
  text-align: center;
  margin-bottom: 20px;
  color: ${theme.metadataGrey};
  font-size: 14px;
  font-weight: 400;
  padding: 10px;
  line-height: 20px;
`;

export const UpgradeAppSectionButtonContainer = styled.div`
  text-align: center;
`;

export const UpgradeAppNoticeInnerSectionIcon = styled.div`
  text-align: center;
  padding: 10px;
  display: block;
  font-size: 60px;
  position: relative;
  margin: auto;
  margin-top: -50px;
  background: #FFF;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  box-shadow: 0 4px 3px rgb(0 0 0 / 16%);
  color: ${theme.hopeTrustBlue};
`;