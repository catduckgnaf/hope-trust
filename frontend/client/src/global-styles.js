import { createGlobalStyle } from "styled-components";
import { lighten, darken } from "polished";
const current_theme = "light"; //localStorage.getItem("theme") || "light";
const themes = {
  dark: {},
  light: {
    backgroundGrey: "#F5F6FA",
    buttonGreen: "#529134",
    buttonLightGreen: "#8cbb5e",
    rowGrey: "#EDEEF1",
    disabled: "#EEEEEE",
    hopeTrustBlueLink: "#0e5381",
    hopeTrustBlue: "#136B9D",
    hopeTrustBlueDarker: "#2a6384",
    activeTextGrey: "#343D46",
    lineGrey: "#DCDBDB",
    lightGrey: "rgba(0,0,0,0.1)",
    labelGrey: "#9d9b9b",
    notificationYellow: "#FFD700",
    noticeYellow: "#856404",
    noticeYellowBackground: "#fff3cd",
    notificationOrange: "#ff7029",
    metadataGrey: "#717171",
    white: "#FFFFFF",
    black: "#000000",
    pink: "#B8207E",
    purple: "#6320B8",
    success: "rgb(40, 167, 69)",
    neutral_blue: "rgb(0, 123, 255)",
    fontGrey: "#4A4A4A",
    red: "#8B0000",
    errorRed: "#F44337",
    boxShadowLight: "rgba(0, 0, 0, 0.1)",
    boxShadowHover: "rgba(0, 0, 0, 0.2)",
    boxShadowDefault: "0 4px 6px rgba(50,50,93,.06), 0 1px 3px rgba(0,0,0,.05)",
    defaultFont: "Roboto,sans-serif",
    defaultBorderRadius: "6px",

    moneyRequestColor: "#32e08d",
    medicalRequestColor: "#6d61a5",
    foodRequestColor: "#9d9ff3",
    transportationRequestColor: "rgba(111, 184, 252, 0.99)",
    otherRequestColor: "#ff7029",

    moneyRequest: "linear-gradient(to top, #32e08d, #43ce8c -17%)",
    medicalRequest: "linear-gradient(to top, #6d61a5, #443890 33%)",
    foodRequest: "linear-gradient(to top, #9d9ff3, #8284e5 33%)",
    transportationRequest: "linear-gradient(to bottom, rgba(111, 184, 252, 0.99), #82c2fd)",
    otherRequest: "linear-gradient(to bottom, #ff7029, #f37c7e)"
  }
};

export const theme = themes[current_theme];

