import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  MetricsContainer,
  MetricsContainerPadding,
  MetricsContainerInner,
  Metric,
  MetricPadding,
  MetricInner,
  MetricBody,
  MetricHeader,
  MetricValue
} from "./style";
import { flatten } from "lodash";

class Metrics extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { active_metrics } = this.props;
    return (
      <MetricsContainer span={12}>
        <MetricsContainerPadding>
          <MetricsContainerInner gutter={20}>
            {active_metrics.map((metric, index) => {
              const paths = metric.redux_key;
              let all_items = paths.map((path) => {
                let items = this.props[path[0]][path[[1]]];
                return items;
              });
              all_items = flatten(all_items);
              if (metric.transform_results) all_items = metric.transform_results(all_items);
              return (
                <Metric key={index} xs={12} sm={12} md={12/active_metrics.length} lg={12/active_metrics.length} xl={12/active_metrics.length}>
                  <MetricPadding>
                    <MetricInner>
                      <MetricBody>
                        <MetricHeader span={12}>{metric.title}</MetricHeader>
                        {paths.every((path) => !this.props[path[0]].isFetching)
                          ? <MetricValue span={12}>{metric.action(all_items)}</MetricValue>
                          : (
                            <MetricValue span={12}>
                              <FontAwesomeIcon icon={["fad", "spinner"]} spin />
                            </MetricValue>
                          )
                        }
                      </MetricBody>
                    </MetricInner>
                  </MetricPadding>
                </Metric>
              );
            })}
          </MetricsContainerInner>
        </MetricsContainerPadding>
      </MetricsContainer>
    );
  }
}

const mapStateToProps = (state) => ({
  wholesale: state.wholesale,
  retail: state.retail,
  agents: state.agents,
  groups: state.groups,
  teams: state.teams,
  clients: state.clients
});
const dispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, dispatchToProps)(Metrics);
