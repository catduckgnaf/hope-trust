import styled, { css } from "styled-components";
import { theme } from "../../global-styles";
import { Row, Col } from "react-simple-flex-grid";
import media from "styled-media-query";

export const ProfessionalPortalServicesInnerModal = styled(Row)`
  padding: 0;
  position: relative;
  transition: 0.5s ease;

  ${(props) => props.isloading && css`
    max-height: 575px;
    overflow: hidden;
  `};

  ${(props) => props.is_locked && css`
    max-height: 800px;
    overflow: hidden;
    align-content: center;
  `};
`;

export const ProfessionalPortalAssistanceMainModalTitle = styled(Col)`
  color: ${theme.hopeTrustBlue};
  font-size: 25px;
  text-align: center;
  margin-bottom: 20px;
`;

export const ProfessionalPortalAssistanceMainButtonContainer = styled(Col)`
  text-align: right;
  padding: 0 20px;
`;

export const ProfessionalPortalAssistanceMainText = styled.div`
  font-size: 20px;
  font-weight: 300;
  padding: 20px 20px 0 20px;
  line-height: 30px;
`;

export const ProfessionalPortalAssistanceMainOptionsContainer = styled(Row)`
  padding: 20px 20px 40px 20px;
`;

export const ProfessionalPortalAssistanceMainOptionPadding = styled.div`
  
`;

export const TextItemIcon = styled.div`
  font-size: 25px;
  color: ${theme.hopeTrustBlue};

  ${media.lessThan("500px")`
    font-size: 20px;
  `};
`;

export const TextItemTitle = styled.div`
  font-size: 18px;
  font-weight: 400;
  margin-bottom: 10px;
  color: ${theme.hopeTrustBlue};

  ${media.lessThan("500px")`
    font-size: 13px;
  `};
`;

export const TextItemSecondary = styled.div`
  font-size: 13px;
  margin-bottom: 5px;
  line-height: 19px;
  color: ${theme.metadataGrey};

  ${media.lessThan("500px")`
    font-size: 12px;
  `};
  max-width: 90%;
`;

export const TextItemLastPurchase = styled.a`
  font-size: 12px;
  font-weight: 500;
  line-height: 19px;
  text-decoration: none;
  color: ${theme.buttonGreen};

  ${media.lessThan("500px")`
    font-size: 10px;
  `};

  &:hover {
    color: ${theme.hopeTrustBlueDarker};
  }
`;

export const TextItemPrice = styled.div`
  font-size: 17px;
  font-weight: 400;
  margin-bottom: 10px;
  color: ${theme.hopeTrustBlue};

  ${media.lessThan("500px")`
    font-size: 14px;
  `};
`;

export const ProfessionalPortalAssistanceMainOptionInner = styled.div`
  display: flex;
  background: #FFFFFF;
  border-radius: 6px;
  box-shadow: 0 7px 0px -14px rgb(50 50 93 / 25%), 0 3px 7px -3px rgb(0 0 0 / 30%);
  padding: 30px 20px;
  text-align: left;
  text-transform: capitalize;
  margin-top: 10px;

  &:hover {
    background: rgba(0,0,0,0.04);
  }
  ${(props) => props.active && css`
    background: ${theme.hopeTrustBlue};

    ${TextItemIcon} {
      color: ${theme.white};
    }
    ${TextItemTitle} {
      color: ${theme.white};
    }
    ${TextItemPrice} {
      color: ${theme.white};
    }
    ${TextItemSecondary} {
      color: ${theme.white};
    }
    ${TextItemLastPurchase} {
      color: ${theme.white};
    }

    &:hover {
      background: ${theme.hopeTrustBlue};
    }
  `};

   ${(props) => props.disabled && css`
    cursor: no-drop;
    background: ${theme.disabled};

    ${TextItemIcon} {
      color: ${theme.metadataGrey};
    }
    ${TextItemTitle} {
      color: ${theme.metadataGrey};
    }
    ${TextItemPrice} {
      color: ${theme.metadataGrey};
    }
    ${TextItemSecondary} {
      color: ${theme.metadataGrey};
    }
  `};

`;

export const ProductItem = styled.div`
  
`;

export const ProfessionalPortalAssistanceMainOption = styled(Col)`
  &:last-child {
    ${ProfessionalPortalAssistanceMainOptionInner} {
      border-bottom: 1px solid ${theme.lineGrey};
    }
  }
`;

export const ProfessionaLPortalAssistanceItems = styled(Row)`
  font-size: 25px;
  align-self: center;
  width: 100%;
`;

export const ProfessionaLPortalAssistanceIconItem = styled(Col)`
  align-self: center;

  ${(props) => props.align && css`
    text-align: ${props.align};
  `};
`;

export const ProfessionaLPortalAssistanceTextItem = styled(Col)`
  align-self: center;
  vertical-align: middle;

  ${(props) => props.align && css`
    text-align: ${props.align};
  `};
`;