export const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Ephesis&display=swap');
  @import url("https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,400;0,700;1,400&display=swap");
  @import url("https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400&family=Noto+Sans:ital,wght@0,400;0,700;1,400&display=swap");


  * {
    -webkit-overflow-scrolling: touch;
    box-sizing: border-box;
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }

  /* Hide scrollbar for Chrome, Safari and Opera */
  *::-webkit-scrollbar {
    display: none;
  }

  html {
    scroll-behavior: smooth;
  }

  .chat_open #hubspot-messages-iframe-container {
    display: none !important;
  }

  body, html {
    background: ${theme.backgroundGrey};
    color: ${theme.activeTextGrey};
    font-family: ${theme.defaultFont};
    height: 100%;
    margin: 0;
    padding: 0;
    position: relative;
  }

  #root {
    display: -webkit-flex;
    display: flex;
    -webkit-flex-direction: column;
    flex-direction: column;
    height: 100%;
  }

  ::-webkit-input-placeholder { /* Chrome/Opera/Safari */
    color: ${darken(0.09, theme.lineGrey)};
    font-weight: 300;
    font-size: 13px;
  }
  ::-moz-placeholder { /* Firefox 19+ */
    color: ${darken(0.09, theme.lineGrey)};
    font-weight: 300;
    font-size: 13px;
  }
  :-ms-input-placeholder { /* IE 10+ */
    color: ${darken(0.09, theme.lineGrey)};
    font-weight: 300;
    font-size: 13px;
  }
  :-moz-placeholder { /* Firefox 18- */
    color: ${darken(0.09, theme.lineGrey)};
    font-weight: 300;
    font-size: 13px;
  }

  .time-choose .react-datepicker__time-container {
    width: 200px !important;
  }

  input[type="text"] {
    -webkit-appearance: textfield;
  }

  .ap-input:active {
    border-radius: 1px !important;
  }

  .ap-input:focus {
    border-radius: 1px !important;
  }

  a {
    -webkit-tap-highlight-color: transparent;
    text-decoration: none;
  }

  span[mode] {
    display: block !important;
  }

  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  input:-webkit-autofill:active  {
      -webkit-box-shadow: 0 0 0 30px white inset !important;
  }

  .table_button_icon {
    opacity: 0.6;
  }

  .table_button_icon:hover {
    transform: scale(0.95);
    opacity: 1;
  }

  select {
    background: url("data:image/svg+xml,<svg height='10px' width='10px' viewBox='0 0 16 16' fill='lightgrey' xmlns='http://www.w3.org/2000/svg'><path d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/></svg>") no-repeat;
    background-position: calc(100% - 0.75rem) center !important;
    -moz-appearance:none !important;
    -webkit-appearance: none !important; 
    appearance: none !important;
    padding-right: 2rem !important;
  }

  select:disabled {
    background: ${theme.rowGrey};
    color: ${darken(0.2, theme.lineGrey)} !important;
    padding-left: 10px;
    boarder-radius: 4px;
    cursor: no-drop;
    font-weight: 300;
    font-size: 13px;
  }

  input:disabled {
    color: ${darken(0.2, theme.lineGrey)} !important;
    cursor: no-drop;
    font-weight: 300;
    font-size: 13px;
  }

  input[type="text"]:read-only, input[type="password"]:read-only, input[type="search"]:read-only, input[type="tel"]:read-only, input[type="email"]:read-only {
    color: ${darken(0.2, theme.lineGrey)} !important;
    cursor: no-drop;
    font-weight: 300;
    font-size: 13px;
  }

  input:invalid {
    box-shadow: none !important;
  }

  button {
    outline: none;
  }

  *, :after, :before {
    font-weight: 400;
    margin: 0;
    padding: 0;
  }

  .react-datepicker-popper {
    z-index: 2000 !important;
  }

  .rrt-confirm-holder {
    z-index: 2147483647 !important;
  }

  .disabled .rangeslider__label-item {
    color: rgba(0,0,0,0.3) !important;
    cursor: no-drop !important;
  }

  .disabled .rangeslider__handle {
    background: ${theme.lineGrey} !important;
    cursor: no-drop !important;
  }
  .disabled .rangeslider__handle:after {
    background: ${theme.lineGrey} !important;
  }

  .rangeslider-horizontal .rangeslider__fill {
    background-color: ${theme.buttonLightGreen} !important;
  }

  .rangeslider-horizontal.disabled .rangeslider__fill {
    background-color: ${theme.lineGrey} !important;
    cursor: no-drop !important;
  }

  .rangeslider__label-item {
    font-size: 13px !important;
    font-weight: 300;
    text-transform: capitalize;
    top: 15px !important;
  }

  .rangeslider__fill {
    transition: 0.3s ease;
    cursor: pointer;
  }

  .rangeslider__handle {
    transition: 0.3s ease;
  }

  .rrt-confirm-holder .rrt-confirm .rrt-message {
    white-space: pre-line;
  }

  .top-left, .top-right, .top-center, .bottom-left, .bottom-right, .bottom-center {
    z-index: 2147483648 !important;
  }

  .ap-input, .ap-hint {
    border: none;
    padding-left: 0;
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
    border-radius: 1px !important;
  }

  .ap-input[name="signup_address"]{
    display: block;
    width: 100%;
    height: 2.75rem;
    padding: 0 0.5rem;
    border-radius: 4px;
    border: 1px solid #EBEDEE;
    background: ${theme.white};
  }

  .ap-input:active {
    border-radius: 1px !important;
  }

  .ap-input:focus {
    border-radius: 1px !important;
  }

  .ap-input.missing {
    border-color: ${lighten(0.25, theme.errorRed)};
  }
  .ap-input.missing::placeholder, .ap-input.missing::-webkit-input-placeholder {
    color: ${lighten(0.25, theme.errorRed)};
  }
  .ap-input.missing:-ms-input-placeholder {
    color: ${lighten(0.25, theme.errorRed)};
  }

  .react-datepicker-wrapper {
    width: 100%;
  }

  .sb-avatar img {
    background-size: cover;
    background-position: top center;
    object-fit: inherit;
    box-shadow: 0 4px 3px rgba(0,0,0,0.3);
    background: ${theme.white};
  }

  .sb-avatar__text {
    box-shadow: 0 2px 2px rgba(0,0,0,0.3);
  }

  .survey_avatar img, .survey_avatar .sb-avatar__text {
    border: 2px solid ${theme.white};
    vertical-align: middle;
  }

  .user-single-avatar .sb-avatar__text, .user-single-avatar img {
    border: 3px solid ${theme.white};
  }

  #pdf_container {
    margin: 0;
    font-family: TimesNewRoman !important;
    overflow: hidden;
    width: 100%;
    color: #000;
  }

  #pdf_container strong {
    font-weight: 600;
  }
  
  #pdf_container h1 {
    line-height: 25px;
    margin: 15px 0;
    font-size: 25px;
  }

  #pdf_container h2 {
    line-height: 25px;
    margin: 15px 0;
  }

  #pdf_container h3 {
    margin: 15px 0;
    line-height: 12pt;
  }

  #pdf_container h4 {
    margin: 15px 0;
    line-height: 12pt;
  }
    
  #pdf_container h6 {
    page-break-before: always;
    color: white;
    opacity: 0;
    margin: 0;
    padding: 0;
    font-size: 1px;
  }

  #pdf_container p {
    margin: 15px 0;
    line-height: 25px;
    word-wrap: break-word;
    white-space: normal;
  }

  #pdf_container ul {
    padding: 0 35px;
  }

  #pdf_container ul li {
    padding-left: 0px;
    list-style: disc;
    line-height: 25px;
    margin-top: 10px;
  }

  #pdf_container ol {
    padding: 0 35px;
  }

  #pdf_container ol li {
    padding-left: 0px;
    line-height: 25px;
    margin-top: 10px;
  }

  #pdf_container ol li p {
    padding: 0;
    margin: 0;
  }

  #pdf_container img {
    width: 100%;
  }

  #pdf_container ul li p {
    padding: 0;
    margin: 0;
  }

  #pdf_container hr {
    margin: 10px 0 20px 0;
  }

  #pdf_container table {
    width: 100%;
    border: none
    margin: 0;
  }

  #pdf_container img[alt="NCA_LETTERHEAD_IMAGE_ID"]{
    width: 120px;
    position: relative;
    margin: auto;
    text-align: left;
  }

  #pdf_container ::marker {
    font-weight: bold;
  }

  #pdf_container .nca_section, #pdf_container .section {
    padding: 0 20px 0 20px;
    background: ${theme.white};
  }

  #pdf_container .section div:empty { display: none }
  #pdf_container .section p:empty { display: none }
  #pdf_container .section h4:empty { display: none }
  #pdf_container .section h3:empty { display: none }
  #pdf_container .section h4:empty { display: none }

