import styled, { css } from "styled-components";
import { Row, Col } from "react-simple-flex-grid";
import { theme } from "./global-styles";
import media from "styled-media-query";
import { darken, lighten } from "polished";

export const Button = styled.button`
  background: ${theme.white};
  color: ${theme.buttonGreen};
  border-color: ${theme.buttonGreen};
  border-width: 2px;
  border-style: solid;
  padding: 10px 30px;
  border-radius: 30px;
  font-size: 15px;
  font-weight: 300;
  outline: 0;
  margin: 0 5px;
  cursor: pointer;
  transition: 0.3s ease;

  &:active {
    -webkit-box-shadow: inset 0px 2px 5px rgba(0,0,0,0.2);
    -moz-box-shadow: inset 0px 2px 5px rgba(0,0,0,0.2);
    box-shadow: inset 0px 2px 5px rgba(0,0,0,0.2);
  }

  ${(props) => props.small && css`
    padding: 4px 10px;
    font-size: 11px;
  `};

  ${(props) => props.small && props.outline && css`
    padding: 6px 10px;
    font-size: 11px;
  `};

  ${(props) => props.danger && css`
    background: ${darken(0.15, theme.errorRed)};
    color: ${theme.white};
    border-color: ${theme.errorRed};
  `};

  ${(props) => props.width && css`
    min-width: ${props.width}px;
    margin: auto;
  `};

  ${(props) => props.widthPercent && css`
    min-width: ${props.widthPercent}%;
    width: ${props.widthPercent}%;
    margin: auto;
  `};

  ${(props) => props.nomargin && css`
    margin: 0;
  `};

  ${(props) => props.margintop && css`
    margin-top: ${props.margintop}px;
  `};

  ${(props) => props.marginbottom && css`
    margin-bottom: ${props.marginbottom}px;
  `};

  ${(props) => props.marginright && css`
    margin-right: ${props.marginright}px;
  `};
  ${(props) => props.marginleft && css`
    margin-left: ${props.marginleft}px;
  `};

  ${(props) => props.blue && css`
    background: ${theme.hopeTrustBlue};
    color: ${theme.white};
    border-color: ${theme.hopeTrustBlue};
  `};

  ${(props) => props.green && css`
    background: ${theme.buttonGreen};
    color: ${theme.white};
    border-color: ${theme.buttonGreen};
  `};

  ${(props) => props.warning && css`
    background: ${theme.noticeYellow};
    color: ${theme.noticeYellowBackground};
    border-color: ${theme.noticeYellow};
  `};

  ${(props) => props.outline && css`
    ${(props) => props.danger && css`
      background: ${lighten(0.35, theme.errorRed)};
      color: ${theme.errorRed};
      border-width: 0px;
      box-shadow: 0 2px 3px rgba(0,0,0,0.1);
    `};
    ${(props) => props.green && css`
      background: ${lighten(0.55, theme.buttonGreen)};
      color: ${theme.buttonGreen};
      border-width: 0px;
      box-shadow: 0 2px 3px rgba(0,0,0,0.1);

      &:hover {
        background: rgba(0,0,0,0.04);
      }
    `};
    ${(props) => props.blue && css`
      background: ${lighten(0.6, theme.hopeTrustBlue)};
      color: ${theme.hopeTrustBlue};
      border-width: 0px;
      box-shadow: 0 2px 3px rgba(0,0,0,0.1);

      &:hover {
        background: rgba(0,0,0,0.04);
      }
    `};
    ${(props) => props.warning && css`
      background: ${lighten(0.07, theme.noticeYellow)};
      color: ${theme.noticeYellowBackground};
      border-width: 0px;
      box-shadow: 0 2px 3px rgba(0,0,0,0.1);
    `};
  `};

  ${(props) => props.rounded && css`
    border-radius: 30px;
  `};

  ${(props) => props.radius && css`
    border-radius: ${props.radius}px;
  `};

  ${(props) => props.disabled && css`
    color: ${theme.lineGrey};
    border: 1px solid ${theme.lineGrey};
    background: transparent;
    cursor: no-drop;
  `};

  ${(props) => props.float && css`
    float: ${props.float};
  `};

  ${media.lessThan("1025px")`
    ${(props) => !props.small && css`
      padding: 4px 19px;
      font-size: 11px;
    `};
  `}

  ${(props) => props.noshadow && css`
    box-shadow: none;
  `};

  ${(props) => props.nohover && css`

    ${(props) => props.blue && css`
      &:hover {
        background: ${lighten(0.6, theme.hopeTrustBlue)};
      }
    `}; 

    ${(props) => props.green && css`
      &:hover {
        background: ${lighten(0.55, theme.buttonGreen)};
      }
    `};

    ${(props) => props.danger && css`
      &:hover {
        background: ${lighten(0.35, theme.errorRed)};;
      }
    `};
  `}
`;

