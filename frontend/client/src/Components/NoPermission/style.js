import styled from "styled-components";
import { Row, Col } from "react-simple-flex-grid";
import { theme } from "../../global-styles";

export const NoPermissionMain = styled.div`
  width: 100%;
`;

export const NoPermissionPadding = styled.div`
  
`;

export const NoPermissionInner = styled(Row)`
  align-items: center;
`;

export const NoPermissionInnerSection = styled(Col)`
  text-align: center;
  align-self: center;
`;

export const NoPermissionInnerSectionIcon = styled.div`
  padding: 68px 50px 0 50px;
`;

export const NoPermissionInnerSectionText = styled.div`
  font-size: 11px;
  color: ${theme.metadataGrey};
  padding: 20px 5px;
`;

export const NoPermissionInnerSectionInner = styled.div`
  font-size: 50px;
`;

export const NoPermissionInnerSectionIconSuper = styled.div`
  color: ${theme.fontGrey};
  z-index: 1;
`;

export const NoPermissionInnerSectionIconRegular = styled.div`
  color: ${theme.buttonLightGreen};
  z-index: 0;
`;
