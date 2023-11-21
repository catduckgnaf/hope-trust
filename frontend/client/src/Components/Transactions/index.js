import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { getCustomerTransactions } from "../../store/actions/account";
import {
  PaymentContainer,
  PaymentMethodsMain,
  PaymentMethodsPadding,
  PaymentMethodsInner
} from "./style";
import GenericTable from "../GenericTable";
import { transaction_widget_columns } from "../../column-definitions";

class Transactions extends Component {

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
                permissions={["account-admin-view"]}
                getData={getCustomerTransactions}
                getArgs={[true, account.customer.id]}
                columns={transaction_widget_columns}
                initial_data={[]}
                data_path={["account", "transactions"]}
                loading={account.isFetchingTransactions}
                requested={account.requestedTransactions}
                header="Transactions"
                paging={false}
                search={false}
                columnResizing={false}
                columnReordering={false}
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
export default connect(mapStateToProps, dispatchToProps)(Transactions);
