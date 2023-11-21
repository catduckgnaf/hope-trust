import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { getStripeExpandedCustomer } from "../../store/actions/stripe";
import moment from "moment";
import {
  PaymentContainer,
  PaymentMethodsMain,
  PaymentMethodsPadding,
  PaymentMethodsInner
} from "./style";
import GenericTable from "../GenericTable";
import { payment_methods_widget_columns } from "../../column-definitions";

class PaymentMethods extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { account } = this.props;
    return (
      <PaymentContainer xs={12} sm={12} md={12} lg={6} xl={6}>
        <PaymentMethodsMain>
          <PaymentMethodsPadding>
            <PaymentMethodsInner>
              <GenericTable
                permissions={["account-admin-edit"]}
                getData={getStripeExpandedCustomer}
                getArgs={[true, account.customer.id]}
                columns={payment_methods_widget_columns}
                initial_data={[]}
                transform_data={(data) => {
                  const sources = data.map((d) => {
                    let info;
                    if (d.object === "source") info = { ...d, ...d.card };
                    if (d.object === "card") info = d;
                    return info;
                  });
                  return sources;
                }}
                dataRowAttributes={(rowData) => {
                  const isExpired = moment(`${rowData.exp_month}/1/${rowData.exp_year}`).isBefore(moment());
                  return {
                    style: {
                      backgroundColor: isExpired ? "rgba(255, 0, 0, 0.1)" : "rgba(255, 255, 255, 1)"
                    }
                  }
                }}
                data_path={["account", "customer", "sources", "data"]}
                loading={account.isFetchingCustomer}
                requested={account.requestedCustomer}
                header="Payment Methods"
                paging={false}
                search={false}
                columnReordering={false}
                columnResizing={false}
                widget={true}
                radius={6}
              />
            </PaymentMethodsInner>
          </PaymentMethodsPadding>
        </PaymentMethodsMain>
      </PaymentContainer>
    );
  }
}

const mapStateToProps = (state) => ({
  account: state.account
});
const dispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, dispatchToProps)(PaymentMethods);
