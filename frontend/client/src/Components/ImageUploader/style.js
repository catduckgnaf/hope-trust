import styled, { css } from "styled-components";
import { theme } from "../../global-styles";
import { Row, Col } from "react-simple-flex-grid";

export const Main= styled.div`
  
`;

export const MainPadding = styled.div`
  
`;

export const MainInner = styled(Row)`
  
`;

export const MainInnerSection = styled(Col)`
  ${(props) => props.align && css`
    text-align: ${props.align};
  `};
  ${(props) => props.editing && css`
    margin: 40px 0;
  `};
`;

export const Header = styled.div`
  color: ${theme.hopeTrustBlue};
  padding: 10px 10px 20px 10px;
  text-align: center;
  font-size: 22px;
  font-weight: 400;
  border-bottom: 1px solid ${theme.lineGrey};
`;

export const Message = styled.div`
  color: ${theme.hopeTrustBlue};
  padding: 20px;
  text-align: center;
  font-weight: 400;
  font-size: 14px;
  line-height: 22px;
`;

export const FileTypesMessage = styled.div`
  font-size: 12px;
  color: ${theme.metadataGrey};
  margin-top: 6px;
`;