#marketing iframe, #training iframe {
  min-height: 500px;
}
@media only screen and (max-width: 500px) {
  .react-responsive-modal-modal {
    max-width: 100% !important;
  }
}

.hidden_uid {
  display: none;
}

iframe[name="us-entrypoint-button"] {
  z-index: 2147483645 !important;
}

.Select-menu-outer {
  z-index: 999 !important;
}

.react-joyride__overlay, .__floater__open {
  z-index: 9999999 !important;
}

.react-joyride__tooltip h4 {
  border-bottom: 1px solid rgba(0,0,0,0.1);
  padding-bottom: 15px;
}

.heading_align_center {
  text-align: center;
  font-weight: bold;
  text-transform: capitalize;
}

h3.heading_bold {
  font-weight: 500;
  text-transform: capitalize;
}

.heading_bold {
  font-weight: bold;
  text-transform: capitalize;
}

.horizontal_rule {
  color: white;
  opacity: 0;
  margin: 0;
  padding: 0;
  font-size: 1px;
}

.x-hellosign-embedded--in-modal {
  height: 100% !important;
  z-index: 2147483646 !important;
}

.x-hellosign-embedded__modal-screen::before {
  content: "WARNING: DO NOT REFRESH THIS PAGE";
  width: 100%;
  text-align: center;
  padding: 10px;
  z-index: 100;
  background: #FFF;
  display: flex;
  color: RED;
  position: relative;
  margin: auto;
}

