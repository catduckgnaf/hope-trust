import React, { Component } from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  RelationshipTiles,
  RelationshipTileRow,
  RelationshipTile,
  RelationshipTilePadding,
  RelationshipTileInner,
  RelationshipHeaderText,
  RelationshipInnerRow,
  RelationshipInnerCol,
  RelationshipInnerIcon,
  Text
} from "./style";

class ClientLifecycleChooser extends Component {
  static propTypes = {
    stateConsumer: PropTypes.func.isRequired
  }
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { stateRetriever } = props;
    const user = stateRetriever("user");
    const accounts = user.accounts.filter((a) => (a.subscription.customer_id !== user.customer_id && a.user_plan));

    this.state = {
      lifecycles: [
        { name: "new", alias: "Create New Client", icon: "user-plus", isDisabled: false },
        { name: "existing", alias: "Transfer Existing Client", icon: "user-check", isDisabled: !accounts.length },
      ]
    };
  }

  render() {
    const { stateConsumer, stateRetriever } = this.props;
    const { lifecycles } = this.state;
    return (
      <RelationshipTiles>
        <RelationshipHeaderText>If the client has already been onboarded and they currently manage their own Free or Paid subscription, the subscription may be transferred to an existing partner as a paid seat.</RelationshipHeaderText>
        <RelationshipTileRow gutter={20}>
          {lifecycles.map((type, index) => {
            const lc = type.alias ? type.alias : type.name;
            return (
              <RelationshipTile key={index} onClick={!type.isDisabled ? () => stateConsumer("lifecycle", type.name, "account_details") : null} xs={12} sm={12} md={6} lg={6} xl={6}>
                <RelationshipTilePadding>
                  <RelationshipTileInner disabled={type.isDisabled} active={stateRetriever("lifecycle") === type.name}>
                    <RelationshipInnerRow>
                      <RelationshipInnerCol span={12} align="center">
                        <RelationshipInnerIcon>
                          <FontAwesomeIcon icon={["fad", type.icon]} /> <Text>{lc}</Text>
                        </RelationshipInnerIcon>
                      </RelationshipInnerCol>
                    </RelationshipInnerRow>
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
export default ClientLifecycleChooser;
