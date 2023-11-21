import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { createMultilineInvoice, openPaymentMethodsModal, getStripeExpandedCustomer, closeProfessionalPortalServicesModal } from "../../store/actions/stripe";
import { dispatchRequest } from "../../store/actions/request";
import { getCustomerTransactions } from "../../store/actions/account";
import { getProducts } from "../../store/actions/product";
import { showNotification } from "../../store/actions/notification";
import { Row, Col } from "react-simple-flex-grid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Modal } from "react-responsive-modal";
import { Button } from "../../global-components";
import LoaderOverlay from "../LoaderOverlay";
import { toastr } from "react-redux-toastr";
import { orderBy, uniq } from "lodash";
import moment from "moment";
import { applyCustomOrder } from "../../utilities";
import {
  ProfessionalPortalServicesInnerModal,
  ProfessionalPortalAssistanceMainModalTitle,
  ProfessionalPortalAssistanceMainButtonContainer,
  ProfessionalPortalAssistanceMainText,
  ProfessionalPortalAssistanceMainOptionsContainer,
  ProfessionalPortalAssistanceMainOption,
  ProfessionalPortalAssistanceMainOptionPadding,
  ProfessionalPortalAssistanceMainOptionInner,
  ProfessionaLPortalAssistanceItems,
  ProfessionaLPortalAssistanceIconItem,
  ProfessionaLPortalAssistanceTextItem,
  ConfirmAgreementContainerNoteContainer,
  TextItemIcon,
  TextItemTitle,
  TextItemSecondary,
  TextItemLastPurchase,
  TextItemPrice,
  CategoryHeader,
  OutputSections,
  OutputSection,
  OutputSectionsPadding,
  OutputSectionsInner,
  ButtonContainer,
  ConfirmAgreementContainer,
  ConfirmAgreementContainerHeader,
  ConfirmAgreementContainerBody,
  ConfirmAgreementContainerFooter,
  LineItem,
  LineItemPadding,
  LineItemInner,
  LineItemSectionTitle,
  LineItemSectionPrice,
  ConfirmAgreementContainerFooterSections,
  ConfirmAgreementContainerFooterSection,
  ConfirmAgreementNote,
  ProductItem,
  PayWall,
  PayWallPadding,
  PayWallInner,
  PayWallIcon,
  PayWallBody,
  PayWallBodyHeader,
  PayWallBodyText,
  PayWallFooter,
  PayWallButtonContainer,
  PayWallOverlay
} from "./style";
import { navigateTo } from "../../store/actions/navigation";
import { changeSettingsTab } from "../../store/actions/settings";
const exclusive_categories = ["Support"];
const category_icons = {
  "Support": "user-headset",
  "Professional Services": "user-tie",
  "Add-ons": "layer-plus"
};

class ProfessionalPortalAssistanceModal extends Component {

  constructor(props) {
    super(props);
    const { relationship, session, accounts } = props;
    const current_account = accounts.find((account) => account.account_id === session.account_id);
    const creator = relationship.list.find((u) => u.customer_id && !u.linked_account);
    this.state = {
      is_loading: false,
      cart: [],
      creator,
      current_account
    };
  }

