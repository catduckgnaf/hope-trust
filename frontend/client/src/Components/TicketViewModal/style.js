import styled, { css } from "styled-components";
import { theme } from "../../global-styles";
import { Row, Col } from "react-simple-flex-grid";
import { FormError, SelectWrapper, Select } from "../../global-components";
import media from "styled-media-query";
import { darken } from "polished";

export const ModalContainer = styled.div`
  margin-top: 50px;

  ${media.lessThan("769px")`
    margin-top: 95px;
  `};
`;

export const ViewTicketModalInner = styled(Row)`
  padding: 0;
  position: relative;
  transition: 0.5s ease;

  ${(props) => props.isloading && css`
    max-height: 300px;
    overflow: hidden;
  `};
`;
export const ViewTicketModalInnerHeader = styled(Col)`
  text-align: center;
  padding: 15px;
  border-bottom: 1px solid ${theme.lineGrey}
  margin-bottom: 0;
  font-size: 24px;
  font-weight: 400;
  color: ${theme.hopeTrustBlue};
  z-index: 1;
  text-transform: capitalize;

`;
export const ViewTicketModalInnerBody = styled(Col)`
  padding: 0 10px 20px 10px;
  align-self: flex-start;

  ${media.lessThan("769px")`
    padding: 0 10px 0 10px;
  `}
`;
export const ViewTicketModalInnerFooter = styled(Col)`
  text-align: center;
  padding: 5px 15px;
  font-size: 18px;
  font-weight: 400;
  color: ${theme.hopeTrustBlue};
  z-index: 1;
  cursor: pointer;

  ${media.lessThan("769px")`
    padding-top: 20px;
  `}
`;

export const ViewTicketModalInnerFooterInput = styled.input`
  padding: 10px;
  font-size: 16px;
  font-weight: 300;
  color: ${theme.metadataGrey};
  width: 100%;
  border-radius: 6px;
  outline: 0;
  border: 1px solid ${theme.lightGrey};
  box-shadow: none;
`;

export const ViewTicketModalInfo = styled(Row)`
  width: 100%;
  text-align: left;
  padding: 0 0 0 20px;
`;

export const ViewTicketModalInfoItem = styled(Col)`
  width: 100%;
`;

export const ViewTicketModalInnerLogo = styled(Col)`
  text-align: center;
  margin-top: -50px;
`;

export const ViewTicketModalInnerLogoImg = styled.img`
  width: 100px;
  background: #FFF;
  border-radius: 50%;
`;

export const Comment = styled(Col)`
  width: 100%;
`;

export const CommentPadding = styled(Row)`
  padding: 15px 0;
  flex-direction: ${(props) => props.agent ? "row-reverse" : "row"} !important;
`;

export const CommentInnerIcon = styled(Col)`
  padding: 0;
  display: flex;
  height: 100%;
  align-self: center;
  z-index: 1;
  text-align: ${(props) => props.align ? "right" : "left"};

  img {
    border: 1px solid ${theme.hopeTrustBlue};
    padding: 1px;
  }
`;
export const CommentInner = styled(Col)`
  padding: 20px;
  background:${theme.white};
  box-shadow: 0 2px 4px ${darken(0.1, theme.boxShadowLight)};
  border-radius: 2px;
  font-size: 15px;
  line-height: 22px;
  font-weight: 300;
  color: ${theme.metadataGrey};

  ${media.lessThan("769px")`
    padding-left: 35px;
  `}

  p {
    white-space: pre-line;
    line-height: 25px;
  }
`;

export const CommentMeta = styled(Col)`
  font-size: 11px;
  width: 100%;
  margin: 8px 0 0 0;
  font-weight: 300;
  text-transform: capitalize;
  color: ${theme.metadataGrey};
  text-align: right;
  text-align: ${(props) => props.right ? "right" : "left"};
`;

export const CommentInfoItem = styled(Row)`

`;
export const CommentInfoHeader = styled(Col)`
  font-weight: 400;
  color: ${theme.metadataGrey};
  font-size: 14px;
  margin: 15px 0 10px 0;
`;
export const CommentInfoData = styled(Col)`
  font-weight: 300;
  color: ${theme.metadataGrey};
  font-size: 13px;
  line-height: 20px;

  ${(props) => props.transform & css`
    text-transform: ${props.transform};
  `};
`;
export const CommentError = styled(Col)`
  text-align: center;
  font-size: 16px;
  font-weight: 300;
  padding: 10px;
`;

export const Tag = styled.div`
  width: auto;
  color: ${theme.white};
  padding: 3px 12px;
  text-align: center;
  background: grey;
  border-radius: 3px;
  width: fit-content;
  display: inline-block;
  margin-right: 5px;
  margin-top: 5px;
`;

export const TicketMainContent = styled(Col)`
  height: 100%;
  overflow: hidden;
`;

export const ViewTicketModalComments = styled(Col)`
  
`;

export const ViewModalCommentsInner = styled(Row)`
  margin-top: 0;
  overflow: auto;
  padding: 0 15px;
`;

export const ViewTicketModalCommentSendButton = styled(Col)`
  text-align: right;
`;

export const ViewTicketModalCommentError = styled(FormError)`
  padding: 10px 0 0 0;
`;

export const ModalHeader = styled(Row)`
  width: 100%;
  padding: 10px 15px;
`;

export const ModalHeaderSection = styled(Col)`
  font-size: 18px;
  color: ${theme.metadataGrey};
  font-weight: 400;
  justify-content: center;
  align-self: center;

  ${(props) => props.align & css`
    text-align: ${props.align};
  `};
  ${media.lessThan("769px")`
    font-size: 0.8rem;
  `}
`;

export const ActivityFeedOptionSection = styled(Col)`
  padding: 0 0 0 20px;

  ${(props) => props.align && css`
    text-align: ${props.align};
  `};
  ${media.lessThan("769px")`
    padding: 10px 0 10px 0;
  `}
`;
export const ActivityFeedSearchSelectWrapper = styled(SelectWrapper)`
  margin: 0;
  padding: 0;
`;
export const ActivityFeedSearchSelect = styled(Select)`
  margin-top: 0;
  border: none;
  border-bottom: 1px solid ${theme.lineGrey};
  border-radius: 0;
  padding: 0 3px;
  font-size: 12px;
  color: ${theme.metadataGrey};
`;