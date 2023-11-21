import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  RelationshipTiles,
  RelationshipTileRow,
  RelationshipTile,
  RelationshipTilePadding,
  RelationshipTileInner,
  RelationshipTileInnerSection
} from "./style";

class RelationshipPicker extends Component {
  static propTypes = {
    stateConsumer: PropTypes.func.isRequired
  }
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  isOdd = (num) => num % 2;

  render() {
    const { stateConsumer, stateRetriever, options, filter } = this.props;
    const opts = options(stateRetriever);
    return (
      <RelationshipTiles>
        <RelationshipTileRow gutter={20}>
          {opts.filter((t) => t.shouldRender).map((type, index) => {
            const value = type.alias ? type.alias : type.name;
            return (
              <RelationshipTile key={index} onClick={() => {
                stateConsumer(filter, type.name, "account_details");
                stateConsumer("valid_domains", [], "account_details");
                stateConsumer("name", "", "account_details");
                stateConsumer("retail_id", "", "account_details");
                stateConsumer("agent_id", "", "account_details");
                stateConsumer("wholesale_id", "", "account_details");
                stateConsumer("parent_id", "", "account_details");
                stateConsumer("has_broker", false, "account_details");
                }} xs={12} sm={12} md={(index === (opts.length - 1) && this.isOdd(opts.length)) ? 12 : 6} lg={(index === (opts.length - 1) && this.isOdd(opts.length)) ? 12 : 6} xl={(index === (opts.length - 1) && this.isOdd(opts.length)) ? 12 : 6}>
                <RelationshipTilePadding>
                  <RelationshipTileInner active={stateRetriever(filter) === type.name ? 1 : 0}>
                    <RelationshipTileInnerSection heading={1} span={12}>{value}</RelationshipTileInnerSection>
                    {type.text
                      ? <RelationshipTileInnerSection span={12}>{type.text}</RelationshipTileInnerSection>
                      : null
                    }
                  </RelationshipTileInner>
                </RelationshipTilePadding>
              </RelationshipTile>
            );
          })}
        </RelationshipTileRow>
      </RelationshipTiles>
    );
  }
}
export default RelationshipPicker;