  confirmPurchase = async (total, discount = 0) => {
    const { createMultilineInvoice, openPaymentMethodsModal, closeProfessionalPortalServicesModal, account } = this.props;
    const { balance } = account.customer;
    const current_balance = balance ? (Math.abs(balance) / 100) : 0;
    const { cart, creator } = this.state;
    if (!total || (account.customer && account.customer.sources && account.customer.sources.data.length)) {
      const confirmOptions = {
        id: "confirm_purchase_modal",
        onOk: async () => {
          const paid = await createMultilineInvoice(cart, creator.customer_id);
          if (paid.success) {
            closeProfessionalPortalServicesModal();
            this.dispatchSupportRequest(cart, creator);
          }
        },
        onCancel: () => toastr.removeByType("confirms"),
        okText: `Pay $${(((total - discount - current_balance) > 0) ? (total - discount - current_balance) : 0).toLocaleString()}`,
        cancelText: "Cancel",
        component: () => {
          return (
            <ConfirmAgreementContainer>
              <ConfirmAgreementContainerHeader span={12}>Review Purchase</ConfirmAgreementContainerHeader>
              <ConfirmAgreementContainerBody span={12}>
                {cart.map((item, index) => {
                  return (
                    <LineItem key={index}>
                      <LineItemPadding>
                        <LineItemInner>
                          <LineItemSectionTitle span={10}>{item.title}</LineItemSectionTitle>
                          <LineItemSectionPrice span={2}>${(item.amount / 100).toLocaleString()}</LineItemSectionPrice>
                        </LineItemInner>
                      </LineItemPadding>
                    </LineItem>
                  );
                })}
              </ConfirmAgreementContainerBody>
              <ConfirmAgreementContainerFooter span={12}>
                <ConfirmAgreementContainerFooterSections>
                  {discount || current_balance
                    ? (
                      <>
                        <ConfirmAgreementContainerFooterSection align="left" span={6}>Subtotal:</ConfirmAgreementContainerFooterSection>
                        <ConfirmAgreementContainerFooterSection align="right" span={6}>${total.toLocaleString()}</ConfirmAgreementContainerFooterSection>
                      </>
                    )
                    : null
                  }
                  {discount
                    ? (
                      <>
                        <ConfirmAgreementContainerFooterSection align="left" span={6}>Discount:</ConfirmAgreementContainerFooterSection>
                        <ConfirmAgreementContainerFooterSection align="right" span={6}>-${discount.toLocaleString()}</ConfirmAgreementContainerFooterSection>
                      </>
                    )
                    : null
                  }
                  {current_balance && (total - discount > 0)
                    ? (
                      <>
                        <ConfirmAgreementContainerFooterSection align="left" span={6}>Credits Applied:</ConfirmAgreementContainerFooterSection>
                        <ConfirmAgreementContainerFooterSection align="right" span={6}>-${((current_balance >= (total - discount)) ? (total - discount) : current_balance).toLocaleString()}</ConfirmAgreementContainerFooterSection>
                      </>
                    )
                    : null
                  }
                  <ConfirmAgreementContainerFooterSection align="left" span={6}>Due Now:</ConfirmAgreementContainerFooterSection>
                  <ConfirmAgreementContainerFooterSection align="right" span={6}>${(((total - discount - current_balance) > 0) ? (total - discount - current_balance) : 0).toLocaleString()}</ConfirmAgreementContainerFooterSection>
                </ConfirmAgreementContainerFooterSections>
                <ConfirmAgreementContainerNoteContainer span={12}>
                  <ConfirmAgreementNote>
                    We will charge the default payment method on this account.
                  </ConfirmAgreementNote>
                </ConfirmAgreementContainerNoteContainer>
              </ConfirmAgreementContainerFooter>
            </ConfirmAgreementContainer>
          );
        }
      };
      toastr.confirm(null, confirmOptions);
    } else {
      openPaymentMethodsModal({ standalone_payment_methods: true, show_payment_method_messaging: true });
    }
  };

  dispatchSupportRequest = async (cart, creator) => {
    const { user, dispatchRequest } = this.props;
    const items = cart.map((i) => i.title).join(", ").replace(/, ((?:.(?!, ))+)$/, " and $1");
    let contacts = [];
    cart.forEach((i) => contacts = contacts.concat(i.contacts));
    const contacts_string = uniq(contacts).join(", ").replace(/, ((?:.(?!, ))+)$/, " and $1");
    await dispatchRequest({
      title: "Additional Services Purchased",
      request_type: "professional_portal_assistance",
      priority: "urgent",
      body: `${creator.first_name} ${creator.last_name} has purchased add-on services. ${creator.first_name} would like "${items}". Please get in touch with the purchaser ${user.first_name} ${user.last_name} at ${user.email} to schedule assistance if necessary.${contacts.length ? ` Email notifications have been dispatched to ${contacts_string}.` : ""}`
    });
  };

  componentDidMount() {
    const { getProducts, product, account, getStripeExpandedCustomer, getCustomerTransactions } = this.props;
    const { creator } = this.state;
    if (!product.requestedProducts && !product.isFetchingProducts) getProducts(true);
    if ((!account.requestedTransactions && !account.isFetchingTransactions)) getCustomerTransactions(false, creator.customer_id);
    if (!account.isFetchingCustomer && !account.requestedCustomer) getStripeExpandedCustomer(false, creator.customer_id);
  }

  addToCart = (product) => {
    const { cart } = this.state;
    let cart_copy = cart;
    if (!cart_copy.find((cc) => cc.id === product.id)) {
      cart_copy.push(product);
    } else {
      cart_copy = cart_copy.filter((cc) => cc.id !== product.id);
    }
    this.setState({ cart: cart_copy });
  };

