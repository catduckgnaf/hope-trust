import styled, { css } from "styled-components";
import { ViewContainer } from "../../global-components";
import { Row, Col } from "react-simple-flex-grid";
import { theme } from "../../global-styles";
import media from "styled-media-query";

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

export const PaymentResponsibilityContainer = styled.div`
  
`;
export const PaymentResponsibilityPadding = styled.div`
  
`;
export const PaymentResponsibilityInner = styled(Row)`
  
`;
export const PaymentResponsbilitySection = styled(Col)`
  
`;
export const PaymentResponsibilitySectionPadding = styled.div`
  padding: 10px 10px 20px 10px;
`;
export const PaymentResponsibilityInnerHeadingSection = styled(Row)`
  color: ${theme.hopeTrustBlue};
  line-height: 23px;
`;
export const PaymentResponsibilityInnerHeading = styled(Col)`
  font-size: 18px;
  font-weight: 400;
  ${media.lessThan("900px")`
    font-size: 16px;
  `};
`;
export const PaymentResponsibilityInnerDescription = styled(Col)`
  font-size: 14px;
  font-weight: 300;
  padding-top: 10px;
  ${media.lessThan("900px")`
    font-size: 12px;
  `};
`;
export const PaymentResponsibilityInnerInfo = styled(Col)`
  text-align: left;
`;
export const PaymentResponsibilityInnerIcon = styled(Col)`
  font-size: 25px;
  display: flex;
  justify-content: center;
  align-self: center;
  ${media.lessThan("900px")`
    font-size: 18px;
  `};
`;
export const PaymentResponsibilitySectionInner = styled.div`
  background: ${theme.white};
  padding: 20px 20px 20px 0;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);

  &:hover {
    box-shadow: 0 1px 2px rgba(0,0,0,0.3);
    cursor: pointer;
  }

  ${(props) => props.active && css`
    background: ${theme.hopeTrustBlue};

    ${PaymentResponsibilityInnerIcon} {
      color: ${theme.white};
    }

    ${PaymentResponsibilityInnerHeading} {
      color: ${theme.white};
    }

    ${PaymentResponsibilityInnerDescription} {
      color: ${theme.white};
    }

    &:hover {
      cursor: no-drop;
    }
  `};
`;