.password-protected-environment ._3GnVl {
  background-color: ${theme.backgroundGrey};
}

.password-protected-environment ._37_FJ {
  width: 300px;
  overflow: hidden;
  z-index: 1;
  left: 50%;
  top: 50%;
  transform: translate(-50%,-50%);
  border: none;
  border-radius: 5px;
  box-shadow: 0 4px 3px rgba(0,0,0,0.3);
  max-width: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: stretch;
  align-content: center;
  background-color: #fff;
  color: #000;
}

.password-protected-environment ._ovIFV {
  background-color: ${theme.hopeTrustBlue};
  color: ${theme.white};
  font-size: 13px;
  text-align: center;
}

.password-protected-environment ._37_FJ input {
  border: none;
  padding-left: 0;
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
  border-radius: 0;
}

.password-protected-environment ._1YwH3 button {
  background: ${theme.white};
  color: ${theme.hopeTrustBlue};
  border-color: ${theme.hopeTrustBlue};
  border-width: 2px;
  border-style: solid;
  border-radius: 30px;
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 300;
  outline: 0;
  margin: 0 5px;
  cursor: pointer;
  transition: 0.3s ease;
}

.ht__menu {
  z-index: 99999999 !important;
}

.ht__group .collapsed {
  height: 0;
  overflow: hidden;
  transition: 1s ease;
}

.react-responsive-modal-closeButton {
  z-index: 101;
}

.pin-field-container {
  display: grid;
  grid-auto-columns: max-content;
  grid-auto-flow: column;
  justify-content: center;
  margin: 0 0 4rem 0;
}

