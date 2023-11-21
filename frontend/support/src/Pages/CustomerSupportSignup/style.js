import styled from "styled-components";
import { ViewContainer } from "../../global-components";

export const SignupViewContainer = styled(ViewContainer)`
  padding-bottom: 100px;
`;

export const ImageCropperPreview = styled.img`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  padding: 10px;
  box-shadow: 0 4px 4px rgba(0,0,0,0.2);
  object-fit: cover;
  position: relative;
  margin: auto;
`;
export const ImageCropperStartOver = styled.div`
  width: 100%;
  padding: 20px 0;
  text-align: center;
`;