export const CardContainer = styled(Col)`
    position: relative;
    margin: auto;
`;

export const ViewContainer = styled.div`
  width: 100%;

  ${(props) => props.padding && css`
    padding: ${props.padding}px;
  `};
  ${(props) => props.paddingtop && css`
    padding-top: ${props.paddingtop}px;
  `};

  ${(props) => props.textalign && css`
    text-align: ${props.textalign};
  `};
`;

export const ContainerPadding = styled.div`
  ${(props) => props.padding && css`
    padding: ${props.padding}px;
  `};
`;

export const ContainerInner = styled.div`
  ${(props) => props.padding && css`
    padding: ${props.padding}px;
  `};
`;

export const Page = styled(Row)`
  width: 100%;
  padding-top: 40px
  padding-bottom: 40px
  padding-right: 15px
  padding-left: 15px
  justify-content: center;
  align-self: center;

  ${media.lessThan("1025px")`
    padding-bottom: 10px;
  `};

  ${(props) => props.padding && css`
    padding: ${props.padding}px;
  `};
  ${(props) => props.paddingtop && css`
    padding-top: ${props.paddingtop}px;
  `};
  ${(props) => props.paddingbottom && css`
    padding-bottom: ${props.paddingbottom}px;
  `};
  ${(props) => props.paddingleft && css`
    padding-left: ${props.paddingleft}px;
  `};
  ${(props) => props.paddingright && css`
    padding-left: ${props.paddingright}px;
  `};
`;

export const PageHeader = styled(Col)`
  font-size: 35px;
  align-self: center;
  color: ${theme.metadataGrey};
  font-weight: 400;
  padding-left: 2px;
  
  ${(props) => props.align && css`
    text-align: ${props.align}
  `};

  ${(props) => props.size && css`
    font-size: ${props.size}px;
  `};

  ${(props) => props.paddingleft && css`
    padding-left: ${props.paddingleft}px;
  `};

  ${(props) => props.paddingleftmobile && css`
    ${media.lessThan("1025px")`
      padding-left: ${props.paddingleftmobile}px;
    `}
  `};

  ${media.lessThan("1025px")`
    font-size: 25px;
  `};

  ${media.lessThan("small")`
    font-size: 20px;
  `};
`;

export const PageHeaderSecondary = styled.div`
  font-size:14px;
  padding: 10px 0 5px 0;
  ${(props) => props.paddingleft && css`
    padding-left: ${props.paddingleft}px;
  `};
`;

export const PageHeaderSecondaryNoticeIcon = styled.div`
  margin-right: 10px;
  display: inline-block;
`;

export const PageHeaderSecondaryNotice = styled.div`
  font-size: 14px;
  text-align: left;
  color: ${theme.metaDataGrey};
  font-weight: 400;
  padding: 15px;
  color: #856404;
  background-color: #fff3cd;
  border-color: #ffeeba;
  border-radius: 6px;
  display: inline-block;
  vertical-align: middle;
`;