.pin-field {
  background-color: rgb(248, 249, 250);
  border: 1px solid rgb(204, 204, 204);
  border-radius: 0.3rem;
  font-size: 2rem;
  margin: 0.25rem;
  height: 3.5rem;
  outline: none;
  text-align: center;
  transition-duration: 250ms;
  transition-property: background, color, border, box-shadow, transform;
  width: 3rem;

  &:focus {
    border-color: rgb(0, 123, 255);
    outline: none;
    transform: scale(1.05);
  }

  &:invalid {
    animation: shake 3 linear 75ms;
    border-color: rgb(220, 53, 69);
    box-shadow: 0 0 0.25rem rgba(220, 53, 69, 0.5);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}

/* Chrome, Safari, Edge, Opera */
input.pin-field::-webkit-outer-spin-button,
input.pin-field::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input.pin-field[type=number] {
  -moz-appearance: textfield;
}

swd-pin-field[completed] .pin-field {
  border-color: rgb(40, 167, 69);
  background-color: rgba(40, 167, 69, 0.1);
}

[data-tooltip][data-tooltip-content] {
	 position: relative;
}
 [data-tooltip][data-tooltip-content]::before, [data-tooltip][data-tooltip-content]::after {
	 left: 50%;
	 opacity: 0;
	 position: absolute;
	 top: calc(100% + 0.5rem);
	 transition: opacity 0.15s ease-in-out, visibility 0s 0.15s ease-in-out;
	 visibility: hidden;
}
 [data-tooltip][data-tooltip-content]::before {
	 border-bottom: 8px solid ${theme.hopeTrustBlue};
	 border-left: 8px solid transparent;
	 border-right: 8px solid transparent;
	 content: '';
	 height: 0;
	 transform: translateX(-50%) translateY(calc(-100% + 1px));
	 width: 0;
	 z-index: 1;
}
 [data-tooltip][data-tooltip-content]::after {
	 background-color: ${theme.hopeTrustBlue};
	 border-radius: 5px;
	 color: ${theme.white};
	 content: attr(data-tooltip-content);
	 font-size: 0.7rem;
	 font-weight: 400;
	 padding: 10px 0.75em;
	 transform: translate3d(-50%, 0, 0);
   white-space: pre-wrap;
	 z-index: 1;
   line-height: 15px;
   max-width: 200px;
   width: max-content;
}
[data-tooltip][data-tooltip-content].tooltip.error::before {
  border-bottom: 8px solid ${theme.errorRed};
}
[data-tooltip][data-tooltip-content].tooltip.error::after {
  background-color: ${theme.errorRed};
}
[data-tooltip][data-tooltip-content].tooltip.neutral::before {
  border-bottom: 8px solid ${theme.hopeTrustBlue};
}
[data-tooltip][data-tooltip-content].tooltip.neutral::after {
  background-color: ${theme.hopeTrustBlue};
}
[data-tooltip][data-tooltip-content].tooltip.disabled::before {
  border-bottom: 8px solid ${theme.labelGrey};
}
[data-tooltip][data-tooltip-content].tooltip.disabled::after {
  background-color: ${theme.labelGrey};
}
[data-tooltip][data-tooltip-content].tooltip.success::before {
  border-bottom: 8px solid ${theme.success};
}
[data-tooltip][data-tooltip-content].tooltip.success::after {
  background-color: ${theme.success};
}
 [data-tooltip][data-tooltip-content]:hover::before, [data-tooltip][data-tooltip-content]:focus::before, [data-tooltip][data-tooltip-content]:hover::after, [data-tooltip][data-tooltip-content]:focus::after {
	 opacity: 1;
	 transition: opacity 0.15s ease-in-out;
	 visibility: visible;
}
 [data-tooltip][data-tooltip-content][data-tooltip-position="top"]::before, [data-tooltip][data-tooltip-content][data-tooltip-position="top"]::after {
	 bottom: calc(100% + 0.8rem);
	 top: auto;
}
 [data-tooltip][data-tooltip-content][data-tooltip-position="top"]::before {
	 transform: translateX(-50%) translateY(calc(100% - 1px)) rotateZ(180deg);
}
 [data-tooltip][data-tooltip-content][data-tooltip-position="left"]::before, [data-tooltip][data-tooltip-content][data-tooltip-position="left"]::after {
	 left: 0;
	 top: 50%;
}
 [data-tooltip][data-tooltip-content][data-tooltip-position="left"]::before {
	 transform: translateX(calc(-100% - 1px)) translateY(-50%) rotateZ(90deg);
}
 [data-tooltip][data-tooltip-content][data-tooltip-position="left"]::after {
	 transform: translateX(calc(-100% - 1rem + 4px)) translateY(-50%);
}
 [data-tooltip][data-tooltip-content][data-tooltip-position="right"]::before, [data-tooltip][data-tooltip-content][data-tooltip-position="right"]::after {
	 left: auto;
	 right: 0;
	 top: 50%;
}
 [data-tooltip][data-tooltip-content][data-tooltip-position="right"]::before {
	 transform: translateX(calc(100% + 5px)) translateY(-50%) rotateZ(270deg);
}
 [data-tooltip][data-tooltip-content][data-tooltip-position="right"]::after {
	 transform: translateX(calc(100% + 1rem)) translateY(-50%);
}
 @media (hover: none) {
	 [data-tooltip][data-tooltip-content]::before, [data-tooltip][data-tooltip-content]::after {
		 content: none;
	}
}
 

@-moz-keyframes shake {
  from {
    transform: scale(1.05) translateY(-5%);
  }
  to {
    transform: scale(1.05) translateY(5%);
  }
}

@-webkit-keyframes shake {
  from {
    transform: scale(1.05) translateY(-5%);
  }
  to {
    transform: scale(1.05) translateY(5%);
  }
}

@-o-keyframes shake {
  from {
    transform: scale(1.05) translateY(-5%);
  }
  to {
    transform: scale(1.05) translateY(5%);
  }
}

@keyframes shake {
  from {
    transform: scale(1.05) translateY(-5%);
  }
  to {
    transform: scale(1.05) translateY(5%);
  }
}

@-moz-keyframes shimmer {
		0% {
				background-position: top left;
		}
		100% {
				background-position: top right;
		}
}

@-webkit-keyframes shimmer {
		0% {
				background-position: top left;
		}
		100% {
				background-position: top right;
		}
}

@-o-keyframes shimmer {
		0% {
				background-position: top left;
		}
		100% {
				background-position: top right;
		}
}

@keyframes shimmer {
		0% {
				background-position: top left;
		}
		100% {
				background-position: top right;
		}
}

@-moz-keyframes pulse-green {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 ${lighten(0.3, theme.buttonGreen)};
  }
  
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px ${lighten(1, theme.buttonGreen)};
  }
  
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 ${lighten(1, theme.buttonGreen)};
  }
}
@-webkit-keyframes pulse-green {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 ${lighten(0.3, theme.buttonGreen)};
  }
  
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px ${lighten(1, theme.buttonGreen)};
  }
  
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 ${lighten(1, theme.buttonGreen)};
  }
}
@-o-keyframes pulse-green {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 ${lighten(0.3, theme.buttonGreen)};
  }
  
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px ${lighten(1, theme.buttonGreen)};
  }
  
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 ${lighten(1, theme.buttonGreen)};
  }
}
@keyframes pulse-green {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 ${lighten(0.3, theme.buttonGreen)};
  }
  
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px ${lighten(1, theme.buttonGreen)};
  }
  
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 ${lighten(1, theme.buttonGreen)};
  }
}

