import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { changePlansTab, getAllTransactions } from "../../store/actions/customer-support";
import { getUserPlans, getPartnerPlans, openCreateUserPlanModal, openCreatePartnerPlanModal, getActivePartnerPlans, getActiveUserPlans } from "../../store/actions/plans";
import { transaction_table_columns, product_table_columns, user_plan_table_columns, partner_plan_table_columns } from "../../column-definitions";
import { isMobile, isTablet } from "react-device-detect";
import GenericTable from "../GenericTable";
import {
  ViewContainer,
  Page,
  PageHeader,
  PageAction
} from "../../global-components";
import {
  CommerceSettingsMain,
  CommerceSettingsMainPadding,
  CommerceSettingsMainInner,
  SettingsTabs,
  SettingsTabsPadding,
  SettingsTabsInner,
  SettingsTab,
  SettingsTabPadding,
  SettingsTabInner,
  SettingsTabIcon,
  TabContent,
  SettingsTabStatusBar
} from "./style";
import { openCreateProductModal } from "../../store/actions/product";
import { getAllProducts } from "../../store/actions/account";
import { advisor_types } from "../../store/actions/partners";
import { capitalize } from "../../utilities";

let tabs_config = [
  {
    slug: "user-plan-config",
    icon: "user",
    title: "User Plans"
  },
  {
    slug: "partner-plan-config",
    icon: "user-tie",
    title: "Partner Plans"
  },
  {
    slug: "products-config",
    icon: "inventory",
    title: "Products"
  },
  {
    slug: "transactions-config",
    icon: "credit-card",
    title: "Transactions"
  }
];

class CommerceSettings extends Component {

  constructor(props) {
    super(props);
    const { location, customer_support } = props;
    document.title = "Commerce Settings";
    const active_tab = location.query.tab || customer_support.active_plan_tab;
    window.history.pushState({}, "Commerce Settings", window.location.pathname);
    this.state = {
      active_tab
    };
  }

  componentDidMount() {
    const { plans, getActiveUserPlans, getActivePartnerPlans } = this.props;
    if (!plans.isFetchingActiveUserPlans && !plans.requestedActiveUserPlans) getActiveUserPlans();
    if (!plans.isFetchingActivePartnerPlans && !plans.requestedActivePartnerPlans) getActivePartnerPlans();
  }

  changeTab = (tab) => {
    const { changePlansTab } = this.props;
    this.setState({ active_tab: tab.slug }, () => changePlansTab(tab.slug));
    document.title = tab.title;
  };

  TotalRevenue = () => {
    const { customer_support } = this.props;
    const charges = customer_support.transactions.filter((item) => item.type === "charge" && item.status === "succeeded");
    const total = charges.reduce((accumulator, item) => accumulator + (item.amount / 100), 0);
    const formatted = total.toLocaleString(undefined, { minimumFractionDigits: 2 });
    return (
      <div>Revenue: ${formatted}</div>
    );
  };