  refreshProducts = async () => {
    const { getProducts, getStripeExpandedCustomer, getCustomerTransactions } = this.props;
    const { creator } = this.state;
    await getProducts(true);
    await getCustomerTransactions(true, creator.customer_id);
    await getStripeExpandedCustomer(true, creator.customer_id);
    this.setState({ cart: [] });
  };

  goToUpgrade = () => {
    const { navigateTo, changeSettingsTab, closeProfessionalPortalServicesModal } = this.props;
    navigateTo("/settings");
    changeSettingsTab("subscription");
    closeProfessionalPortalServicesModal();
  };

  goToProfile = () => {
    const { navigateTo, changeSettingsTab, closeProfessionalPortalServicesModal } = this.props;
    navigateTo("/settings", null, "#permissions");
    changeSettingsTab("profile");
    closeProfessionalPortalServicesModal();
  };

  render() {
    const { viewing_portal_assistance, closeProfessionalPortalServicesModal, product, account } = this.props;
    const { cart, is_loading, current_account } = this.state;
    const total = (cart.reduce((a, { amount }) => a + amount, 0) / 100);
    const discount = 0;
    const current_charges = orderBy(account.transactions.charge, ["created_at"], ["desc"]);
    const ordered_categories = applyCustomOrder(product.list, ["Support", "Professional Services", "Add-ons"], "category").map((p) => p.category);
    const is_free = (current_account.user_plan && !current_account.user_plan.monthly);
    const is_edit = current_account.permissions.includes("account-admin-edit");
    const { balance = 0 } = account.customer;
    const current_balance = balance ? (Math.abs(balance) / 100) : 0;

    return (
      <Modal animationDuration={100} styles={{ modal: { maxWidth: "1000px", width: "100%", borderRadius: "5px", zIndex: 2147483646 }, overlay: { zIndex: 2147483646 } }} open={viewing_portal_assistance} onClose={() => closeProfessionalPortalServicesModal()} center>
        <ProfessionalPortalServicesInnerModal align="middle" justify="center" is_locked={(is_free || !is_edit) ? 1 : 0} isloading={is_loading ? 1 : 0} >
          <Col span={12}>
            <LoaderOverlay show={is_loading} message="Requesting..." />
            {is_free
              ? (
                <PayWall>
                  <PayWallOverlay />
                  <PayWallPadding>
                    <PayWallInner>
                      <PayWallIcon span={12}>
                        <FontAwesomeIcon icon={["fad", "info-circle"]} />
                      </PayWallIcon>
                      <PayWallBody span={12}>
                        <PayWallBodyHeader>Upgrade Required</PayWallBodyHeader>
                        <PayWallBodyText>Additional Services require a paid subscription. Upgrade your account to access Professional Services, Support Services, and to purchase account Add-ons.</PayWallBodyText>
                      </PayWallBody>
                      <PayWallFooter span={12}>
                        <PayWallButtonContainer>
                          <Button blue type="button" onClick={() => this.goToUpgrade()}>Upgrade</Button>
                        </PayWallButtonContainer>
                      </PayWallFooter>
                    </PayWallInner>
                  </PayWallPadding>
                </PayWall>
              )
              : null
            }
            {!is_edit
              ? (
                <PayWall>
                  <PayWallOverlay />
                  <PayWallPadding>
                    <PayWallInner>
                      <PayWallIcon span={12}>
                        <FontAwesomeIcon icon={["fad", "lock-alt"]} />
                      </PayWallIcon>
                      <PayWallBody span={12}>
                        <PayWallBodyHeader>Permissions Required</PayWallBodyHeader>
                        <PayWallBodyText>Additional Services require permission to edit the account. Please request Account Admin Edit permissions to access Professional Services, Support Services, and to purchase account Add-ons.</PayWallBodyText>
                      </PayWallBody>
                      <PayWallFooter span={12}>
                        <PayWallButtonContainer>
                          <Button blue type="button" onClick={() => this.goToProfile()}>Request Permissions</Button>
                        </PayWallButtonContainer>
                      </PayWallFooter>
                    </PayWallInner>
                  </PayWallPadding>
                </PayWall>
              )
              : null
            }
            <ProfessionalPortalAssistanceMainModalTitle>Additional Services</ProfessionalPortalAssistanceMainModalTitle>
            <Row>
              <Col span={12}>
                <ProfessionalPortalAssistanceMainText>
                  If you need assistance completing your Care Plan or require technical assistance, please feel free to contact Hope Trust support. If you would prefer paid one-on-one, hands-on support in completing your Care Plan you may purchase one of the “Support” options below. The “Add-ons” listed below are tools that may be purchased to help support any additional needs while completing your account with Hope Trust.
                </ProfessionalPortalAssistanceMainText>
              </Col>
              <Col span={12}>
                {product.list.length && !product.isFetchingProducts
                  ? (
                    <ProfessionalPortalAssistanceMainOptionsContainer>
                      {uniq(ordered_categories).map((category, index) => {
                        return (
                          <ProductItem key={index}>
                            <CategoryHeader span={12}>{category}</CategoryHeader>
                            {orderBy(product.list.filter((p) => p.category === category), ["amount"], ["desc"]).map((selected_product, index) => {
                              const has_add_on = selected_product.features.length ? selected_product.features.every((f) => current_account.features[f]) : false;
                              const last_purchase = current_charges.find((t) => t.lines && t.lines.includes(selected_product.price_id) && t.status === "succeeded");
                              const is_in_cart = cart.filter((item) => item.price_id === selected_product.price_id);
                              const closed_category = (exclusive_categories.includes(selected_product.category) && cart.filter((c) => c.category === selected_product.category).length === 1 && !cart.find((c) => c.id === selected_product.id));
                              return (
                                <ProfessionalPortalAssistanceMainOption key={index} span={12}>
                                  <ProfessionalPortalAssistanceMainOptionPadding>
                                    <ProfessionalPortalAssistanceMainOptionInner disabled={has_add_on || closed_category} active={cart.find((c) => c.id === selected_product.id) ? 1 : 0}>
                                      <ProfessionaLPortalAssistanceItems gutter={20}>
                                        <ProfessionaLPortalAssistanceIconItem xs={2} sm={2} md={1} lg={1} xl={1} align="center">
                                          <TextItemIcon>
                                            <FontAwesomeIcon icon={["fad", has_add_on ? "check" : (category_icons[selected_product.category] || "tags")]} />
                                          </TextItemIcon>
                                        </ProfessionaLPortalAssistanceIconItem>
                                        <ProfessionaLPortalAssistanceTextItem xs={8} sm={8} md={9} lg={9} xl={9} align="left">
                                          <TextItemTitle>{selected_product.title}</TextItemTitle>
                                          <TextItemSecondary>{selected_product.description}</TextItemSecondary>
                                          {last_purchase
                                            ? <TextItemLastPurchase target="_blank" href={last_purchase.receipt_url}>{`${!selected_product.features.length ? "Last Purchased" : "Purchased"} on ${moment(last_purchase.created_at).format("MM/DD/YYYY")} - View Receipt`}</TextItemLastPurchase>
                                            : null
                                          }
                                        </ProfessionaLPortalAssistanceTextItem>
                                        <ProfessionaLPortalAssistanceTextItem span={2} align="center">
                                          {has_add_on
                                            ? <TextItemTitle>Active</TextItemTitle>
                                            : (
                                              <>
                                                <TextItemPrice>{selected_product.amount ? `$${(selected_product.amount / 100).toLocaleString()}` : "FREE"}</TextItemPrice>
                                                {!is_free && is_edit && !closed_category
                                                  ? <Button widthPercent={100} nohover blue type="button" small onClick={!has_add_on ? () => this.addToCart(selected_product) : null}>{!is_in_cart.length ? "Add" : "Remove"}</Button>
                                                  : null
                                                }
                                              </>
                                            )
                                          }
                                        </ProfessionaLPortalAssistanceTextItem>
                                      </ProfessionaLPortalAssistanceItems>
                                    </ProfessionalPortalAssistanceMainOptionInner>
                                  </ProfessionalPortalAssistanceMainOptionPadding>
                                </ProfessionalPortalAssistanceMainOption>
                              );
                            })}
                          </ProductItem>
                        );
                      })}
                    </ProfessionalPortalAssistanceMainOptionsContainer>
                  )
                  : (
                    <ProfessionalPortalAssistanceMainOptionsContainer>
                      <ProfessionalPortalAssistanceMainOption span={12}>
                        <ProfessionalPortalAssistanceMainOptionPadding>
                          <ProfessionalPortalAssistanceMainOptionInner>
                            <ProfessionaLPortalAssistanceItems gutter={20}>
                              <ProfessionaLPortalAssistanceIconItem span={1} align="left">
                                <TextItemIcon>
                                  <FontAwesomeIcon icon={["fal", "spinner"]} spin/>
                                </TextItemIcon>
                              </ProfessionaLPortalAssistanceIconItem>
                              <ProfessionaLPortalAssistanceTextItem span={11} align="left">
                                <TextItemTitle>Fetching Products...</TextItemTitle>
                              </ProfessionaLPortalAssistanceTextItem>
                            </ProfessionaLPortalAssistanceItems>
                          </ProfessionalPortalAssistanceMainOptionInner>
                        </ProfessionalPortalAssistanceMainOptionPadding>
                      </ProfessionalPortalAssistanceMainOption>
                    </ProfessionalPortalAssistanceMainOptionsContainer>
                  )
                }
              </Col>
              {cart.length
                ? (
                  <Col span={12}>
                    <OutputSectionsPadding>
                      <OutputSectionsInner>
                        {discount || current_balance
                          ? (
                            <OutputSections gutter={20}>
                              <OutputSection span={6} align="left">Subtotal:</OutputSection>
                              <OutputSection span={6} align="right">${total.toLocaleString()}</OutputSection>
                            </OutputSections>
                          )
                          : null
                        }
                        {discount
                          ? (
                            <OutputSections gutter={20}>
                              <OutputSection span={6} align="left">Discount:</OutputSection>
                              <OutputSection span={6} align="right">-${discount.toLocaleString()}</OutputSection>
                            </OutputSections>
                          )
                          : null
                        }
                        {current_balance && (total - discount > 0)
                          ? (
                            <OutputSections gutter={20}>
                              <OutputSection span={6} align="left">Credits Applied:</OutputSection>
                              <OutputSection span={6} align="right">-${((current_balance >= (total - discount)) ? (total - discount) : current_balance).toLocaleString()}</OutputSection>
                            </OutputSections>
                          )
                          : null
                        }
                        <OutputSections gutter={20}>
                          <OutputSection span={6} align="left">Total Now:</OutputSection>
                          <OutputSection span={6} align="right">${(((total - discount - current_balance) > 0) ? (total - discount - current_balance) : 0).toLocaleString()}</OutputSection>
                        </OutputSections>
                      </OutputSectionsInner>
                    </OutputSectionsPadding>
                  </Col>
                )
                : null
              }
              <Col span={12}>
                <ButtonContainer gutter={20}>
                  <ProfessionalPortalAssistanceMainButtonContainer span={1}>
                    <Button blue type="button" disabled={product.isFetchingProducts} onClick={() => this.refreshProducts()}>{product.isFetchingProducts ? <FontAwesomeIcon icon={["fal", "sync"]} spin /> : <FontAwesomeIcon icon={["fal", "sync"]} />}</Button>
                  </ProfessionalPortalAssistanceMainButtonContainer>
                  <ProfessionalPortalAssistanceMainButtonContainer span={11}>
                    {cart.length
                      ? <Button blue type="button" onClick={() => this.confirmPurchase(total, discount)}>Review Order</Button>
                      : null
                    }
                    <Button type="button" onClick={() => closeProfessionalPortalServicesModal()} green>Cancel</Button>
                  </ProfessionalPortalAssistanceMainButtonContainer>
                </ButtonContainer>
              </Col>
            </Row>
          </Col>
       </ProfessionalPortalServicesInnerModal>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  accounts: state.accounts,
  relationship: state.relationship,
  user: state.user,
  session: state.session,
  product: state.product,
  account: state.account
});
const dispatchToProps = (dispatch) => ({
  changeSettingsTab: (tab) => dispatch(changeSettingsTab(tab)),
  navigateTo: (location, query, anchor) => dispatch(navigateTo(location, query, anchor)),
  closeProfessionalPortalServicesModal: () => dispatch(closeProfessionalPortalServicesModal()),
  dispatchRequest: (requestConfig) => dispatch(dispatchRequest(requestConfig)),
  showNotification: (type, title, message, metadata) => dispatch(showNotification(type, title, message, metadata)),
  getProducts: (params, override) => dispatch(getProducts(params, override)),
  createMultilineInvoice: (products, customer_id) => dispatch(createMultilineInvoice(products, customer_id)),
  openPaymentMethodsModal: (config) => dispatch(openPaymentMethodsModal(config)),
  getStripeExpandedCustomer: (override, customer_id) => dispatch(getStripeExpandedCustomer(override, customer_id)),
  getCustomerTransactions: (override, customer_id) => dispatch(getCustomerTransactions(override, customer_id))
});
export default connect(mapStateToProps, dispatchToProps)(ProfessionalPortalAssistanceModal);
