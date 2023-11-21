import styled from "styled-components";
import { theme } from "../../global-styles";
import media from "styled-media-query";

export const PinFieldMain = styled.div`
  
`;

export const PinFieldMessage = styled.div`
  color: ${theme.metadataGrey};
  font-size: 18px;
  line-height: 30px;
  font-weight: 300;

  ${media.lessThan("768px")`
    font-size: 12px;
  `}
`;

export const PinFieldSecondaryMessage = styled.div`
  color: ${theme.metadataGrey};
  font-size: 13px;
  font-weight: 300;
  margin-bottom: 20px;

  ${media.lessThan("768px")`
    font-size: 10px;
  `}
`;

export const PinFieldFormFields = styled.div`
  padding: 20px 0 0 0;
`;