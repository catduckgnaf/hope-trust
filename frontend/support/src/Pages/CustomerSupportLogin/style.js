import styled from "styled-components";
import { ViewContainer, AuthenticationLogo, AuthenticationLogoContainer } from "../../global-components";
import media from "styled-media-query";

export const LoginViewContainer = styled(ViewContainer)`
  width: 100%;
  display: flex;
  flex-direction: column;
  display: flex;
  -webkit-align-items: center;
  -webkit-box-align: center;
  -ms-flex-align: center;
  -webkit-box-pack: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  height: -webkit-fill-available;
  
  ${media.lessThan("550px")`
    height: auto;
  `}
`;

export const LoginLogoContainer = styled(AuthenticationLogoContainer)`
  width: 100%;
  padding: 40px 0;
`;

export const LoginLogo = styled(AuthenticationLogo)`
  width: 200px;
`;
