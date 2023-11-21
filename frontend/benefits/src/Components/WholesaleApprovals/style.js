import styled, { css } from "styled-components";
import { Row, Col } from "react-simple-flex-grid";
import media from "styled-media-query";
import { theme } from "../../global-styles";
import {
  InputWrapper,
  Input,
  SelectWrapper,
  Select
} from "../../global-components";

export const UsersTable = styled.div`
  width: 100%;
`;

export const UsersTablePadding = styled.div`
  padding: 20px 30px;
`;

export const UsersColumnHeaders = styled(Row)`
  border-bottom: 1px solid rgba(0,0,0,0.1);
  margin-bottom: 10px;
  padding-left: 10px;

  ${media.lessThan("990px")`
    display: none !important;
  `};
`;

export const UsersMain = styled.div`
  
`;

export const UsersPadding = styled.div`
  padding: 20px;
`;

export const UsersInner = styled.div`
  background: ${theme.white};
  border-radius: 0 0 8px 8px;
`;

export const UsersColumnHeader = styled(Col)`
  font-weight: 500;
  padding: 5px 0;
  font-size: 12px;

  ${(props) => props.sortable && css`
    color: ${theme.hopeTrustBlue};

    &:hover {
      cursor: pointer;
      font-weight: 600;
    }
  `};
`;

export const UsersColumnHeaderIcon = styled.span`
  margin-right: 5px;
`;

export const UsersOptionsRow = styled(Row)`
  position: sticky;
  top: 0;
  z-index: 1;
  margin: 0 20px;
`;

export const UsersOptionsContainer = styled(Col)`
  margin-bottom: 10px;
  margin-top: 20px;
`;

export const UsersOptions = styled(Row)`
  padding: 20px 10px;
  justify-content: center;
  align-self: center;
  background:${theme.white};
  box-shadow: 0 2px 4px ${theme.boxShadowLight};
  border-radius: 6px;
  margin: 0;
`;
export const UsersOptionSection = styled(Col)`
  ${(props) => props.align && css`
    text-align: ${props.align};
  `};
`;

export const UsersSearchInputWrapper = styled(InputWrapper)`
  margin-bottom: 0;
  padding: 0 10px;
`;
export const UsersSearchInput = styled(Input)`
  color: ${theme.metadataGrey};
`;
export const UsersSearchButtonWrapper = styled(Col)`
  text-align: center;
  margin-bottom: 0;
  padding: 5px 0px;
`;

export const UsersSearchMessage = styled(Row)`
  text-align: center;
  margin-top: 20px;
`;
export const UsersSearchText = styled(Col)`
  font-size: 14px;
  font-weight: 300;
  color: ${theme.metadataGrey};
`;
export const UsersSearchAction = styled(Col)`
  padding: 20px 0;
`;

export const UsersAlphabeticalSearchContainer = styled.div`
  
`;

export const UsersAlphabeticalSearchContainerPadding = styled(Row)`
  padding: 5px 20px;
`;

export const UsersAlphabeticalSearchContainerInner = styled(Col)`
  
`;

export const UserSearchSelectWrapper = styled(SelectWrapper)`
  margin-bottom: 0;
  padding: 10px 20px;
  ${media.lessThan("769px")`
     padding: 10px 10px;
  `}
`;
export const UserSearchSelect = styled(Select)`
  margin-top: 0;
  border: none;
  border-bottom: 1px solid ${theme.lineGrey};
  border-radius: 0;
  padding: 0 3px;
  font-size: 12px;
  color: ${theme.metadataGrey};
`;

export const LetterLinks = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px;
`;

export const LetterLink = styled.div`
  display: flex;
  color: ${theme.hopeTrustBlue};
  font-weight: 400;
  font-size: 14px;

  ${(props) => props.active && css`
    font-weight: 500;
  `};
  
  &:hover {
    cursor: pointer;
    color: ${theme.hopeTrustBlueDarker};
    font-weight: 500;
    transform: scale(1.1);
  }
`;