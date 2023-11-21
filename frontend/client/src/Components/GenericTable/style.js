import styled, { css } from "styled-components";
import { Row, Col } from "react-simple-flex-grid";
import { theme } from "../../global-styles";
import media from "styled-media-query";
import {
  InputWrapper,
  InputLabel,
  Input,
  Button
} from "../../global-components";
import { lighten } from "polished";

export const TableMain = styled.div`
  background: #FFF;
  border-radius: 8px;
  display: inline-block;
  width: 100%;

  .ka-loading {
    background-color: rgba(255,255,255,0.65);
  }

  .export-csv-button {
    text-decoration: none;
    border-bottom: 1px dotted;
    color: ${theme.hopeTrustBlueLink};
  }

  .ka-table {
    border-collapse: collapse;

    .ka-cell.editable:hover {
      box-shadow: ${theme.lineGrey} 0px 0px 0px 1px inset;
      transition: box-shadow 0.1s ease-in 0s;
      border-radius: 2px;
    }

    .ka-thead-cell-content {
      width: 100%;
      overflow: hidden;
      white-space: pre;
      text-overflow: ellipsis;
    }
  }

  input[type="date"] {
    display: flex;
    flex-flow: row-reverse;
    padding: 8px;
    height: auto;
  }
  input[type="date"]::-webkit-calendar-picker-indicator {
    cursor: pointer;
  }
  input::-webkit-datetime-edit {
    position: relative;
    left: 10px;
  }

  .column_settings {
    height: 0;

    &.active {
      height: auto;
    }
  }
  ${media.lessThan("768px")`
    .column_settings {
      .ka-cell {
        width: 50% !important;
        display: inline-block !important;
        padding-left: 10px !important;
      }
    }
    .ka-table { 
      width: 100%;
      display: block;

      .ka-thead, .ka-tbody, .ka-thead-cell, .ka-cell, .ka-tr { 
        display: block; 
      }
      
      .ka-thead {
        .ka-tr { 
          position: absolute;
          top: -9999px;
          left: -9999px;
        }
      }

      .ka-row {
        border-bottom: 10px solid #F9FBFC;
        border-top: 10px solid #F9FBFC;
      }
      
      .ka-cell {
        border: none;
        border-bottom: 1px solid #eee; 
        position: relative;
        padding-left: 30%; 
        &::before { 
          position: absolute;
          top: 6px;
          left: 6px;
          width: 20%; 
          padding-right: 10px; 
          white-space: nowrap;
          content: attr(data-column);
          color: #000;
          font-weight: bold;
        }
      }
    }
  `};

  ${(props) => props.width && css`
    width: ${props.width};
  `};
`;

export const TableHeader = styled.div`
  width: 100%;
  position: sticky;
  top: 0;
  background: #FFF;
  z-index: 1;
`;

export const TableHeaderPadding = styled.div`
  
`;

export const TableHeaderInner = styled.div`
  background: ${theme.hopeTrustBlue};
  color: ${theme.white};
  padding: 10px;
  display: flex;
  flex-direction: row;
  ${(props) => props.radius && css`
    border-radius: ${props.radius}px ${props.radius}px 0 0;
  `};
`;

export const TableHeaderInnerText = styled.div`
  flex: auto;
  ${(props) => props.widget && css`
    flex: inherit;
  `};
`;

export const TableHeaderInnerIcon = styled.div`
  cursor: pointer;
`;

export const SearchContainer = styled.div`
  padding-top:10px;
  position: sticky;
  top: 39px;
  background: #FFF;
  z-index: 1;
`;

export const SearchContainerPadding = styled.div`
  
`;

export const SearchContainerInner = styled(Row)`
  
`;

export const SearchContainerSection = styled(Col)`
  ${(props) => props.align && css`
    text-align: ${props.align};
  `};

  ${(props) => props.widget && css`
    align-self: center;
    margin-bottom: 12px;
  `};
`;

export const SearchInput = styled(Input)`
  color: ${theme.metadataGrey};
`;

export const SearchButtonWrapper = styled.div`
  text-align: center;
  margin-bottom: 0;
  padding: 5px 0px;
`;

export const TableButton = styled(Button)`
  
`;

export const SearchInputWrapper = styled(InputWrapper)`
  padding-left: 25px;
`;

export const SearchInputLabel = styled(InputLabel)`
  
`;


export const PaginationMain = styled.div`
  a {
    color: ${theme.hopeTrustBlueLink};
  }
`;

export const PaginationContainer = styled(Row)`
  padding: 0 20px 20px 20px;
  display: flex;

  ${(props) => props.padding && css`
    padding: ${props.padding}px;
  `};
`;

