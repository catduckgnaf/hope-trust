import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { customerServiceGetAllPartners } from "../../store/actions/customer-support";
import GenericTable from "../GenericTable";
import { partners_table_columns } from "../../column-definitions";
import { advisor_types  } from "../../store/actions/partners";
import {
  ViewContainer
} from "../../global-components";
import {
  PartnerAccountsMain,
  PartnerAccountsPadding,
  PartnerAccountsInner
} from "./style";
import { nestedFilter, US_STATES } from "../../utilities";
import { lighten } from "polished";
import { theme } from "../../global-styles";

class PartnerAccounts extends Component {

  constructor(props) {
    super(props);
    const { customer_support, location } = props;
    document.title = "Partner Accounts";
    const account_ids = location.query.account_ids ? ((location.query.account_ids).split(",") || []) : false;
    let partners = [];
    let filter = {};
    Object.keys(location.query).forEach((key) => filter[key] = [location.query[key]]);
    window.history.pushState({}, "Partner Accounts", window.location.pathname);
    if (account_ids.length) {
      partners = customer_support.partners.filter((acc) => account_ids.includes(acc.cognito_id));
    } else if (Object.keys(filter).length) {
      partners = nestedFilter(customer_support.partners, filter);
    }
    this.state = {
      partners
    };
  }

  render() {
    const { customer_support, plans } = this.props;
    const { partners } = this.state;

    return (
      <ViewContainer>
        <PartnerAccountsMain>
          <PartnerAccountsPadding>
            <PartnerAccountsInner>
              <GenericTable
                onRefresh={localStorage.removeItem("react-avatar/failing")}
                permissions={["hopetrust-partners-edit"]}
                getData={customerServiceGetAllPartners}
                columns={partners_table_columns}
                page_size={10}
                data_path={["customer_support", "partners"]}
                initial_data={partners}
                clearDefaults={() => this.setState({ partners: [] })}
                loading={customer_support.isFetchingPartners}
                requested={customer_support.requestedPartners}
                header="Partners"
                paging={true}
                search={true}
                columnResizing={true}
                dataRowAttributes={(rowData) => {
                  return {
                    style: {
                      backgroundColor: (!rowData.domain_approved && !rowData.referral_code) ? lighten(0.55, theme.buttonGreen) : "rgba(255, 255, 255, 1)"
                    }
                  }
                }}
                fields={[
                  {
                    caption: "Name",
                    name: "partner_name",
                    type: "string"
                  },
                  {
                    caption: "Email",
                    name: "email",
                    type: "string"
                  },
                  {
                    caption: "Organization",
                    name: "name",
                    type: "string"
                  },
                  {
                    caption: "Plan ID",
                    name: "plan_id",
                    type: "string"
                  },
                  {
                    caption: "Subscription ID",
                    name: "subscription_id",
                    type: "string"
                  },
                  {
                    caption: "Customer ID",
                    name: "customer_id",
                    type: "string"
                  },
                  {
                    caption: "Hubspot Contact ID",
                    name: "hubspot_contact_id",
                    type: "string"
                  },
                  {
                    caption: "Hubspot Company ID",
                    name: "hubspot_company_id",
                    type: "string"
                  },
                  {
                    caption: "Hubspot Deal ID",
                    name: "hubspot_deal_id",
                    type: "string"
                  },
                  {
                    caption: "Clients",
                    name: "count",
                    type: "number"
                  },
                  {
                    caption: "Partner Type",
                    name: "partner_type",
                    type: "select",
                    options: advisor_types.map((a) => ({ caption: a.alias, value: a.name }))
                  },
                  {
                    caption: "Primary Network",
                    name: "primary_network",
                    type: "string"
                  },
                  {
                    caption: "Referral Source",
                    name: "source",
                    type: "string"
                  },
                  {
                    caption: "State",
                    name: "state",
                    type: "select",
                    options: US_STATES.map((state) => ({ caption: state.name, value: state.name }))
                  },
                  {
                    caption: "Resident State License Number",
                    name: "resident_state_license_number",
                    type: "string"
                  },
                  {
                    caption: "National Producer Number (NPN)",
                    name: "npn",
                    type: "string"
                  },
                  {
                    caption: "Plan Name",
                    name: "plan_name",
                    type: "select",
                    options: [...new Set(plans.partner_plans.map((item) => item.name)).map((n) => ({ caption: n, value: n }))]
                  },
                  {
                    caption: "Is Approved",
                    name: "approved",
                    type: "select",
                    options: [
                      { caption: "Yes", value: "true" },
                      { caption: "No", value: "false" }
                    ]
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
                    caption: "Contracts Signed Date",
                    name: "contracts_signed_on",
                    type: "date"
                  },
                  {
                    caption: "Is Entity",
                    name: "is_entity",
                    type: "select",
                    options: [
                      { caption: "Yes", value: "true" },
                      { caption: "No", value: "false" }
                    ]
                  },
                  {
                    caption: "Domain Approved",
                    name: "domain_approved",
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
            </PartnerAccountsInner>
          </PartnerAccountsPadding>
        </PartnerAccountsMain>
      </ViewContainer>
    );
  }
}

const mapStateToProps = (state) => ({
  customer_support: state.customer_support,
  location: state.router.location,
  plans: state.plans
});
const dispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, dispatchToProps)(PartnerAccounts);
