import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import moment from "moment";
import logo from "../../assets/images/horizontal-hopetrust-logo.png";
import { Input, Button } from "../../global-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  InvoiceMain,
  InvoiceInner,
  InvoicePadding,
  InvoiceBox,
  InvoiceBoxPadding,
  InvoiceBoxInner,
  InvoiceBoxRow,
  InvoiceBoxItem,
  InvoiceBoxItemPadding,
  InvoiceBoxItemInner,
  InvoiceBoxCol,
  InvoiceBoxColPadding,
  InvoiceBoxColInner,
  InvoiceEntityInformation,
  InvoiceBoxLogo,
  InvoiceItemEmphasis,
  InvoiceItemStrike,
  InvoiceItemAmount
} from "./style";
import { navigateTo } from "../../store/actions/navigation";
import { cancelAccountSubscripton } from "../../store/actions/account";

class Invoice extends Component {
  constructor(props) {
    super(props);
    const { session, accounts } = props;
    const current_account = accounts.find((account) => account.account_id === session.account_id);
    this.state = {
      is_cancelling: false,
      permissions: current_account.permissions
    };
  }

  cancelAccountSubscripton = async (total, items) => {
    const { cancelAccountSubscripton, discountCode, type, current_plan, free_plan, active_subscription, account_customer } = this.props;
    this.setState({ is_cancelling: true });
    await cancelAccountSubscripton(type, items, (total * 100), discountCode, current_plan, free_plan, active_subscription, account_customer);
    this.setState({ is_cancelling: false });
  };

