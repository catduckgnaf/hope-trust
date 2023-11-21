import styled from "styled-components";
import media from "styled-media-query";

export const CancelSubscriptionMain = styled.div`
  width: 100%;
  //height: 100%;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;

  ${media.lessThan("810px")`
    
  `}
`;