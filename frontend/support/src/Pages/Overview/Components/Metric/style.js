import styled, { css } from "styled-components";
import { Row, Col } from "react-simple-flex-grid";
import { theme } from "../../../../global-styles";
import media from "styled-media-query";
import { lighten } from "polished";

export const Main = styled(Col)`
  text-align: center;
`;

export const MainPadding = styled.div`
  padding: 10px;
`;

export const MainInner = styled(Row)`
  position: relative;
  align-items: center;
  justify-content: center;
  align-items: center;
  background: ${theme.white};
  box-shadow: 0 2px 5px -1px rgba(50,50,93,0.25),0 1px 3px -1px rgba(0,0,0,0.3);
  border-radius: 10px;
  position: relative;
  text-align: left;
  overflow: visible;
`;

export const Value = styled(Col)`
  padding: 50px 0 0 10px;
`;

export const ValueText = styled.div`
  display: block;
`;

export const Text = styled.div`
  font-size: 20px;
  font-weight: 400;
  color: ${theme.black};
  ${media.lessThan("500px")`
    font-size: 15px;
  `};
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const Title = styled(Col)`
  font-size: 13px;
  font-weight: 400;
  color: rgba(92, 98, 110, 1);
  padding: 10px 30px 30px 10px;
  display: inline-flex !important;
  align-items: center;
  &:hover {
    font-weight: 300;
    cursor: pointer;
  }
  ${(props) => props.has_addition && css`
    padding: 10px 30px 0 10px;
  `};
  ${(props) => props.addition && css`
    padding: 2px 30px 12px 10px;
  `};
  ${media.lessThan("500px")`
    font-size: 10px;
  `};
`;

export const Chart = styled(Col)`
  margin-top: auto;
  padding-left: 3px;
  svg {
    width: 100%;
    flex-grow: 1;
    overflow: inherit;
  }
  ${(props) => props.border && css`
    border-left: 1px solid ${lighten(0.5, theme.lightGrey)};
    border-bottom: 1px solid ${lighten(0.5, theme.lightGrey)};
  `};
`;

export const Appendage = styled.div`
  font-size: 11px;
  font-weight: 400;
  position: absolute;
  top: 10px;
  left: 10px;
  color: ${theme.metadataGrey};
  display: flex;
  align-items: center;
  background: ${lighten(0.55, theme.buttonGreen)};
  border-radius: 20px;
  padding: 4px 10px;
  color: ${theme.buttonGreen};
  flex-direction: row-reverse;
  &:hover {
    cursor: pointer;
  }
  ${media.lessThan("500px")`
    font-size: 10px;
    padding: 2px 5px;
  `};
`;

export const AppendageText = styled.div`
  display: inline-block;
  margin-right: 5px;
`;

export const AppendageIcon = styled.div`
  display: inline-block;
  font-size: 11px;
`;

export const ChartUnits = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  font-size: 9px;
  color: ${theme.lineGrey};
  margin-top: -10px;

  ${(props) => props.items < 4 && css`
    justify-content: space-around;
  `};
  ${(props) => props.items >= 4 && css`
    span {
      &:last-child {
        padding-right: 5px;
      }
    }
  `};
  ${media.lessThan("850px")`
    display: none;
  `};
`;