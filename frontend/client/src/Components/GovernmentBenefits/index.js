import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import { openCreateBenefitModal, getBenefits } from "../../store/actions/benefits";
import { importMYTOFinance } from "../../store/actions/myto";
import {
  BenefitsTable,
  BenefitsPadding,
  BenefitsInner
} from "./style";
import GenericTable from "../GenericTable";
import { benefits_table_columns } from "../../column-definitions";
import { uniqBy } from "lodash";
import moment from "moment";

class CovernmentBenefits extends Component {

  static propTypes = {
    session: PropTypes.object.isRequired
  }
  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { customer_support, benefits, session, simulation, accounts } = this.props;
    const account = accounts.find((account) => account.account_id === session.account_id);
    return (
      <BenefitsTable id="government-benefits">
        <BenefitsPadding>
          <BenefitsInner>
            <GenericTable
              permissions={["finance-edit"]}
              getData={getBenefits}
              columns={benefits_table_columns}
              page_size={10}
              data_path={!simulation ? ["benefits", "government_benefits"] : ["myto", "benefits"]}
              initial_data={[]}
              loading={benefits.isFetching}
              requested={benefits.requested}
              header="Government Benefits"
              transform_data={(data) => {
                return data.map((d) => {
                  const is_renewal_soon = moment(d.renewal_date).isBetween(moment(), moment().add(30, "day")) || moment(d.renewal_date).isSameOrBefore(moment());
                  return { ...d, simulation, is_renewal_soon };
                })
              }}
              newRow={{
                onClick: openCreateBenefitModal,
                arguments: [{}, false, false, simulation]
              }}
              {...(simulation && account.permissions.includes("finance-view") &&
              {
                additionalButton: {
                  buttonText: "Import Government Benefits",
                  onClick: importMYTOFinance,
                  arguments: ["benefits", "government_benefits"]
                }
              }
              )
              }
              dataRowAttributes={(rowData) => {
                return {
                  style: {
                    backgroundColor: (rowData.is_renewal_soon) ? "rgba(255, 0, 0, 0.1)" : "rgba(255, 255, 255, 1)"
                  }
                }
              }}
              paging={true}
              search={true}
              columnResizing={true}
              radius={0}
              fields={[
                {
                  caption: "Source",
                  name: "program_name",
                  type: "select",
                  options: customer_support.core_settings.benefit_types.map((t) => ({ caption: t.type, value: t.type }))
                },
                {
                  caption: "Category",
                  name: "category",
                  type: "select",
                  options: uniqBy(customer_support.core_settings.benefit_types.map((t) => ({ caption: t.category, value: t.category })), "value")
                },
                {
                  caption: "Monthly Value",
                  name: "value",
                  type: "number"
                },
                {
                  caption: "Renewal Date",
                  name: "renewal_date",
                  type: "date"
                },
                {
                  caption: "Annual Value",
                  name: "annual_value",
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
          </BenefitsInner>
        </BenefitsPadding>
      </BenefitsTable>
    );
  }
}

const mapStateToProps = (state) => ({
  accounts: state.accounts,
  session: state.session,
  benefits: state.benefits,
  customer_support: state.customer_support
});
const dispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, dispatchToProps)(CovernmentBenefits);