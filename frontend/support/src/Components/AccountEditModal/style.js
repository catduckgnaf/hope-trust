import styled from "styled-components";
import { theme } from "../../global-styles";
import { Row, Col } from "react-simple-flex-grid";

export const AccountEditModalMain = styled.div`
  
`;

export const FeatureItems = styled(Row)`
  
`;

export const FeatureItem = styled(Col)`
  
`;

export const FeatureFooter = styled(Row)`
  border-top: 1px solid ${theme.lineGrey};
  padding: 30px 15px 10px 15px;
  margin-top: 25px;
`;

export const FeatureFooterSection = styled(Col)`
  
`;

export const FeaturesHeader = styled.div`
  text-align: center;
  width: 100%;
  font-size: 20px;
  color: ${theme.hopeTrustBlue};
  font-weight: 400;
  border-bottom: 1px solid ${theme.lineGrey};
  padding: 0 0 15px 0;
  margin-bottom: 25px;
`;

export const ItemsHeader = styled(Col)`
  text-align: left;
  font-size: 16px;
  color: ${theme.hopeTrustBlue};
  font-weight: 400;
  border-bottom: 1px solid ${theme.lineGrey};
  padding: 0 15px 15px 15px;
  margin-bottom: 25px;
`;

export const Group = styled.div`
  display: inline-block;
  cursor: pointer;
`;

export const Icon = styled.div`
  display: inline-block;
  margin-left: 5px;
  cursor: pointer;
`;