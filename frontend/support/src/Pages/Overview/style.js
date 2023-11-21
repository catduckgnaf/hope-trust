import styled from "styled-components";
import { Row, Col } from "react-simple-flex-grid";
import media from "styled-media-query";

export const Main = styled.div`
  width: 100%;
  height: 100vh;
  text-align: center;
  align-items: center;
  justify-content: center;
`;

export const MainPadding = styled.div`
  padding: 0 20px;
`;

export const MainInner = styled(Row)`
  height: 100%;
  align-items: center;
  justify-content: center;
`;

export const MainInnerSection = styled(Col)`
  align-self: center;
  margin-bottom: 20px;
`;

export const MobileContent = styled.div`
  flex: 1 1 auto;
`;

export const MobileHeader = styled.header`
  background-color: transparent;
  flex: 0 0 auto;
  padding: 0;
`;

export const MobileWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

export const MobileFooter = styled.footer`
  background-color: transparent;
  flex: 0 0 auto;
  padding: 0;
`;

export const Metrics = styled(Row)`
  
`;

export const Lists = styled(Row)`
  
`;

export const WidgetHeader = styled.div`
  .header-icon {
    margin-left: 10px;
    cursor: pointer;
  }
`;

export const WidgetHeaderText = styled.div`
  border-bottom: 1px dashed;
  max-width: max-content;
  display: inline;
  cursor: pointer;
`;

export const FilterContainer = styled.div`
  width: 100%;
`;

export const FilterContainerPadding = styled.div`
  padding: 0 10px;
  display: flex;
  justify-content: flex-end;
  flex-direction: column;
  flex-wrap: wrap-reverse;
`;

export const FilterContainerInner = styled.div`
  max-width: 300px;
  ${media.lessThan("500px")`
    max-width: 100%;
  `};
`;

export const OnlineNow = styled(Row)`
  display: inline-flex;
`;

export const OnlineIndicator = styled(Col)`
  align-items: center;
  display: inline-flex;
  max-width: max-content;
`;

export const OnlineText = styled.div`
  font-size: 13px;
  font-weight: 400;
  color: rgba(92, 98, 110, 1);
  align-self: center;
  display: inline-block;
  vertical-align: middle;
  &:hover {
    font-weight: 300;
    cursor: pointer;
  }
  ${media.lessThan("500px")`
    font-size: 11px;
  `};
`;

export const LoaderContainer = styled.div`
  align-items: center;
  display: inline-flex;
  width: 100%;
  justify-content: center;
  height: 300px;
  font-size: 50px;
`;