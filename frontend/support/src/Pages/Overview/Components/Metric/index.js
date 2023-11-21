import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Main,
  MainPadding,
  MainInner,
  Value,
  ValueText,
  Text,
  Appendage,
  AppendageText,
  AppendageIcon,
  Title,
  Chart,
  ChartUnits
} from "./style";
import MiniChart from "react-mini-chart";
import { theme } from "../../../../global-styles";
import { lighten } from "polished";
import moment from "moment";

class Metric extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { type, title, additional_count, value, span, onClick, days_increase, day_filter, loading, dataPoints = [] } = this.props;
    const change = days_increase ? days_increase() : 0;
    let dateMap = [];
    if (dataPoints.length >= 7) {
      for (let i = 1; i <= day_filter.value; i++) {
        const next_date = moment().subtract(i, "days");
        dateMap.unshift(next_date.format("ddd"));
      }
      if (dateMap.length > 7) {
        const weeks = Math.floor(dateMap.length / 7);
        dateMap = [];
        if (weeks <= 4) for (let i = 0; i < weeks; i++) dateMap.push(`Week ${i + 1}`);
        if (weeks > 4) {
          const months = Math.ceil(weeks / 4);
          for (let i = 0; i < months; i++) dateMap.unshift(moment().subtract(i, "months").format("MMMM"));
        }
      }
    }
    return (
      <Main xs={6} sm={6} md={span} lg={span} xl={span}>
        <MainPadding>
          <MainInner>
            <Value xs={7} sm={7} md={5} lg={5} xl={5}>
              <ValueText>
                {!loading
                  ? <Text>{!isNaN(value) ? (value || 0).toLocaleString() : value}</Text>
                  : <Text><FontAwesomeIcon icon={["fas", "spinner"]} spin /></Text>
                }
              </ValueText>
            </Value>
            <Chart xs={5} sm={5} md={7} lg={7} xl={7} border={(!loading && (dataPoints.length >= 7)) ? 1 : 0}>
              {!loading
                ? (
                  <>
                    <MiniChart
                      height={50}
                      activePointRadius={3}
                      strokeWidth={2}
                      labelFontSize={12}
                      labelFormat={(value) => (type === "currency") ? `$${value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : value}
                      strokeColor={lighten(0.2, theme.buttonLightGreen)}
                      activePointColor={theme.buttonGreen}
                      fill={theme.buttonGreen}
                      fillOpacity={0.1}
                      dataSet={dataPoints.length >= 7 ? dataPoints : []}
                    />
                    <ChartUnits items={dateMap.length}>
                      {dateMap.map((date, index) => <span key={index}>{date}</span>)}
                    </ChartUnits>
                  </>
                )
                : <FontAwesomeIcon style={{ fontSize: "50px", width: "100%" }} icon={["fad", "spinner-third"]} spin />
              }
            </Chart>
            <Title has_addition={additional_count ? 1 : 0} span={12} onClick={onClick}>{title} <FontAwesomeIcon style={{ display: "inline", marginLeft: "10px" }} size="xs" icon={["fas", "chevron-right"]} /></Title>
            {additional_count
              ? <Title addition={1} span={12}>{additional_count} <FontAwesomeIcon style={{ display: "inline", marginLeft: "10px" }} size="xs" icon={["fas", "chevron-right"]} /></Title>
              : null
            }
            {days_increase
              ? (
                <Appendage title={change ? `${change} in the last ${day_filter.value} ${day_filter.value === 1 ? "day" : "days"}` : ""}>
                  <AppendageIcon>
                    <FontAwesomeIcon icon={["fas", "arrow-trend-up"]} />
                  </AppendageIcon>
                  <AppendageText>{!isNaN(change) ? Math.abs(change) : change}</AppendageText>
                </Appendage>
              )
              : null
            }
          </MainInner>
        </MainPadding>
      </Main>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user
});
const dispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, dispatchToProps)(Metric);