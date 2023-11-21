import styled, { css } from "styled-components";
import { theme } from "../../global-styles";
import { Row, Col } from "react-simple-flex-grid";

export const CommentsModuleMain = styled.div`
  box-sizing: border-box;
  padding: 10px;
`;

export const CommentsModulePadding = styled.div`
  
`;

export const CommentsModuleInner = styled.div`
  
`;

export const CommentsModuleFeed = styled(Row)`
  max-height: 785px;
  overflow: auto;
`;

export const CommentsModuleFeedEmpty = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  width: 100%;
  color: ${theme.metadataGrey};
`;

export const CommentsModuleFeedItem = styled(Col)`
  
`;

export const CommentsModuleFeedItemPadding = styled(Row)`
  padding: 5px;
`;

export const CommentsModuleFeedItemInner = styled.div`
  width: 100%;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border-radius:4px;
  padding: 10px;
  margin: 10px 0;
  align-self: center;
  display: flex;
`;

export const CommentModuleFeedItemInfo = styled(Row)`
  
`;

export const CommentModuleFeedItemBody = styled(Col)`
  white-space: pre-wrap;
  font-size: 12px;
  line-height: 20px;
`;

export const CommentModuleFeedItemMeta = styled(Col)`
  font-size: 11px;
  color: ${theme.metadataGrey};
  width: 100%;
  margin: 2px 0;
  ${(props) => props.align && css`
    text-align: ${props.align};
  `};
`;

export const CommentsModuleInputContainer = styled(Row)`
  margin-top: 20px;
  padding: 0 5px;
`;

export const CommentsModuleInputContainerInner = styled(Col)`
  align-self: center;
`;

export const FeedItemSection = styled(Col)`
  align-self: center;
`;

export const CommentsModuleInput = styled.textarea`
  width: 100%;
  outline: none;
  border: 1px solid ${theme.lineGrey};
  border-radius: 4px;
  resize: none;
  padding: 10px;
  margin: 10px 0 0 0;
`;

export const CommentAvatarContainer = styled.div`
  display: inline-block;
  align-self: center;
  display: flex;
  padding: 10px 0 10px 0;
  margin: 0px 0 15px 0;

  img {
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    border: 1px solid ${theme.hopeTrustBlue};
    padding: 1px;
  }
`;