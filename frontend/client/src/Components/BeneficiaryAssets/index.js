import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import { isSelfAccount } from "../../utilities";
import { getBeneficiaryAssets, openCreateBeneficiaryAssetModal } from "../../store/actions/beneficiary-assets";
import { importMYTOFinance } from "../../store/actions/myto";
import {
  BeneficiaryAssetsTable,
  BeneficiaryAssetsPadding,
  BeneficiaryAssetsInner
} from "./style";
import GenericTable from "../GenericTable";
import { beneficiary_assets_table_columns } from "../../column-definitions";
import { uniqBy } from "lodash";

class BeneficiaryAssets extends Component {

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
    const { customer_support, beneficiary_assets, user, session, simulation, accounts } = this.props;
    const account = accounts.find((account) => account.account_id === session.account_id);
    return (
      <BeneficiaryAssetsTable id="beneficiary">
        <BeneficiaryAssetsPadding>
          <BeneficiaryAssetsInner>
            <GenericTable
              permissions={["finance-edit"]}
              getData={getBeneficiaryAssets}
              columns={beneficiary_assets_table_columns}
              page_size={10}
              data_path={!simulation ? ["beneficiary_assets", "list"] : ["myto", "beneficiary_assets"]}
              initial_data={[]}
              loading={beneficiary_assets.isFetching}
              requested={beneficiary_assets.requested}
              header={isSelfAccount(user, account) ? "Personal Assets" : "Beneficiary Assets"}
              transform_data={(data) => {
                return data.map((d) => ({ ...d, simulation }))
              }}
              newRow={{
                onClick: openCreateBeneficiaryAssetModal,
                arguments: ["beneficiary", "assets", "manual", {}, false, false, simulation]
              }}
              {...(simulation && account.permissions.includes("finance-view") &&
              {
                additionalButton: {
                  buttonText: "Import Beneficiary Assets",
                  onClick: importMYTOFinance,
                  arguments: ["beneficiary_assets", "list"]
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
                  caption: "Total Value",
                  name: "value",
                  type: "number"
                },
                {
                  caption: "Net Value",
                  name: "net_value",
                  type: "number"
                },
                {
                  caption: "Debt",
                  name: "debt",
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
          </BeneficiaryAssetsInner>
        </BeneficiaryAssetsPadding>
      </BeneficiaryAssetsTable>
    );
  }
}

const mapStateToProps = (state) => ({
  accounts: state.accounts,
  user: state.user,
  session: state.session,
  beneficiary_assets: state.beneficiary_assets,
  customer_support: state.customer_support
});
const dispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, dispatchToProps)(BeneficiaryAssets);