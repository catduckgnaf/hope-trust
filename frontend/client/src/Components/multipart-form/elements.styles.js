import styled, { css } from "styled-components";
import media from "styled-media-query";
import { theme } from "../../global-styles";
import { Button } from "../../global-components";

export const SidebarLogo = styled.img`
  height: 6rem;

  ${media.lessThan("medium")`
    height: 4.5rem;
    margin-bottom: 10px;
  `}
`;

export const SidebarTitle = styled.h1`
  margin: 0.5rem 0 0 0;
  font-family: "Merriweather", serif;
  font-size: 24px;

  ${media.greaterThan("medium")`
    display: none;
  `}
`;

export const SidebarProgress = styled.div`
  margin: 2.75rem 0;

  width: 9rem;
  height: 5px;
  border-bottom: 1px solid #D8D8D8;

  display: flex;
  justify-content: space-between;

  ${media.lessThan("medium")`
    margin: 1rem 0 0 0;
  `}
`;

export const ProgressLevel = styled.div`
  width: 9px;
  height: 9px;
  border-radius: 100%;
  border: 1px solid #D8D8D8;
  outline: 4px solid white;
  background-color: white;

  ${(props) => props.completed && css`
    background-color: #8cbb5e;
  `};
  ${(props) => props.current && css`
    background-color: #8cbb5e;
  `};
`;

export const SidebarBlackHeading = styled.h2`
  margin: 0;
  font-family: "Merriweather", serif;
  font-size: 44px;
  font-weight: bold
  line-height: 50px;
`;
export const SidebarHeading = styled.h2`
  margin: 0;
  font-family: "Merriweather", serif;
  font-size: 24px;
  font-weight: 300;
  line-height: 34px;
  word-break: break-word;
`;

export const SidebarSubheading = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 300;
  line-height: 28px;
`;

export const SlideTitle = styled.div`
  ${(props) => props.marginbottom && css`
    margin-bottom: ${props.marginbottom}px;
  `};
`;

export const SlideTitleButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;
  max-width: 75%;
  margin: auto;

  ${media.lessThan("650px")`
    flex-direction: column;
    max-width: 100%;
  `}
`;

export const SidebarParagraph = styled.p`
  margin: 0 auto;
  max-width: 16rem;
  width: 100%;
  line-height: 24px;
`;

export const Bold = styled.b`
  font-weight: 700;
`;

export const Semibold = styled.b`
  font-weight: 500;
`;

export const Italic = styled.i`
  font-weight: 500;
  font-size: 24px;
  font-style: italic;
`;

export const MobileMessage = styled.div`
  margin-top: 10px;
  display: inline-block;
  font-size: 12px;
  line-height: 20px;

  ${media.greaterThan("768px")`
    display: none;
  `}
`;

export const SidebarDivider = styled.hr`
  margin: 1.5rem auto;
  width: 5.75rem;
  border: 0.5px solid rgba(0, 0, 0, 0.5);
`;

/*
 */

export const MultipartFormTitle = styled.h1`
  margin: 0;
  font-size: 24px;
  font-family: "Merriweather", serif;

  ${media.lessThan("medium")`
    display: none;
  `}
`;

export const MultipartFormSubtitle = styled.h3`
  margin: 1rem auto 2rem auto;
  font-weight: normal;
  font-size: 16px;
  line-height: 24px;
  color: #136B9D;
  text-align: center;
  width: 80%;

  ${media.lessThan("medium")`
    display: block;
    font-size: 24px;
    margin: 1rem 0 1rem 0;
  `}
`;

export const MultipartFormSecondaryCTA = styled.a`
  position: absolute;
  top: 2.5rem;
  transition: 0.2s ease;
  font-size: 14px;
  color: #136B9D;
  border: 1px solid;
  padding: 10px;
  border-radius: 6px;
  text-decoration: none;

  &:hover {
    cursor: pointer;
    background: #136B9D;
    color: white;
  }

  ${(props) => props.position && css`
    ${props.position}: 3rem;
  `};

  ${media.lessThan("medium")`
    position: initial;
    text-align: center;
  `}
`;

export const MultipartFormForm = styled.form`
  margin-top: 2rem;
  height: 100%;

  display: flex;
  flex-direction: column;

  ${media.lessThan("medium")`
    margin-top: 1rem;
  `}
`;

export const FormGroup = styled.div`
  display: flex;

  ${MultipartFormForm} > &:last-of-type {
    flex-grow: 1;
  }
`;

export const FormInputGroup = styled.div`
  width: 100%;
  position: relative;

  ${MultipartFormForm} > &:last-of-type {
    flex-grow: 1;
  }

  ${FormGroup} &:not(:first-child) {
    margin-left: 0.75rem;
  }

  ${(props) => props.top && css`
    margin-top: ${props.top}px;
  `};
`;

export const FormLabel = styled.label`
  margin: 1.5rem 0 0.5rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;

  ${media.lessThan("medium")`
    flex-direction: column;
    align-items: start;
  `};

  ${media.lessThan("small")`
    font-size: 12px;
  `};

  ${(props) => props.required && css`
    justify-content: start;

    &::before {
      content: "*";
      color: red;
      margin-right: 5px;
      text-align: right;
      font-size: 11px;
    }
  `};
`;

export const FormCheckboxLabel = styled.label`
  
`;

export const FormCheckboxLabelText = styled.span`
  vertical-align: middle;
  margin-left: 10px;
  font-size: 13px;

  ${(props) => props.error && css`
    color: ${theme.errorRed};
  `};
`;

export const LabelHint = styled.span`
  text-align: right;
  font-size: 13px;
  color: #95A0B0;
  flex: auto;

  ${media.lessThan("medium")`
    margin-top: 0.5rem;
  `}

  ${(props) => props.error && css`
    color: ${theme.errorRed};
  `};

  ${(props) => props.success && css`
    color: ${theme.buttonLightGreen};
  `};
`;

export const FormButton = styled.button`
  font-weight: bold;
  max-width: 300px;
  min-width: 200px;
  padding: 0.75rem 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:disabled {
    background-color: #ebeef2;
    color: #676f7a;
    cursor: not-allowed;
  }

  ${(props) => props.primary && css`
    padding: 0.75rem 3.75rem;
    background-color: #136B9D;
    color: white;
  `};

  ${(props) => props.secondary && css`
    background-color: transparent;
    color: #2E395A;
    border: 1px solid rgba(0,0,0,0.1);
  `};

  ${(props) => props.pulse && css`
    animation: pulsepsuedo 2s infinite;
    animation-delay: 5s;
  `};

  ${media.lessThan("medium")`
    margin-top: 0.25rem;
  `}
`;

export const InputAppendageButton = styled(Button)`
  position: absolute;
  top: 29px;
  right: 10px;

  ${media.lessThan("medium")`
    position: relative !important;
    top: auto !important;
    right: auto !important;
  `}
`;

export const SlideComponentTitle = styled.div`
  text-align: center;
  width: 100%;
  font-size: 16px;
  position: relative;
  margin: auto;
  line-height: 25px;
  font-weight: 400;
`;

export const SlideComponentSubtitle = styled.div`
  text-align: center;
  width: 100%;
  font-size: 13px;
  margin-top: 15px;
  font-weight: 300;
`;