import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import { getProviders, provider_networks } from "../../store/actions/provider";
import { openCreateProviderModal } from "../../store/actions/provider";
import { exportProviders } from "../../store/actions/pdf";
import {
  ViewContainer
} from "../../global-components";
import GenericTable from "../../Components/GenericTable";
import { providers_table_columns } from "../../column-definitions";
import { uniqBy } from "lodash";

class Providers extends Component {
  static propTypes = {
    session: PropTypes.object.isRequired
  }
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { accounts, session } = props;
    document.title = "Providers";
    const account = accounts.find((account) => account.account_id === session.account_id);
    this.state = {
      account
    };
  }

  render() {
    const { provider, customer_support } = this.props;
    const { account } = this.state;
    const types = customer_support.core_settings.contact_types;
    return (
      <ViewContainer>
        <GenericTable
          permissions={["health-and-life-edit"]}
          getData={getProviders}
          columns={providers_table_columns}
          page_size={25}
          data_path={["provider", "list"]}
          initial_data={[]}
          loading={provider.isFetching}
          requested={provider.requested}
          header="Providers"
          newRow={{
            onClick: openCreateProviderModal,
            arguments: [{}, false, false]
          }}
          {...((account.permissions.includes("health-and-life-view") && provider.list.length) && { exportPDFFunction: (data, searched, type) => exportProviders() })}
          paging={true}
          search={true}
          radius={0}
          columnResizing={true}
          fields={[
            {
              caption: "Company Name",
              name: "name",
              type: "string"
            },
            {
              caption: "Contact First Name",
              name: "contact_first",
              type: "string"
            },
            {
              caption: "Contact Last Name",
              name: "contact_last",
              type: "string"
            },
            {
              caption: "Associated User Name",
              name: "associated_name",
              type: "string"
            },
            {
              caption: "Associated User First Name",
              name: "associated_first",
              type: "string"
            },
            {
              caption: "Associated User Last Name",
              name: "associated_last",
              type: "string"
            },
            {
              caption: "City",
              name: "city",
              type: "string"
            },
            {
              caption: "State",
              name: "state",
              type: "string"
            },
            {
              caption: "Zip Code",
              name: "zip",
              type: "string"
            },
            {
              caption: "Email",
              name: "email",
              type: "string"
            },
            {
              caption: "Type",
              name: "type",
              type: "select",
              options: uniqBy(types.map((m) => ({ caption: m.category, value: m.category })), "value")
            },
            {
              caption: "Specialty",
              name: "specialty",
              type: "select",
              options: uniqBy(types.map((m) => ({ caption: m.type, value: m.type })), "value")
            },
            {
              caption: "Medical Network",
              name: "network",
              type: "select",
              options: provider_networks.map((m) => ({ caption: m, value: m }))
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
  accounts: state.accounts,
  session: state.session,
  provider: state.provider,
  customer_support: state.customer_support
});
const dispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, dispatchToProps)(Providers);
