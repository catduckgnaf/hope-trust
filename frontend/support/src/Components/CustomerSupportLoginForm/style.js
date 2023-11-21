import styled, { css } from "styled-components";
import { theme } from "../../global-styles";
import { Button } from "../../global-components";
import { Row, Col } from "react-simple-flex-grid";
import media from "styled-media-query";

export const CustomerServiceLoginFormMain = styled.div`
  width: 70%;
  position: relative;
  margin: auto;
`;

export const CustomerServiceLoginFormFields = styled.div`
  padding: 20px 0;
`;

export const FormTabs = styled(Row)`

`;

export const FormTab = styled(Col)`
  background: ${theme.white};
  padding: 5px 0 20px 0;
  margin-bottom: 35px;
  cursor: pointer
  font-weight: 300;
  font-size: 16px;

  ${media.lessThan("990px")`
    font-size: 14px;
  `};

  ${media.lessThan("500px")`
    font-size: 12px;
  `};

  ${(props) => props.active === "true" && css`
    border-bottom: 2px solid ${theme.buttonGreen};
  `};
`;

export const FormBottomLink = styled.div`
  color: ${theme.hopeTrustBlueLink};
  display: block;
  font-size: 12px;
  margin-top: 10px;
  cursor: pointer;

  &:hover {
    color: ${theme.hopeTrustBlue};
  }
  &:active {
    color: ${theme.hopeTrustBlueDarker};
  }
`;

export const LoginButton = styled(Button)`
  width: 100%;
`;