export const PageAction = styled(Col)`
  ${(props) => props.align && css`
    text-align: ${props.align}
  `};

  ${media.lessThan("550px")`
    margin-bottom: 20px;
    margin-left: 8px;
  `};

  ${media.lessThan("1025px")`
    margin-top: 10px;
    margin-bottom: 20px;
  `};
`;

export const AuthenticationHeader = styled.div`
  width: 100%;
  max-width: 1280px;
  position: relative;
  margin: auto;
  padding-bottom: 20px;
`;

export const AuthenticationFooter = styled.footer`
  background-color: #fff;
  box-shadow: 0 4px 8px ${theme.boxShadowLight};
  bottom: 0;
  height: 75px;
  left: 0;
  margin: 0;
  position: fixed;
  right: 0;
  z-index: 1000;
  text-align: center;
  display: inline-flex;

  ${(props) => props.position && css`
    position: ${props.position};
  `}
`;

export const AuthenticationWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
`;

export const AuthenticationWrapperItem = styled.div`
  padding: 0 25px;
  width: 100%;
  
  ${(props) => props.maxWidth && css`
    max-width: ${props.maxWidth}px;
  `};
  ${media.lessThan("768px")`
    padding: 0 10px;
  `};
`;

export const AuthenticationWrapperItemInner = styled.div`
  background: #FFFFFF;
  box-shadow: ${theme.boxShadowDefault};
  border-radius: 8px;
  padding: 20px 10px 10px 10px;
  text-align: center;
  ${(props) => props.minHeight && css`
    max-height: ${props.minHeight}
  `};
`;

export const AuthenticationLogoContainer = styled.div`
  text-align: center;
  padding: 10px 20px;
`;

export const AuthenticationLogo = styled.img`
  width: 120px;
  padding-top: 20px;
`;

export const CheckBoxWrapper = styled.div`
  width: 100%;
  padding: 10px;
  align-items: center;
  text-align: left;
  overflow: hidden;
  box-sizing: border-box;
  background: ${theme.white};

  border-radius: 4px;
  border: 1px solid #EBEDEE;

  ${(props) => props.margintop && css`
    margin-top: ${props.margintop}px;
  `};
`;
export const CheckBoxLabel = styled.label`
  display: inline-block;
  align-self: center;
  font-size: 14px;
  font-weight: 400;
  display: block;
  padding-left: 15px;
  text-indent: -15px;

  ${media.lessThan("769px")`
    font-size: 13px;
  `};
`;
export const CheckBoxInput = styled.input`
  align-self: center;
  margin: 0;
  margin-right: 5px;
  width: 15px;
  height: 15px;
  padding: 0;
  vertical-align: bottom;
  position: relative;
  top: -1px;
`;

export const InputWrapper = styled.div`
  margin-bottom: 25px;
  padding: 5px;
  text-align: left;
  position:relative;

  ${(props) => props.paddingleft && css`
    padding-left: ${props.paddingleft}px;
  `};
  ${(props) => props.paddingtop && css`
    padding-top: ${props.paddingtop}px;
  `};
  ${(props) => props.marginbottom && css`
    margin-bottom: ${props.marginbottom}px;
  `}
  ${(props) => props.margintop && css`
    margin-top: ${props.margintop}px;
  `}
  ${(props) => props.width && css`
    width: ${props.width}%;
  `}
`;

export const SelectWrapper = styled.div`
  margin-bottom: 10px;
  padding: 5px;
  text-align: left;
`;

export const InputLabel = styled.label`
  color: ${theme.labelGrey};
  font-size: 11px;
  display: block;
  cursor: pointer;

  ${(props) => props.capitalize && css`
    text-transform: capitalize;
  `};

  ${(props) => props.error && css`
    color: ${theme.errorRed};
  `};

  ${(props) => props.marginbottom && css`
    margin-bottom: ${props.marginbottom}px;
  `}
  ${(props) => props.margintop && css`
    margin-top: ${props.margintop}px;
  `}
