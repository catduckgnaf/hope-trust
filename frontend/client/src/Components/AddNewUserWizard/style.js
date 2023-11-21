import styled from "styled-components";
import { theme } from "../../global-styles";
import { Row, Col } from "react-simple-flex-grid";
import media from "styled-media-query";

export const AddNewUserInnerModal = styled(Row)`
  padding: 0;
  position: relative;
  transition: 0.5s ease;
`;

export const AddNewUserMainModalTitle = styled(Col)`
  color: ${theme.hopeTrustBlue};
  font-size: 25px;
  text-align: center;
  margin-bottom: 20px;
`;

export const AddNewUserMainButtonContainer = styled(Col)`
  text-align: right;
`;

export const AddNewUserMainText = styled.div`
  font-size: 20px;
  font-weight: 300;
  padding: 20px 20px 0 20px;
  line-height: 25px;

  ${media.lessThan("990px")`
    font-size: 12px;
  `};
`;

export const AddNewUserMainOptionsContainer = styled(Row)`
  padding: 40px 20px;
`;

export const AddNewUserMainOptionPadding = styled.div`
  
`;

export const AddNewUserMainOptionInner = styled.div`
  display: flex;
  color: ${theme.hopeTrustBlue};
  background: #FFFFFF;
  border-radius: 0;
  border-top: 1px solid ${theme.lineGrey};
  padding: 30px 20px;
  text-align: left;
  text-transform: capitalize;
  cursor: pointer;

  &:hover {
    background: rgba(0,0,0,0.04);
  }

`;

export const AddNewUserMainOption = styled(Col)`
  &:last-child {
    ${AddNewUserMainOptionInner} {
      border-bottom: 1px solid ${theme.lineGrey};
    }
  }
`;

export const AddNewUserIconItem = styled.div`
  display: inline-block;
  font-size: 25px;
  align-self: center;
  min-width: 55px;
`;

export const AddNewUserItemInfo = styled.div`
  display: inline-block;
`;

export const AddNewUserTextItem = styled.div`
  display: block;
  margin-left: 20px;
  font-size: 18px;
  align-self: center;
  vertical-align: middle;
  text-transform: none;

  ${media.lessThan("990px")`
    font-size: 13px;
  `};
`;

export const AddNewUserTextSubItem = styled.div`
  display: block;
  margin-left: 20px;
  margin-top: 5px;
  font-size: 12px;
  align-self: center;
  vertical-align: middle;
  text-transform: none;
  color: ${theme.metadataGrey}
`;