export const PaginationSection = styled(Col)`
  font-size: 16px;
  color: ${theme.metadataGrey};
  align-self: center;
  vertical-align: middle;
  align-self: self-end;
  ${(props) => props.align && css`
    text-align: ${props.align};
  `};
  ${media.lessThan("990px")`
    text-align: left;
    margin-bottom: 10px;
  `};
`;

export const Cell = styled.div`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;

  ${(props) => props.nooverflow && css`
    text-overflow: unset;
    overflow: visible;
    white-space: nowrap;
  `};

  ${(props) => props.capitalize && css`
    text-transform: capitalize;
  `};

  ${(props) => props.bold && css`
    font-weight: bold;
    color: ${theme.hopeTrustBlueDarker};
    cursor: pointer;
  `};

  ${(props) => props.sortable && css`
    font-weight: 500;
    color: ${theme.hopeTrustBlue};
    cursor: pointer;
    border-bottom: 1px dashed;
    max-width: min-content;

    &:hover {
      font-weight: 600;
    }
  `};

  ${(props) => props.color && css`
    color: ${props.color};
    ${(props) => props.sortable && css`
      border-bottom: 1px dashed;
    `};
  `};
`;

export const TableText = styled.div`
  color: ${theme.labelGrey};
  font-size: 12px;
  margin-bottom: 5px;
`;

export const DetailsInner = styled.div`
  text-align: right;
`;

export const GroupHeader = styled.div`
  width: 100%
`;
export const GroupHeaderPadding = styled.div`
  
`;
export const GroupHeaderInner = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-direction: row;
  align-items: center;
`;
export const GroupHeaderIcon = styled.div`
  font-size: 20px;
  color: ${theme.hopeTrustBlue};
  margin-right: 10px
`;
export const GroupHeaderText = styled.div`
  font-size: 14px;
  font-weight: 400;
`;
export const GroupHeaderAppendage = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${theme.labelGrey};
  margin-left: 10px;
`;
export const GroupHeaderCount = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${theme.labelGrey};
  margin-left: auto;
`;

export const FilterContainer = styled.div`
  width: 100%;
`;
export const FilterContainerPadding = styled.div`
  padding: 10px 25px 0 25px;
`;
export const FilterContainerInner = styled.div`
  .fc {
    margin-top: 20px;
  }
  .fc-button-color-default {
    color: ${theme.hopeTrustBlue};
  }
  .fc-button-color-primary {
    color: ${theme.hopeTrustBlue};
  }
  .fc-button-color-secondary {
    color: ${theme.hopeTrustBlue};
  }
  .fc-group {
    padding: 5px 0;
    .fc-dropdownmenu-contextmenu-item {
      font-size: 12px;
    }
  }
  .fc-condition {
    padding: 3px 0 0 0;
  }
  .fc-dropdownmenu {
    position: relative;
  }
  .fc-dropdownmenu-contextmenu {
    min-width: max-content;
    max-height: 300px;
    overflow: auto;
  }
  .fc-group-content {
    .fc-dropdownmenu-contextmenu-item {
      font-size: 12px;
      &::before {
        font-family: "Font Awesome 5 Pro";
        font-weight: 600;
        content: "\f00c";
        margin-right: 5px;
        color: ${theme.white};
      }
    }
    .fc-dropdownmenu-contextmenu-item.active {
      &::before {
        font-family: "Font Awesome 5 Pro";
        font-weight: 600;
        content: "\f00c";
        margin-right: 5px;
        color: ${theme.hopeTrustBlue};
      }
    }
  }
  .fc-value-editor {
    flex: 1 1 0%;
    box-sizing: border-box;
    background-color: rgb(255, 255, 255);
    color: rgba(66, 66, 66, 0.6);
    transition-duration: 150ms;
    transition-property: border;
    outline: none;
    resize: none;
    border-radius: 4px;
    padding: 0.5rem 0.5rem 0.5rem 1rem;
    font-size: 12px;
    z-index: 3;
    height: 100%;
    border: 1px solid ${theme.lineGrey};

    &:focus {
      outline: ${theme.hopeTrustBlue} solid 1px;
      outline-offset: -1px;
      box-shadow: ${lighten(0.6, theme.hopeTrustBlue)} 0px 0px 0px 2px;
    }
  }
  .fc-dropdownmenu-button {
    position: relative;
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    justify-content: center;
    line-height: initial;
    height: initial;
    transition-duration: 150ms;
    transition-property: background-color, box-shadow, border-color;
    text-decoration: none;
    background-clip: padding-box;
    padding: 0.55rem 1.09rem;
    font-size: 12px;
    border-radius: 4px;
    border: 1px solid ${lighten(0.6, theme.hopeTrustBlue)};
    background: ${lighten(0.6, theme.hopeTrustBlue)};
    &::after {
      font-family: "Font Awesome 5 Pro";
      font-weight: 400;
      content: "\f078";
      margin-left: 5px;
      font-size: 12px;
    }
  }
  .fc-button-add {
    position: relative;
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    justify-content: center;
    line-height: initial;
    height: initial;
    transition-duration: 150ms;
    transition-property: background-color, box-shadow, border-color;
    text-decoration: none;
    background-clip: padding-box;
    padding: 0.33rem 0.5rem;
    font-size: 12px;
    border-radius: 4px;
    border: 1px solid ${lighten(0.6, theme.hopeTrustBlue)};
    background: ${lighten(0.6, theme.hopeTrustBlue)};
    margin-right: 3px;
    margin-top: 3px;
    opacity: .8 !important;
    cursor: pointer;
    &::before {
      font-size: 15px;
      font-family: "Font Awesome 5 Pro";
      font-weight: 300;
      content: "\f067";
      color: ${theme.hopeTrustBlue};
      width: auto;
      height: auto;
      display: block;
      margin-right: 10px;
    }
  }
  .fc-button-remove {
    &::before {
      font-family: "Font Awesome 5 Pro";
      font-weight: 100;
      content: "\f2ed";
      font-size: 15px;
      color: ${theme.labelGrey};
    }
  }
