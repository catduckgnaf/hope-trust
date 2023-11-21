import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  RelationshipTiles,
  RelationshipTileRow,
  RelationshipTile,
  RelationshipTilePadding,
  RelationshipTileInner,
} from "./style";

class RelationshipPicker extends Component {
  static propTypes = {
    stateConsumer: PropTypes.func.isRequired
  }
  static defaultProps = {};

  constructor(props) {
    super(props);

    this.state = {
      user_types: [
        { name: "beneficiary", alias: "self" },
        { name: "parent" },
        { name: "friend" },
        { name: "legal guardian", alias: "guardian" },
        { name: "family member", alias: "family" },
        { name: "trustee" }
      ]
    };
  }

  render() {
    const { stateConsumer, stateRetriever } = this.props;
    const { user_types } = this.state;
    return (
      <RelationshipTiles>
        <RelationshipTileRow gutter={20}>
          {user_types.map((type, index) => {
            const typeOfUser = type.alias ? type.alias : type.name;
            return (
              <RelationshipTile key={index} onClick={() => stateConsumer("user_type", type.name, "account_details")} xs={12} sm={12} md={6} lg={6} xl={6}>
                <RelationshipTilePadding>
                  <RelationshipTileInner active={stateRetriever("user_type") === type.name}>{typeOfUser}</RelationshipTileInner>
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
