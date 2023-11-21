import styled from "styled-components";
import { Row, Col } from "react-simple-flex-grid";
import media from "styled-media-query";
import { theme } from "../../global-styles";

export const ScheduleTable = styled.div`
  width: 100%;
`;

export const ScheduleTablePadding = styled.div`
  padding: 0 10px;
`;

export const ScheduleColumnHeaders = styled(Row)`
  border-bottom: 1px solid rgba(0,0,0,0.1);
  margin-bottom: 10px;
  padding-left: 10px;

  ${media.lessThan("990px")`
    display: none !important;
  `};
`;

export const ScheduleColumnHeader = styled(Col)`
  font-weight: 500;
  padding: 5px 0;
  font-size: 12px;
`;

export const NoEventsFound = styled(Col)`
  font-weight: 300;
  text-align: center;
  background: rgba(255,255,255,0.5);
  padding: 15px 0 15px 10px;
  margin: 5px 0;
  border-radius: 25px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
`;

export const ScheduleDayOfTheWeek = styled.div`
  font-size: 25px;
  font-weight: 300;
  position: sticky;
  top: 0px;
  padding: 10px 8px;
  width: 100%
  z-index: 1;
  color: ${theme.metadataGrey};
  background: #F5F6FA;
`;

export const ScheduleSection = styled(Col)`
  margin-bottom: 25px;
`;