`;
export const FilterHeader = styled.div`
  color: ${theme.labelGrey};
  font-size: 13px;
  font-weight: 300;
  padding: 5px 0 0 1px;
  cursor: pointer;
  border-bottom: 1px dashed;
  max-width: fit-content;
  &::after {
    font-family: "Font Awesome 5 Pro";
    font-weight: 400;
    content: "\f078";
    margin-left: 5px;
    font-size: 12px;
  }
`;

export const NewItemFieldWrapper = styled.div`
  
`;
export const NewItemFieldWrapperPadding = styled.div`
  
`;
export const NewItemFieldWrapperInner = styled.div`
  display: flex;

  button {
    max-height: 40px;
  }
`;
export const NewItemFieldInput = styled.input`
  flex: auto;
  background: #f1f4f7;
  border: none;
  border-radius: 4px;
  outline: none;
  color: #0a2540;
  padding: 5px 12px 7px;
  flex-grow: 1;
  margin: 0 5px 5px 5px;
  height: 40px;
  flex-grow: 1;
  flex-basis: 0;
  width: -webkit-fill-available;
`;
export const NewItemWrapper = styled.div`
  ${(props) => props.margintop && css`
    margin-top: ${props.margintop}px;
  `};
`;
export const FieldWrapperFields = styled.div`
  display: flex;
  justify-content: space-evenly;
  flex: auto;
  flex-wrap: wrap;
`;

export const LoaderContainer = styled.div`
  align-items: center;
  display: inline-flex;
  width: 100%;
  justify-content: center;
  height: 300px;
  font-size: 50px;
`;

export const PermissionTag = styled.div`
  width: auto;
  display: inline-block;
`;

export const PermissionTagPadding = styled.div`
  padding: 0 5px 0 1px;
`;

export const PermissionTagInner = styled.div`
  text-align: center;
  padding: 3px 10px;
  font-size: 11px;
  vertical-align: middle;
  background: ${theme.white};
  color: ${theme.metadataGrey};
  font-weight: 300;
  box-shadow: 0 1px 2px rgba(0,0,0,0.2);
  border-radius: 10px;
  line-height: 15px;
  width: max-content;
`;

export const PermissionTagIcon = styled.div`
  color: ${theme.buttonGreen};
  margin-right: 5px;
  display: inline-block;
  vertical-align: middle;
`;

export const EditorContainer = styled.div`
  display: flex;
  align-items: center;
`;

export const EditorInput = styled.input`
  flex: auto;
  background: #f1f4f7;
  border: none;
  border-radius: 4px;
  outline: none;
  color: #0a2540;
  padding: 5px 12px 7px;
  flex-grow: 1;
  margin: 0 5px;
  flex-grow: 1;
  flex-basis: 0;
  width: -webkit-fill-available;
`;

export const EditorSelect = styled.select`
  flex: auto;
  background: #f1f4f7;
  border: none;
  border-radius: 4px;
  outline: none;
  color: #0a2540;
  padding: 5px 12px 7px;
  flex-grow: 1;
  margin: 0 5px;
  flex-grow: 1;
  flex-basis: 0;
  width: -webkit-fill-available;
  -moz-appearance: none;
  -webkit-appearance: none;
  appearance: none;
`;

export const EditorSelectLabel = styled.label`
  position: relative;
  flex: auto;
  max-width: 60%;
  &:after {
    content: "\f078";
    font-family: "Font Awesome 5 Pro";
    font-size: 13px;
    color: #717171;
    padding: 12px 8px;
    position: absolute;
    right: 0;
    top: -10px;
    z-index: 1;
    text-align: center;
    width: 21%;
    height: 100%;
    pointer-events: none;
    box-sizing: border-box; 
  }
`;