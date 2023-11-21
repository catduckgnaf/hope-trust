import styled from "styled-components";
import { theme } from "../../../../global-styles";

export const AutoCompleteItem = styled.div`
  padding: 10px;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
`;

export const CustomDates = styled.div`
  margin-top: 10px;
`;

export const MetaMessage = styled.div`
  margin-top: 10px;
  font-size: 14px;
  width: 100%;
  text-align: center;
  margin-bottom: 20px;
  color: ${theme.buttonLightGreen};
`;