export const CategoryHeader = styled(Col)`
  font-size: 20px;
  font-weight: 500;
  text-align: left;
  color: ${theme.hopeTrustBlue};
  padding: 35px 5px 15px 5px;
`;

export const OutputSectionsPadding = styled.div`
  padding: 0 20px;
`;

export const OutputSectionsInner = styled.div`
  border-radius: 6px;
  box-shadow: 0 7px 0px -14px rgb(50 50 93 / 25%), 0 3px 7px -3px rgb(0 0 0 / 30%);
  color: ${theme.hopeTrustBlue};
  padding: 20px;
  margin-bottom: 30px;
`;

export const OutputSectionInner = styled.div`
  background: ${theme.hopeTrustBlue};
  color: ${theme.white};
  font-size: 14px;
  font-weight: 500;
  padding: 20px 20px 40px 20px;
`;

export const OutputSections = styled(Row)`
  
`;

export const OutputSection = styled(Col)`
  ${(props) => props.align && css`
    text-align: ${props.align};
    padding: 5px;
  `};
`;

export const ButtonContainer = styled(Row)`
  padding: 0 15px;
`;

export const ConfirmAgreementContainer = styled(Row)`
  
`;

export const ConfirmAgreementContainerHeader = styled(Col)`
  text-align: center;
  padding: 20px;
  border-bottom: 1px solid ${theme.lineGrey};
  margin-bottom: 10px;
  color: ${theme.hopeTrustBlue};
  font-size: 18px;
`;
export const ConfirmAgreementContainerBody = styled(Col)`
  
`;
export const ConfirmAgreementContainerFooter = styled(Col)`
  border-top: 1px solid #DCDBDB;
  padding: 20px 10px 10px 10px;
  margin-bottom: 20px;
  margin-top: 0;
`;

export const ConfirmAgreementContainerFooterSections = styled(Row)`
  padding: 0 5px;
`;

export const ConfirmAgreementContainerFooterSection = styled(Col)`
  font-size: 13px;
  font-weight: 500;
  color: ${theme.hopeTrustBlue};
  margin-top: 5px;
  ${(props) => props.align && css`
    text-align: ${props.align};
  `};
`;

export const LineItemInner = styled(Row)`
  padding: 8px 5px;
  border-bottom: 1px solid ${theme.lineGrey};

`;

export const LineItem = styled.div`
  &:last-child {
    ${LineItemInner} {
      border-bottom: none;
    }
  }
`;

export const LineItemPadding = styled.div`
  padding: 0 5px;
`;

export const LineItemSectionTitle = styled(Col)`
  font-size: 13px;
  max-width: 90%;
  padding-right: 25px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  white-space: pre-line;
  line-height: 20px;
  vertical-align: middle;
  color: ${theme.metadataGrey};
  font-weight: 400;
`;

export const LineItemSectionPrice = styled(Col)`
  font-size: 13px;
  color: ${theme.hopeTrustBlue};
  font-weight: 500;
`;

export const PayWall = styled.div`
  height: 100%;
  width: 100%;
  position: absolute;
  z-index: 99;
  display: flex;
`;
export const PayWallOverlay = styled.div`
  height: 100%;
  width: 100%;
  position: absolute;
  z-index: 100;
  background: rgba(255, 255, 255, 0.7);
  transition: 0.3s ease;
`;
export const PayWallPadding = styled.div`
  position: relative;
  margin: auto;
  z-index: 101;
  max-width: 700px;
  width: 100%;
`;
export const PayWallInner = styled(Row)`
  background: #FFFFFF;
  border-radius: 6px;
  box-shadow: 0 7px 0px -14px rgb(50 50 93 / 25%), 0 3px 7px -3px rgb(0 0 0 / 30%);
  padding: 30px 20px;
`;
export const PayWallIcon = styled(Col)`
  font-size: 100px;
  text-align: center;
  color: ${theme.hopeTrustBlue};
`;
export const PayWallBody = styled(Col)`
  
`;
export const PayWallBodyHeader = styled.div`
  color: ${theme.hopeTrustBlue};
  font-size: 25px;
  text-align: center;
  font-weight: 400;
  margin-top: 20px;
`;
export const PayWallBodyText = styled.div`
  font-size: 18px;
  font-weight: 400;
  text-align: center;
  margin-top: 20px;
`;
export const PayWallFooter = styled(Col)`
  
`;
export const ConfirmAgreementNote = styled.div`
  text-align: center;
  font-size: 11px;
  font-weight: 300;
  color: ${theme.metadataGrey};
`;

export const ConfirmAgreementContainerNoteContainer = styled(Col)`
  margin-top: 20px;
`;

export const PayWallButtonContainer = styled.div`
  text-align: center;
  justify-content: center;
  align-items: center
  margin-top: 40px;
`;