`;

export const Input = styled.input`
  border: none;
  border-bottom: 1px solid ${theme.lineGrey};
  color: ${theme.fontGrey};
  background-color: transparent;
  font-size: 14px;
  height: 40px;
  width: 100%;
  -webkit-transition: all .35s linear;
  transition: all .35s linear;
  box-sizing: border-box;
  outline: 0;

  ${(props) => props.missing && css`
    border-color: ${lighten(0.25, theme.errorRed)} !important;
    color: ${theme.errorRed} !important;

    ::placeholder,
    ::-webkit-input-placeholder {
      color: ${lighten(0.25, theme.errorRed)};
    }
    :-ms-input-placeholder {
      color: ${lighten(0.25, theme.errorRed)};
    }
  `};

  ${(props) => props.paddingright && css`
    padding-right: ${props.paddingright}px;
  `};
  ${(props) => props.paddingleft && css`
    padding-left: ${props.paddingleft}px;
  `};
  ${(props) => props.marginright && css`
    margin-right: ${props.marginright}px;
  `};
  ${(props) => props.marginleft && css`
    margin-left: ${props.marginleft}px;
  `};
  ${(props) => props.radius && css`
    border-radius: ${props.radius}px;
  `};
  ${(props) => props.width && css`
    width: ${props.width}px;
  `};

  &:disabled {
    background: ${theme.disabled};
    color: ${darken(0.55, theme.disabled)} !important;
    padding-left: 10px
    margin-top: 5px;
  }
`;

export const Select = styled.select`
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-color: transparent;
  border: none;
  border-bottom: 1px solid ${theme.lineGrey};
  border-radius: 0;
  color: ${theme.fontGrey};
  font-size: 12px;
  height: 30px;
  margin-top: 10px;
  outline: none;
  padding: 5px 0;
  position: relative;
  text-overflow: ellipsis;
  width: 100%;

  ${(props) => props.missing && css`
    border-color: ${lighten(0.25, theme.errorRed)};
    color: ${lighten(0.25, theme.errorRed)};
  `};

  ${(props) => props.right && css`
    margin-right: ${props.right}px;
  `};

  ${(props) => props.left && css`
    margin-left: ${props.left}px;
  `};

  ${(props) => props.width && css`
    max-width: ${props.width}px;
  `};

  &:disabled {
    background: ${theme.white};
    color: ${darken(0.55, theme.disabled)} !important;
    padding-left: 0;
    font-size: 12px;
  }
`;

export const SelectLabel = styled.label`
  overflow: hidden;   
  width: 100%;
  position: relative;
  display: block;
`;

export const TextArea = styled.textarea`
  border: none;
  border-bottom: 1px solid ${theme.lineGrey};
  color: ${theme.fontGrey};
  background-color: transparent;
  font-size: 14px;
  margin-top: 5px;
  width: 100%;
  -webkit-transition: all .35s linear;
  transition: all .35s linear;
  box-sizing: border-box;
  outline: 0;

  ${(props) => props.margintop && css`
    margin-top: ${props.margintop}px;
  `};
  ${(props) => props.paddingtop && css`
    padding-top: ${props.paddingtop}px;
  `};
`;

export const FormContainer = styled.form`

`;

export const InputError = styled.div`
  color: ${theme.errorRed};
  font-size: 11px;
  text-align: left;
  margin-left: 5px;
  display: inline-block;
`;
export const InputHint = styled.div`
  color: rgba(0,0,0,0.4);
  font-size: 11px;
  text-align: left;
  display: block;
  margin-top: 5px;
  line-height: 15px;

  ${(props) => props.margintop && css`
    margin-top: ${props.margintop}px;
  `};

  ${(props) => props.marginleft && css`
    margin-left: ${props.marginleft}px;
  `};

  ${(props) => props.error && css`
    color: ${theme.errorRed};
  `};

  ${(props) => props.success && css`
    color: ${theme.buttonLightGreen};
  `};

  ${(props) => props.warning && css`
    color: ${theme.notificationOrange};
  `};

  ${(props) => props.center && css`
    text-align: center;
  `};