  render() {
    const { customer_support, product, plans } = this.props;
    const { active_tab } = this.state;
    return (
      <ViewContainer>
        <Page>
          <PageHeader paddingleftmobile={15} xs={12} sm={12} md={6} lg={6} xl={6} align="left">Commerce Management</PageHeader>
          <PageAction xs={12} sm={12} md={6} lg={6} xl={6} align={isMobile && !isTablet ? "left" : "right"}></PageAction>
        </Page>
        <CommerceSettingsMain>
          <CommerceSettingsMainPadding>
            <CommerceSettingsMainInner>
              <SettingsTabs>
                <SettingsTabsPadding span={12}>
                  <SettingsTabsInner>

                    {tabs_config.map((tab, index) => {
                      return (
                        <SettingsTab key={index} span={12 / tabs_config.length} onClick={() => this.changeTab(tab)}>
                          <SettingsTabPadding>
                            <SettingsTabInner active={active_tab === tab.slug ? 1 : 0}>
                              <SettingsTabIcon>
                                <FontAwesomeIcon icon={["fad", tab.icon]} />
                              </SettingsTabIcon> {tab.title}
                            </SettingsTabInner>
                            <SettingsTabStatusBar active={active_tab === tab.slug ? 1 : 0} />
                          </SettingsTabPadding>
                        </SettingsTab>
                      );
                    })}

                  </SettingsTabsInner>
                </SettingsTabsPadding>
              </SettingsTabs>
              <TabContent>
                {active_tab === "user-plan-config"
                  ? <GenericTable
                      permissions={["hopetrust-commerce-edit"]}
                      getData={getUserPlans}
                      columns={user_plan_table_columns}
                      page_size={25}
                      data_path={["plans", "user_plans"]}
                      initial_data={[]}
                      loading={plans.isFetchingUserPlans}
                      requested={plans.requestedUserPlans}
                      header="User Plans"
                      newRow={{
                        onClick: openCreateUserPlanModal,
                        arguments: [{}, false, false]
                      }}
                      paging={true}
                      search={true}
                      columnResizing={true}
                      radius={0}
                      fields={[
                        {
                          caption: "Name",
                          name: "name",
                          type: "string"
                        },
                        {
                          caption: "Price ID",
                          name: "price_id",
                          type: "string"
                        },
                        {
                          caption: "Subscribers",
                          name: "count",
                          type: "number"
                        },
                        {
                          caption: "Monthly",
                          name: "monthly",
                          type: "number",
                          transformValue: (value) => (Number(value) * 100)
                        },
                        {
                          caption: "Cancellation Fee",
                          name: "cancellation_fee",
                          type: "number"
                        },
                        {
                          caption: "Contract Length (months)",
                          name: "contract_length_months",
                          type: "number"
                        },
                        {
                          caption: "Vault Limit (bytes)",
                          name: "vault_limit",
                          type: "number"
                        },
                        {
                          caption: "Type",
                          name: "type",
                          type: "select",
                          options: [
                            { value: "user", caption: "User" },
                            { value: "benefits", caption: "Benefits" }
                          ]
                        },
                        {
                          caption: "Status",
                          name: "status",
                          type: "select",
                          options: [
                            { value: "active", caption: "Active" },
                            { value: "inactive", caption: "Inactive" }
                          ]
                        },
                        {
                          caption: "Bill Remainder",
                          name: "bill_remainder",
                          type: "select",
                          options: [
                            { caption: "Yes", value: "true" },
                            { caption: "No", value: "false" }
                          ]
                        },
                        {
                          caption: "Has Cancellation Fee",
                          name: "cancellation_fee_on",
                          type: "select",
                          options: [
                            { caption: "Yes", value: "true" },
                            { caption: "No", value: "false" }
                          ]
                        },
                        {
                          caption: "Is Metered",
                          name: "is_metered",
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
                  : null
                }
                {active_tab === "partner-plan-config"
                  ? <GenericTable
                      permissions={["hopetrust-commerce-edit"]}
                      getData={getPartnerPlans}
                      columns={partner_plan_table_columns}
                      page_size={25}
                      data_path={["plans", "partner_plans"]}
                      initial_data={[]}
                      loading={plans.isFetchingPartnerPlans}
                      requested={plans.requestedPartnerPlans}
                      header="Partner Plans"
                      newRow={{
                        onClick: openCreatePartnerPlanModal,
                        arguments: [{}, false, false]
                      }}
                      paging={true}
                      search={true}
                      columnResizing={true}
                      radius={0}
                      fields={[
                        {
                          caption: "Name",
                          name: "name",
                          type: "string"
                        },
                        {
                          caption: "Organization",
                          name: "org_name",
                          type: "string"
                        },
                        {
                          caption: "Partner Type",
                          name: "type",
                          type: "select",
                          options: advisor_types.map((a) => ({ caption: a.alias, value: a.name }))
                        },
                        {
                          caption: "Price ID",
                          name: "price_id",
                          type: "string"
                        },
                        {
                          caption: "Subscribers",
                          name: "count",
                          type: "number"
                        },
                        {
                          caption: "Monthly",
                          name: "monthly",
                          type: "number",
                          transformValue: (value) => (Number(value) * 100)
                        },
                        {
                          caption: "Cancellation Fee",
                          name: "cancellation_fee",
                          type: "number"
                        },
                        {
                          caption: "Seats Included",
                          name: "seats_included",
                          type: "number"
                        },
                        {
                          caption: "Additional Seat Cost",
                          name: "additional_plan_credits",
                          type: "number"
                        },
                        {
                          caption: "Max Cancellations",
                          name: "max_cancellations",
                          type: "number"
                        },
                        {
                          caption: "Contract Length (months)",
                          name: "contract_length_months",
                          type: "number"
                        },
                        {
                          caption: "Vault Limit (bytes)",
                          name: "vault_limit",
                          type: "number"
                        },
                        {
                          caption: "Status",
                          name: "status",
                          type: "select",
                          options: [
                            { value: "active", caption: "Active" },
                            { value: "inactive", caption: "Inactive" }
                          ]
                        },
                        {
                          caption: "Bill Remainder",
                          name: "bill_remainder",
                          type: "select",
                          options: [
                            { caption: "Yes", value: "true" },
                            { caption: "No", value: "false" }
                          ]
                        },
                        {
                          caption: "Has Cancellation Fee",
                          name: "cancellation_fee_on",
                          type: "select",
                          options: [
                            { caption: "Yes", value: "true" },
                            { caption: "No", value: "false" }
                          ]
                        },
                        {
                          caption: "Is Metered",
                          name: "is_metered",
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
                  : null
                }
                {active_tab === "products-config"
                  ? <GenericTable
                      permissions={["hopetrust-commerce-edit"]}
                      getData={getAllProducts}
                      columns={product_table_columns}
                      page_size={25}
                      data_path={["product", "list"]}
                      initial_data={[]}
                      loading={product.isFetchingProducts}
                      requested={product.requestedProducts}
                      header="Products"
                      newRow={{
                        onClick: openCreateProductModal,
                        arguments: [{}, false, false]
                      }}
                      paging={true}
                      search={true}
                      columnResizing={true}
                      radius={0}
                      fields={[
                        {
                          caption: "Title",
                          name: "title",
                          type: "string"
                        },
                        {
                          caption: "Product Slug",
                          name: "slug",
                          type: "string"
                        },
                        {
                          caption: "Category",
                          name: "category",
                          type: "select",
                          options: [...new Set(product.list.map(item => item.category)).map((p) => ({ caption: capitalize(p), value: p }))]
                        },
                        {
                          caption: "Product ID",
                          name: "product_id",
                          type: "string"
                        },
                        {
                          caption: "Amount",
                          name: "amount",
                          type: "number",
                          transformValue: (value) => (Number(value) * 100)
                        },
                        {
                          caption: "Price ID",
                          name: "price_id",
                          type: "string"
                        },
                        {
                          caption: "Purchases",
                          name: "count",
                          type: "number"
                        },
                        {
                          caption: "Status",
                          name: "status",
                          type: "select",
                          options: [
                            { value: "active", caption: "Active" },
                            { value: "inactive", caption: "Inactive" }
                          ]
                        },
                        {
                          caption: "Created",
                          name: "created_at",
                          type: "date"
                        }
                      ]}
                    />
                  : null
                }
                {active_tab === "transactions-config"
                  ? <GenericTable
                      permissions={["hopetrust-commerce-view"]}
                      getData={getAllTransactions}
                      columns={transaction_table_columns}
                      page_size={25}
                      data_path={["customer_support", "transactions"]}
                      initial_data={[]}
                      loading={customer_support.isFetchingAllTransactions}
                      requested={customer_support.requestedAllTransactions}
                      header="Transactions"
                      paging={true}
                      search={true}
                      columnResizing={true}
                      additional_info={<this.TotalRevenue />}
                      radius={0}
                      fields={[
                        {
                          caption: "Customer",
                          name: "name",
                          type: "string"
                        },
                        {
                          caption: "Customer ID",
                          name: "customer_id",
                          type: "string"
                        },
                        {
                          caption: "Amount",
                          name: "amount",
                          type: "number",
                          transformValue: (value) => (Number(value) * 100)
                        },
                        {
                          caption: "Type",
                          name: "type",
                          type: "select",
                          options: [
                            { caption: "Charge", value: "charge" },
                            { caption: "Subscription", value: "subscription" },
                            { caption: "Add Seat", value: "add seat" },
                            { caption: "Refund", value: "refund" }
                          ]
                        },
                        {
                          caption: "Status",
                          name: "status",
                          type: "select",
                          options: [
                            { caption: "Succeeded", value: "succeeded"},
                            { caption: "Active", value: "active" },
                            { caption: "Cancelled", value: "cancelled" },
                            { caption: "Updated", value: "updated" },
                            { caption: "Failed", value: "failed" }
                          ]
                        },
                        {
                          caption: "Description",
                          name: "description",
                          type: "string"
                        },
                        {
                          caption: "Created",
                          name: "created_at",
                          type: "date"
                        }
                      ]}
                    />
                  : null
                }
              </TabContent>
            </CommerceSettingsMainInner>
          </CommerceSettingsMainPadding>
        </CommerceSettingsMain>
      </ViewContainer>
    );
  }
}

const mapStateToProps = (state) => ({
  customer_support: state.customer_support,
  product: state.product,
  location: state.router.location,
  plans: state.plans
});
const dispatchToProps = (dispatch) => ({
  changePlansTab: (tab) => dispatch(changePlansTab(tab)),
  getActiveUserPlans: (override) => dispatch(getActiveUserPlans(override)),
  getActivePartnerPlans: (type, override) => dispatch(getActivePartnerPlans(type, override))
});
export default connect(mapStateToProps, dispatchToProps)(CommerceSettings);
