import styled, { css } from "styled-components";
import { Row, Col } from "react-simple-flex-grid";
import { theme } from "../../global-styles";
import media from "styled-media-query";

export const CurrentVaultUsage = styled.div`
  display: inline-block;
  font-weight: 400;

  ${(props) => props.usage < props.limit && css`
    color: ${theme.buttonGreen};
  `};
  ${(props) => (((props.usage * 100) / props.limit) > 50) && ((props.usage * 100) / props.limit) < 90 && css`
    color: ${theme.notificationOrange};
  `};
  ${(props) => (((props.usage * 100) / props.limit) > 90) && css`
    color: ${theme.errorRed};
  `};
`;

export const TotalVaultUsage = styled.div`
  color: ${theme.hopeTrustBlue};
  display: inline-block;
  font-weight: 400;
`;

export const StatusBox = styled.div`
  max-width: 100%;
  width: 100%;
  ${media.lessThan("769px")`
     max-width: 100%;
  `}
`;

export const StatusBoxPadding = styled.div`
  
`;

export const StatusBoxInner = styled.div`
  align-items: center;
  justify-content: center;
  margin-bottom: 25px;
  margin-top: 25px;
  padding: 5px;
  text-align: left;
  position: relative;
  background: #FFF;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgb(0 0 0 / 10%);
}

`;

export const StatusSections = styled(Row)`
  align-self: center;
`;
export const StatusSection = styled(Col)`
  align-self: center;
  text-align: center;
`;

export const OptionContainer = styled.div`
  
`;
export const OptionImageContainer = styled.div`
  display: inline-block;
  margin-right: 10px;
  color: ${theme.hopeTrustBlue};
`;
export const OptionTextContainer = styled.div`
  display: inline-block;
`;

export const VaultPermissionHintItem = styled.div`
  color: ${theme.metadataGrey};
  font-size: 12px;
  margin-top: 4px;
  word-break: break-all;

  &:first-child {
    margin-top: 5px;
  }
`;