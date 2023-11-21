import styled from "styled-components";
import media from "styled-media-query";

export const StripeElementWrapperMain = styled.div`
  ${media.greaterThan("1200px")`
    min-width: 800px;
  `};
`;