@-moz-keyframes pulse-blue {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 ${lighten(0.1, theme.transportationRequestColor)};
  }
  
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px ${lighten(1, theme.transportationRequestColor)};
  }
  
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 ${lighten(1, theme.transportationRequestColor)};
  }
}
@-webkit-keyframes pulse-blue {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 ${lighten(0.1, theme.transportationRequestColor)};
  }
  
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px ${lighten(1, theme.transportationRequestColor)};
  }
  
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 ${lighten(1, theme.transportationRequestColor)};
  }
}
@-o-keyframes pulse-blue {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 ${lighten(0.1, theme.transportationRequestColor)};
  }
  
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px ${lighten(1, theme.transportationRequestColor)};
  }
  
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 ${lighten(1, theme.transportationRequestColor)};
  }
}
@keyframes pulse-blue {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 ${lighten(0.1, theme.transportationRequestColor)};
  }
  
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px ${lighten(1, theme.transportationRequestColor)};
  }
  
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 ${lighten(1, theme.transportationRequestColor)};
  }
}

@-moz-keyframes pulse-red {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 ${lighten(0.3, theme.errorRed)};
  }
  
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px ${lighten(1, theme.errorRed)};
  }
  
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 ${lighten(1, theme.errorRed)};
  }
}
@-webkit-keyframes pulse-red {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 ${lighten(0.3, theme.errorRed)};
  }
  
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px ${lighten(1, theme.errorRed)};
  }
  
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 ${lighten(1, theme.errorRed)};
  }
}
@-o-keyframes pulse-red {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 ${lighten(0.3, theme.errorRed)};
  }
  
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px ${lighten(1, theme.errorRed)};
  }
  
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 ${lighten(1, theme.errorRed)};
  }
}
@keyframes pulse-red {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 ${lighten(0.3, theme.errorRed)};
  }
  
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px ${lighten(1, theme.errorRed)};
  }
  
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 ${lighten(1, theme.errorRed)};
  }
}

@-moz-keyframes pulse-orange {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 ${lighten(0.3, theme.notificationOrange)};
  }
  
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px ${lighten(1, theme.notificationOrange)};
  }
  
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 ${lighten(1, theme.notificationOrange)};
  }
}
@-webkit-keyframes pulse-orange {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 ${lighten(0.3, theme.notificationOrange)};
  }
  
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px ${lighten(1, theme.notificationOrange)};
  }
  
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 ${lighten(1, theme.notificationOrange)};
  }
}
@-o-keyframes pulse-orange {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 ${lighten(0.3, theme.notificationOrange)};
  }
  
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px ${lighten(1, theme.notificationOrange)};
  }
  
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 ${lighten(1, theme.notificationOrange)};
  }
}
@keyframes pulse-orange {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 ${lighten(0.3, theme.notificationOrange)};
  }
  
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px ${lighten(1, theme.notificationOrange)};
  }
  
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 ${lighten(1, theme.notificationOrange)};
  }
}

.react-datepicker__current-month.react-datepicker__current-month--hasYearDropdown.react-datepicker__current-month--hasMonthDropdown {
  display: none;
}

.react-datepicker__header__dropdown.react-datepicker__header__dropdown--select {
  select {
    background-color: transparent;
    border: none;
    border-bottom: 1px solid #DCDBDB;
    border-radius: 0;
    color: #4A4A4A;
    font-size: 13px;
    height: 30px;
    outline: none;
    padding: 5px 0;
    position: relative;
    text-overflow: ellipsis;
    width: 100%;
  }
}
`;