  render() {
    const {
      set,
      is_verifying_discount,
      discount_code_input,
      discountCode,
      verifyDiscountCode,
      invoice,
      customer,
      company,
      discount,
      navigateTo,
      current_balance
    } = this.props;
    const {
      items,
      name,
      cancelled_items,
      totalAmount,
      totalOriginalAmount,
      id,
      paymentMethod,
      createdDate,
      terms,
      paidDate,
      dueDate,
      description
    } = invoice;
    const { is_cancelling, permissions } = this.state;

    return (
      <InvoiceMain>
        <InvoicePadding>
          <InvoiceInner>
            <InvoiceBox>
              <InvoiceBoxPadding>
                <InvoiceBoxInner>
                  <InvoiceBoxRow id="top">
                    <InvoiceBoxCol align="left" xs={12} sm={12} md={8} lg={8} xl={8}>
                      <InvoiceBoxColPadding>
                        <InvoiceBoxColInner>
                          <InvoiceBoxRow>
                            <InvoiceBoxCol span={12} subheading={1}>From</InvoiceBoxCol>
                            <InvoiceBoxCol span={12}>
                              <InvoiceEntityInformation>
                                {company.name && <div>{company.name}</div>}
                                {company.address && company.address.map((line) => <div key={line}>{line}</div>)}
                                {company.email && <a href={`mailto:${company.email}`}>{company.email}</a>}
                              </InvoiceEntityInformation>
                            </InvoiceBoxCol>
                          </InvoiceBoxRow>
                        </InvoiceBoxColInner>
                      </InvoiceBoxColPadding>
                    </InvoiceBoxCol>
                    <InvoiceBoxCol align="left" xs={12} sm={12} md={4} lg={4} xl={4}>
                      <InvoiceBoxColPadding>
                        <InvoiceBoxColInner>
                          <InvoiceBoxLogo
                            src={logo}
                            alt={company.name}
                          />
                        </InvoiceBoxColInner>
                      </InvoiceBoxColPadding>
                    </InvoiceBoxCol>
                  </InvoiceBoxRow>
                  <InvoiceBoxRow id="information">
                    <InvoiceBoxCol align="left" xs={12} sm={12} md={8} lg={8} xl={8}>
                      <InvoiceBoxColPadding>
                        <InvoiceBoxColInner>
                          <InvoiceBoxRow>
                            <InvoiceBoxCol span={12} subheading={1}>To</InvoiceBoxCol>
                            <InvoiceBoxCol span={12}>
                              <InvoiceEntityInformation>
                                {customer.name && <div>{customer.name}</div>}
                                {customer.address && customer.address.map((line) => <div key={line}>{line}</div>)}
                                {customer.email && <a href={`mailto:${customer.email}`}>{customer.email}</a>}
                              </InvoiceEntityInformation>
                            </InvoiceBoxCol>
                          </InvoiceBoxRow>
                        </InvoiceBoxColInner>
                      </InvoiceBoxColPadding>
                    </InvoiceBoxCol>
                    <InvoiceBoxCol align="right" xs={12} sm={12} md={4} lg={4} xl={4}>
                      <InvoiceBoxRow>
                        <InvoiceBoxCol span={6} align="left" subheading={1}>{name} #</InvoiceBoxCol>
                        <InvoiceBoxCol span={6} align="right">{id}</InvoiceBoxCol>
                        {paymentMethod
                          ? (
                            <>
                              <InvoiceBoxCol span={6} align="left" subheading={1}>Payment Method</InvoiceBoxCol>
                              <InvoiceBoxCol span={6} align="right">{paymentMethod}</InvoiceBoxCol>
                            </>
                          )
                          : null
                        }
                        {createdDate
                          ? (
                            <>
                              <InvoiceBoxCol span={6} align="left" subheading={1}>{name} Date</InvoiceBoxCol>
                              <InvoiceBoxCol span={6} align="right">{moment(createdDate).format("MMMM Do, YYYY")}</InvoiceBoxCol>
                            </>
                          )
                          : null
                        }
                        {terms
                          ? (
                            <>
                              <InvoiceBoxCol span={6} align="left" subheading={1}>Terms</InvoiceBoxCol>
                              <InvoiceBoxCol span={6} align="right">{moment(terms).format("MMMM Do, YYYY")}</InvoiceBoxCol>
                            </>
                          )
                          : null
                        }
                        {paidDate
                          ? (
                            <>
                              <InvoiceBoxCol span={6} align="left" subheading={1}>Paid Date</InvoiceBoxCol>
                              <InvoiceBoxCol span={6} align="right">{moment(paidDate).format("MMMM Do, YYYY")}</InvoiceBoxCol>
                            </>
                          )
                          : null
                        }
                        {dueDate
                          ? (
                            <>
                              <InvoiceBoxCol span={6} align="left" subheading={1}>Due Date</InvoiceBoxCol>
                              <InvoiceBoxCol span={6} align="right">{moment(dueDate).format("MMMM Do, YYYY")}</InvoiceBoxCol>
                            </>
                          )
                          : null
                        }
                      </InvoiceBoxRow>
                    </InvoiceBoxCol>
                  </InvoiceBoxRow>
                  <InvoiceBoxRow id="description">
                    <InvoiceBoxCol span={12} align="left" subheading={1}>
                      Description
                  </InvoiceBoxCol>
                    <InvoiceBoxCol span={12} align="left" prewrap={1}>
                      {description}
                    </InvoiceBoxCol>
                  </InvoiceBoxRow>
                  <InvoiceBoxRow id="active">
                    <InvoiceBoxCol span={12}>
                      <InvoiceBoxRow marginbottom={10}>
                        <InvoiceBoxCol span={6} align="left" subheading={1}>Active Subscriptions ({items.length})</InvoiceBoxCol>
                        <InvoiceBoxCol span={3} align="left" subheading={1}>Remaining Payments</InvoiceBoxCol>
                        <InvoiceBoxCol span={3} align="right" subheading={1}>Amount</InvoiceBoxCol>
                      </InvoiceBoxRow>
                      <InvoiceBoxRow>
                        <InvoiceBoxCol span={12}>
                          {items.map((item, index) => {
                            return (
                              <InvoiceBoxItem key={index}>
                                <InvoiceBoxItemPadding>
                                  <InvoiceBoxItemInner disabled={(item.paid || item.waived) ? 1 : 0}>
                                    <InvoiceBoxCol span={6} align="left">{item.paid ? <InvoiceItemEmphasis>(Paid) </InvoiceItemEmphasis> : (item.waived) ? <InvoiceItemEmphasis>(Waived) </InvoiceItemEmphasis> : ""}{item.description}</InvoiceBoxCol>
                                    <InvoiceBoxCol span={3} align="left">{item.quantity}</InvoiceBoxCol>
                                    <InvoiceBoxCol span={3} align="right">
                                      {(item.originalAmount && item.originalAmount !== item.amount) && (
                                        <InvoiceItemStrike className="original-amount">
                                          ${item.originalAmount.toLocaleString()}
                                        </InvoiceItemStrike>
                                      )}
                                      <InvoiceItemAmount>${item.amount.toLocaleString()}</InvoiceItemAmount>
                                    </InvoiceBoxCol>
                                  </InvoiceBoxItemInner>
                                </InvoiceBoxItemPadding>
                              </InvoiceBoxItem>
                            )
                          })}
                        </InvoiceBoxCol>
                      </InvoiceBoxRow>
                    </InvoiceBoxCol>
                  </InvoiceBoxRow>
                  {cancelled_items.length
                    ? (
                      <InvoiceBoxRow id="cancelled" marginbottom={5}>
                        <InvoiceBoxCol span={12}>
                          <InvoiceBoxRow marginbottom={10}>
                            <InvoiceBoxCol span={6} align="left" subheading={1}>Cancelled Subscriptions ({cancelled_items.length})</InvoiceBoxCol>
                            <InvoiceBoxCol span={3} align="left"></InvoiceBoxCol>
                            <InvoiceBoxCol span={3} align="right" subheading={1}>Amount</InvoiceBoxCol>
                          </InvoiceBoxRow>
                          <InvoiceBoxRow>
                            <InvoiceBoxCol span={12}>
                              {cancelled_items.map((item, index) => {
                                return (
                                  <InvoiceBoxItem key={index}>
                                    <InvoiceBoxItemPadding>
                                      <InvoiceBoxItemInner disabled={1}>
                                        <InvoiceBoxCol xs={9} sm={9} md={6} lg={6} xl={6} align="left"><InvoiceItemEmphasis>(Cancelled) </InvoiceItemEmphasis>{item.description}</InvoiceBoxCol>
                                        <InvoiceBoxCol xs={0} sm={0} md={3} lg={3} xl={3} align="left"></InvoiceBoxCol>
                                        <InvoiceBoxCol span={3} align="right">
                                          {(item.originalAmount && item.originalAmount !== item.amount) && (
                                            <InvoiceItemStrike className="original-amount">
                                              ${item.originalAmount.toLocaleString()}
                                            </InvoiceItemStrike>
                                          )}
                                          <InvoiceItemAmount>$0</InvoiceItemAmount>
                                        </InvoiceBoxCol>
                                      </InvoiceBoxItemInner>
                                    </InvoiceBoxItemPadding>
                                  </InvoiceBoxItem>
                                )
                              })}
                            </InvoiceBoxCol>
                          </InvoiceBoxRow>
                        </InvoiceBoxCol>
                      </InvoiceBoxRow>
                    )
                    : null
                  }
                  <InvoiceBoxRow id="totals" padding={5}>
                    <InvoiceBoxCol xs={0} sm={0} md={5} lg={5} xl={5}></InvoiceBoxCol>
                    <InvoiceBoxCol nooverflow={1} xs={12} sm={12} md={7} lg={7} xl={7}>
                      {invoice.discount
                        ? (
                          <InvoiceBoxRow marginbottom={5}>
                            <InvoiceBoxCol span={5} subheading={1} lighter={1} align="left">Subtotal:</InvoiceBoxCol>
                            <InvoiceBoxCol span={7} subheading={1} lighter={1} align="right">
                              ${totalOriginalAmount.toLocaleString()}
                            </InvoiceBoxCol>
                          </InvoiceBoxRow>
                        )
                        : null
                      }
                      {invoice.discount && totalAmount
                        ? (
                          <InvoiceBoxRow marginbottom={5}>
                            <InvoiceBoxCol span={5} subheading={1} lighter={1} align="left">Discount ({invoice.discount.percent_off ? `${invoice.discount.percent_off}%` : `$${invoice.discount.amount_off / 100}`}):</InvoiceBoxCol>
                            <InvoiceBoxCol span={7} subheading={1} lighter={1} align="right">
                              -${(totalOriginalAmount - totalAmount).toLocaleString()}
                            </InvoiceBoxCol>
                          </InvoiceBoxRow>
                        )
                        : null
                      }
                      {current_balance && totalAmount
                        ? (
                          <InvoiceBoxRow marginbottom={5}>
                            <InvoiceBoxCol span={5} subheading={1} lighter={1} align="left">Credit Balance (${current_balance.toLocaleString()}):</InvoiceBoxCol>
                            <InvoiceBoxCol span={7} subheading={1} lighter={1} align="right">
                              -${((current_balance >= totalAmount) ? totalAmount : current_balance).toLocaleString()}
                            </InvoiceBoxCol>
                          </InvoiceBoxRow>
                        )
                        : null
                      }
                      {discountCode && totalAmount
                        ? (
                          <InvoiceBoxRow marginbottom={5}>
                            <InvoiceBoxCol span={5} subheading={1} lighter={1} align="left">{invoice.discount ? "Additional " : ""}Discount ({discountCode.percent_off ? `${discountCode.percent_off}%` : `$${discountCode.amount_off / 100}`}):</InvoiceBoxCol>
                            <InvoiceBoxCol span={7} subheading={1} lighter={1} align="right">
                              -${discount.toLocaleString()}
                            </InvoiceBoxCol>
                          </InvoiceBoxRow>
                        )
                        : null
                      }
                      {(totalAmount - current_balance) > 0
                        ? (
                          <InvoiceBoxRow marginbottom={5}>
                            <InvoiceBoxCol span={5} subheading={1} lighter={1} align="left">Discount Code:</InvoiceBoxCol>
                            <InvoiceBoxCol span={7} nooverflow={1} subheading={1} lighter={1} align="right">
                              <Input
                                type="text"
                                id="discount_code_input"
                                value={discount_code_input}
                                placeholder="**********"
                                onChange={(event) => set(event.target.id, event.target.value)}
                                autoComplete="off"
                                style={{ height: "35px", width: "auto" }}
                              />
                              <Button
                                disabled={!discount_code_input}
                                nomargin
                                marginleft={15}
                                marginright={-5}
                                id="apply_discount_button"
                                type="button"
                                role="button"
                                onClick={() => verifyDiscountCode(discount_code_input)}
                                small
                                blue>
                                {is_verifying_discount ? <FontAwesomeIcon icon={["far", "spinner"]} spin /> : "Apply"}
                              </Button>
                            </InvoiceBoxCol>
                          </InvoiceBoxRow>
                        )
                        : null
                      }
                      <InvoiceBoxRow marginbottom={5}>
                        <InvoiceBoxCol span={5} subheading={1} align="left">Total Due:</InvoiceBoxCol>
                        <InvoiceBoxCol span={7} subheading={1} align="right">
                          ${(((totalAmount - discount - current_balance) > 0) ? (totalAmount - discount - current_balance) : 0).toLocaleString()}
                        </InvoiceBoxCol>
                      </InvoiceBoxRow>
                    </InvoiceBoxCol>
                  </InvoiceBoxRow>
                  <InvoiceBoxRow id="payments" padding={5} sticky="bottom">
                    <InvoiceBoxCol nooverflow={1} align="right" span={12}>
                      {permissions.includes("account-admin-edit") && !is_cancelling
                        ? <Button disabled={is_cancelling} green type="button" role="button" onClick={() => this.cancelAccountSubscripton(totalAmount, items)}>{is_cancelling ? <FontAwesomeIcon icon={["far", "spinner"]} spin /> : "Pay Now"}</Button>
                        : <Button disabled green type="button" role="button">{is_cancelling ? <FontAwesomeIcon icon={["far", "spinner"]} spin /> : "Pay Now"}</Button>
                      }
                      <Button disabled={is_cancelling} danger type="button" role="button" nomargin marginleft={10} onClick={() => navigateTo("/settings")}>Cancel</Button>
                    </InvoiceBoxCol>
                  </InvoiceBoxRow>
                </InvoiceBoxInner>
              </InvoiceBoxPadding>
            </InvoiceBox>
          </InvoiceInner>
        </InvoicePadding>
      </InvoiceMain>
    );
  }
}

const mapStateToProps = (state) => ({
  accounts: state.accounts,
  user: state.user,
  session: state.session
});
const dispatchToProps = (dispatch) => ({
  cancelAccountSubscripton: (type, line_items, total, coupon, current_plan, free_plan, active_subscription, account_customer) => dispatch(cancelAccountSubscripton(type, line_items, total, coupon, current_plan, free_plan, active_subscription, account_customer)),
  navigateTo: (location) => dispatch(navigateTo(location))
});
export default connect(mapStateToProps, dispatchToProps)(Invoice);
