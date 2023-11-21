import styled, { css } from "styled-components";
import { theme } from "../../global-styles";
import { Row, Col } from "react-simple-flex-grid";

export const WidgetLoaderMain = styled(Col)`
  
`;

export const WidgetLoaderPadding = styled.div`
  padding: 10px;
`;

export const WidgetLoaderInner = styled(Row)`
  color: ${theme.buttonGreen};
  cursor: pointer;
  padding: 20px 15px;
  background: ${theme.white};
  min-height: 90px;
  border-radius: 4px;

  ${(props) => props.height && css`
    height: ${props.height}px;
  `};

  ${(props) => props.shadow && css`
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);

    &:hover {
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
  `};
`;

export const WidgetLoaderIcon = styled(Col)`
  color: ${theme.buttonGreen};
  font-size: 25px;
  text-align: center;
  align-self: center;

  ${(props) => props.error && css`
    color: ${theme.errorRed};
  `};

  ${(props) => props.warning && css`
    color: ${theme.notificationOrange};
  `};
`;

export const WidgetLoaderTitle = styled(Col)`
  color: ${theme.buttonGreen};
  text-align: center;
  align-self: center;
  font-weight: 300;
  font-size: 13px;

  ${(props) => props.error && css`
    color: ${theme.errorRed};
  `};

  ${(props) => props.warning && css`
    color: ${theme.notificationOrange};
  `};
`;