`;

export const FormError = styled.div`
  color: ${theme.errorRed};
  font-size: 12px;
  width: 100%;
  padding: 5px 10px;
  text-align: center;

  ${(props) => props.align && css`
    text-align: ${props.align};
  `};
`;

export const FormSuccess = styled.div`
  color: ${theme.buttonGreen};
  font-size: 12px;
  width: 100%;
  padding: 10px 0;
  text-align: left;

  ${(props) => props.align && css`
    text-align: ${props.align};
  `};

  ${(props) => props.paddingbottom && css`
    padding-bottom: ${props.paddingbottom}px;
  `};

  ${(props) => props.paddingtop && css`
    padding-top: ${props.paddingtop}px;
  `};

   ${(props) => props.absolute && css`
    position: absolute;
  `};
`;

export const RequiredStar = styled.span`
  color: ${theme.errorRed};
  margin-right: 3px;
`;

export const Backdrop = styled.div`
  height: 100%;
  width: 100%;
  position: fixed;
  z-index: 9999999999999;
  display: none;
  background: rgba(0,0,0,0.75);

  ${(props) => props.show && css`
    display: block;
  `};
`;

export const DisabledOverlay = styled.div`
  height: 100%;
  width: 100%;
  position: absolute;
  z-index: 99;
  background: rgba(0,0,0,0.7);
  transition: 0.3s ease;
`;

export const HiddenMobile = styled.div`
    ${(props) => props.ellipsis && css`
      max-width: 90%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
  `};

  ${media.lessThan("769px")`
    display: none;
  `}
`;

export const HeavyFont = styled.span`
  font-weight: 600;
`;

export const HorizontalRule = styled.hr`
  width: 100%;
  height: 2px;
  display: block;
  background: ${theme.lineGrey};
  border: none;
  outline: 0;
  ${(props) => props.width && css`
    width: ${props.width}px;
  `}
  ${(props) => props.height && css`
    height: ${props.height}px;
  `}
`;

export const Error = styled(Col)`

`;
export const ErrorPadding = styled(Row)`

`;
export const ErrorInner = styled(Col)`

`;
export const ErrorInnerRow = styled(Row)`
  text-align: center;
  height: 200px;
  align-content: center;

  ${(props) => props.height && css`
    height: ${props.height}px;
  `}
`;
export const ErrorIcon = styled(Col)`
  font-size: 50px;
  padding: 10px;
  align-self: center;
  display: block;
  color: ${theme.buttonLightGreen};
`;
export const ErrorMessage = styled(Col)`
  font-size: 16px;
  padding: 10px;
  font-weight: 300;
  align-self: center;
  display: block;
`;
export const RevealPassword = styled.div`
  position: absolute;
  right: 10px;
  top: 35px;
  cursor: pointer;
`;

export const Link = styled.a`
  text-decoration: none;
  color: inherit;
`;
export const Hint = styled.div`
  text-align: left;
  width: 100%;
  color: ${theme.labelGrey};
  font-size: 12px;

  a {
    color: ${theme.hopeTrustBlueDarker};
  }

  ${(props) => props.textalign && css`
    text-align: ${props.textalign};
  `}

  ${(props) => props.paddingtop && css`
    padding-top: ${props.paddingtop}px;
  `}

  ${(props) => props.paddingleft && css`
    padding-left: ${props.paddingleft}px;
  `}
`;

export const SelectStyles = {
  border: "none",
  paddingLeft: 0,
  borderBottom: `1px solid ${theme.lineGrey}`,
  color: theme.fontGrey,
  backgroundColor: "transparent",
  fontSize: "14px",
  width: "100%",
  transition: "all .35s linear",
  boxSizing: "border-box",
  outline: 0,
  borderRadius: "1px !important",
};

export const Version = styled.div`
  font-size: 12px;
  color: ${theme.metadataGrey};
  padding: 10px;
`;