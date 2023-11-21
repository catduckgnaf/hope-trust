import styled, { css } from "styled-components";
import { theme } from "../../global-styles";
import media from "styled-media-query";

export const RequestButtonMain = styled.div`
  width: 20%;
  display: flex;

  ${media.between("medium", "large")`
    width: 50%;
  `}

  ${media.lessThan("1171px")`
    width: 50%;
  `}

  &:last-child {
    ${media.lessThan("1171px")`
      width: 100%;
    `}
  }
`;

export const RequestButtonPadding = styled.div`
  padding: 10px
  width: 100%;
`;

export const RequestButtonInner = styled.div`
  width: 100%;
  display: inline-flex;
  min-height: 100px;
  text-align: center;
  color: ${theme.white};
  font-size: 14px;
  font-weight: 500;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: normal;
  text-align: center;
  flex-direction: column;
  padding: 10px;
  border-radius: 8px;
  box-shadow: ${theme.boxShadowDefault};
  justify-content: center;
  cursor: pointer;

  ${(props) => props.type === "money" && css`
    background: ${theme.moneyRequestColor};
  `};

  ${(props) => props.type === "medical" && css`
    background: ${theme.medicalRequestColor};
  `};

  ${(props) => props.type === "food" && css`
    background: ${theme.foodRequestColor};
  `};

  ${(props) => props.type === "transportation" && css`
    background: ${theme.transportationRequestColor};
  `};

  ${(props) => props.type === "other_request_type" && css`
    background: ${theme.otherRequestColor};
  `};

  ${(props) => props.disabled && css`
    background: ${theme.lineGrey};
    cursor: no-drop;
  `};
`;

export const RequestButtonIcon = styled.div`
  width: 100%;
  font-size: 40px;
  padding: 10px 0
`;

export const RequestButtonText = styled.div`
  width: 100%;

  ${media.lessThan("small")`
    font-size: 11px;
  `}
`;
