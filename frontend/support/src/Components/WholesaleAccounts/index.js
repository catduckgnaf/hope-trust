import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { getWholesalers, openCreateWholesaleModal } from "../../store/actions/wholesale";
import { wholesaler_table_columns } from "../../column-definitions";
import {
  ViewContainer
} from "../../global-components";
import GenericTable from "../GenericTable";

class WholesaleAccounts extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { wholesale } = this.props;
    return (
      <ViewContainer>
        <GenericTable
          permissions={["hopetrust-benefits-edit"]}
          getData={getWholesalers}
          columns={wholesaler_table_columns}
          page_size={25}
          data_path={["wholesale", "list"]}
          initial_data={[]}
          loading={wholesale.isFetching}
          requested={wholesale.requested}
          sortBy="created_at"
          header="Wholesale Accounts"
          newRow={{
            onClick: openCreateWholesaleModal,
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
  wholesale: state.wholesale
});
const dispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, dispatchToProps)(WholesaleAccounts);
