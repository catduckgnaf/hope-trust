import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { getRetailers, openCreateRetailModal } from "../../store/actions/retail";
import { retailer_table_columns } from "../../column-definitions";
import {
  ViewContainer
} from "../../global-components";
import GenericTable from "../GenericTable";

class RetailAccounts extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { retail_state } = this.props;
    return (
      <ViewContainer>
        <GenericTable
          permissions={["hopetrust-benefits-edit"]}
          getData={getRetailers}
          columns={retailer_table_columns}
          page_size={25}
          data_path={["retail", "list"]}
          initial_data={[]}
          loading={retail_state.isFetching}
          requested={retail_state.requested}
          sortBy="created_at"
          header="Retail Accounts"
          newRow={{
            onClick: openCreateRetailModal,
            arguments: [{}, false, false]
          }}
          paging={true}
          search={true}
          columnResizing={true}
          radius={0}
          fields={[
            {
              caption: "Account Name",
              name: "name",
              type: "string"
            },
            {
              caption: "Email",
              name: "email",
              type: "string"
            },
            {
              caption: "Contact Name",
              name: "contact_name",
              type: "string"
            },
            {
              caption: "Contract Signature ID",
              name: "signature_id",
              type: "string"
            },
            {
              caption: "Contracts Signed",
              name: "contract_signed",
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
      </ViewContainer>
    );
  }
}

const mapStateToProps = (state) => ({
  retail_state: state.retail
});
const dispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, dispatchToProps)(RetailAccounts);
