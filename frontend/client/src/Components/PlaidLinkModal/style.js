import styled from "styled-components";
import { theme } from "../../global-styles";
import { Row, Col } from "react-simple-flex-grid";

export const AccountItems = styled(Row)`
  width: 100%;
  font-size: 25px;
  color: ${theme.metadataGrey}
  text-align: center;
  margin-top: 20px;
`;

export const PlaidLinkModalTitle = styled.div`
  font-size: 25px;
  color: ${theme.metadataGrey}
  text-align: center;
  margin-bottom: 20px;
`;

export const AccountItemTitle = styled.div`
  width: 100%;
  font-size: 16px;
  font-weight: 300;
  text-align: left;
  padding: 0 0 20px 0;
  color: ${theme.metadataGrey};
  text-transform: capitalize;
`;

export const AccountItemMain = styled(Col)`
  
`;

export const AccountItemPadding = styled.div`
  width: 100%;
`;

export const AccountItemInner = styled(Row)`
  background: ${theme.white};
  padding: 15px 10px;
  margin: 5px 0;
  border-radius: 5px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.3);

  &:hover {
    box-shadow: 0 1px 2px rgba(0,0,0,0.5);
  }
`;

export const AccountItemSection = styled(Col)`
  
`;

export const AccountItem = styled.div`
  
`;

export const AccountItemField = styled.div`
  
`;

export const LinkAccountsButtonContainer = styled(Col)`
  text-align: left;
  margin-top: 15px;
`;