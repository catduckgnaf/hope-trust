import styled from "styled-components";
import { Col } from "react-simple-flex-grid";
import { theme } from "../../global-styles";

export const PartnerAuthForm = styled.form`
  
`;
export const PartnerContainerAuthSection = styled(Col)`
  
`;
export const PartnerAuthHeader = styled.div`
  font-size: 18px;
  font-weight: 400;
  text-align: center;
  width: 80%;
  color: ${theme.hopeTrustBlue};
  background: #FFF;
  position: relative;
  margin: auto;
  box-shadow: 0 4px 8px rgb(0 0 0 / 10%);
  margin-top: -35px;
  margin-bottom: 25px;
  padding: 15px;
  border-radius: 8px;
`;
export const PartnerAuthButtonContainer = styled.div`
  text-align: center;
  margin-bottom: 10px;
  margin-top: 30px;
`;