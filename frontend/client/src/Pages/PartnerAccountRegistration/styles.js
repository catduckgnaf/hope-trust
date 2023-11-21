import styled from "styled-components";
import { theme } from "../../global-styles";

export const ContractsLoader = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
export const ContractsLoaderMessage = styled.div`
  font-size: 16px;
  font-weight: 500;
  max-width: 600px;
  width: 100%;
  margin: auto;
`;

export const DownloadLink = styled.div`
  color: ${theme.hopeTrustBlueLink};
  cursor: pointer;

  &:hover {
    color: ${theme.hopeTrustBlueDarker};
  }
  margin-top: 20px;
`;

export const ContractsMessage = styled.div`
  
`;