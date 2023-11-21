import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import { isSelfAccount } from "../../utilities";
import { getGrantorAssets, openCreateGrantorAssetModal } from "../../store/actions/grantor-assets";
import { importMYTOFinance } from "../../store/actions/myto";
import PlaidButton from "../PlaidButton";
import {
  GrantorAssetsTable,
  GrantorAssetsPadding,
  GrantorAssetsInner
} from "./style";
import GenericTable from "../GenericTable";
import { grantor_assets_table_columns } from "../../column-definitions";
import { uniqBy } from "lodash";

class GrantorAssets extends Component {

  static propTypes = {
    user: PropTypes.oneOfType([
      PropTypes.bool.isRequired,
      PropTypes.instanceOf(Object).isRequired
    ]),
    session: PropTypes.object.isRequired
  }
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { customer_support, grantor_assets, user, session, onSuccess, simulation, accounts } = this.props;
    const account = accounts.find((account) => account.account_id === session.account_id);
    return (
      <GrantorAssetsTable id="grantor-and-trust">
        <GrantorAssetsPadding>
          <GrantorAssetsInner>
            <GenericTable
              permissions={["grantor-assets-edit"]}
              getData={getGrantorAssets}
              columns={grantor_assets_table_columns}
              page_size={10}
              data_path={!simulation ? ["grantor_assets", "list"] : ["myto", "grantor_assets"]}
              initial_data={[]}
              loading={grantor_assets.isFetching}
              requested={grantor_assets.requested}
              header={isSelfAccount(user, account) ? "Trust Assets" : "Grantor & Trust Assets"}
              transform_data={(data) => {
                return data.map((d) => ({ ...d, simulation }))
              }}
              newRow={{
                onClick: openCreateGrantorAssetModal,
                arguments: ["grantor", "assets", "manual", {}, false, false, simulation]
              }}
              {...((account.permissions.includes("finance-edit") || account.permissions.includes("grantor-assets-edit")) && !simulation && account.user_plan.monthly && (account.features && account.features.bank_account_linking) &&
              {
                additionalButton: {
                  Component: (props) => <PlaidButton {...props} user={user} session={session} onSuccess={onSuccess} />
                }
              }
              )
              }
              {...(simulation && account.permissions.includes("grantor-assets-view") &&
              {
                additionalButton: {
                  buttonText: "Import Grantor Assets",
                  onClick: importMYTOFinance,
                  arguments: ["grantor_assets", "list"]
                }
              }
              )
              }
              dataRowAttributes={(rowData) => {
                return {
                  style: {
                    backgroundColor: rowData.bank_status ? ((rowData.bank_status === "LOGIN_REQUIRED" || rowData.bank_status.includes("PENDING_EXPIRATION__")) ? "rgba(255, 0, 0, 0.1)" : "rgba(255, 255, 255, 1)") : "rgba(255, 255, 255, 1)"
                  }
                }
              }}
              paging={true}
              search={true}
              columnResizing={true}
              radius={0}
              fields={[
                {
                  caption: "Type",
                  name: "account_type",
                  type: "select",
                  options: customer_support.core_settings.asset_types.map((t) => ({ caption: t.type, value: t.type }))
                },
                {
                  caption: "Category",
                  name: "category",
                  type: "select",
                  options: uniqBy(customer_support.core_settings.asset_types.map((t) => ({ caption: t.category, value: t.category })), "value")
                },
                {
                  caption: "Account Number",
                  name: "account_number",
                  type: "string"
                },
                {
                  caption: "Institution",
                  name: "institution_name",
                  type: "string"
                },
                {
                  caption: "Vesting Type",
                  name: "vesting_type",
                  type: "select",
                  options: [
                    { caption: "Current", value: "current" },
                    { caption: "Future", value: "future" },
                    { caption: "Non-Trust", value: "non-trust" }
                  ]
                },
                {
                  caption: "Trust Percentage",
                  name: "assigned_percent",
                  type: "number"
                },
                {
                  caption: "Value",
                  name: "value",
                  type: "number"
                },
                {
                  caption: "Debt",
                  name: "debt",
                  type: "number"
                },
                {
                  caption: "Trust Assets",
                  name: "trust_assets",
                  type: "number"
                },
                {
                  caption: "Inflation Adjusted",
                  name: "inflation",
                  type: "select",
                  options: [
                    { caption: "Yes", value: "true" },
                    { caption: "No", value: "false" }
                  ]
                },
                {
                  caption: "Created",
                  name: "created_at",
                  type: "date"
                }
              ]}
            />
          </GrantorAssetsInner>
        </GrantorAssetsPadding>
      </GrantorAssetsTable>
    );
  }
}

const mapStateToProps = (state) => ({
  accounts: state.accounts,
  user: state.user,
  session: state.session,
  grantor_assets: state.grantor_assets,
  customer_support: state.customer_support
});
const dispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, dispatchToProps)(GrantorAssets);