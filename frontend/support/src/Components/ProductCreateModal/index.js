import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import { Row, Col } from "react-simple-flex-grid";
import icons from "../../assets/icons";
import { Modal } from "react-responsive-modal";
import { closeCreateProductModal, createProduct, updateProduct } from "../../store/actions/product";
import { showNotification } from "../../store/actions/notification";
import CreatableSelect from "react-select/creatable";
import { default_features } from "../../utilities";
import {
  SecurityQuestionMainContent,
  ViewSecurityQuestionModalInner,
  ViewSecurityQuestionModalInnerLogo,
  ViewSecurityQuestionModalInnerLogoImg,
  ViewSecurityQuestionModalInnerHeader
} from "./style";
import {
  Button,
  Input,
  Select,
  InputWrapper,
  InputLabel,
  InputHint,
  TextArea,
  CheckBoxInput,
  RequiredStar,
  SelectStyles
} from "../../global-components";
import LoaderOverlay from "../LoaderOverlay";
import { numbersLettersUnderscoresHyphens, allowNumbersAndDecimalsOnly, capitalize } from "../../utilities";

class ProductCreateModal extends Component {
  static propTypes = {
    user: PropTypes.oneOfType([
      PropTypes.bool.isRequired,
      PropTypes.instanceOf(Object).isRequired
    ]),
    session: PropTypes.object.isRequired,
    closeCreateProductModal: PropTypes.func.isRequired,
    createProduct: PropTypes.func.isRequired,
    updateProduct: PropTypes.func.isRequired
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { defaults = {}, product } = this.props;
    const all_product_tags = [];
    const all_product_categories = [];
    product.list.forEach((p) => {
      (p.tags || []).forEach((c) => {
        if (!all_product_tags.includes(c)) all_product_tags.push(c);
      });
      if (!all_product_categories.includes(p.category)) all_product_categories.push(p.category);
    });
    this.state = {
      all_product_tags,
      all_product_categories,
      title: defaults.title || "",
      product_id: defaults.product_id || "",
      price_id: defaults.price_id || "",
      description: defaults.description || "",
      amount: ((defaults.amount || 0)/100) || 0,
      status: (defaults && defaults.status === "active") ? true : false,
      type: defaults.type || "",
      tags: defaults.tags || [],
      features: defaults.features || [],
      slug: defaults.slug || "",
      contacts: defaults.contacts || [],
      category: defaults.category || "",
    };
  }

  createProduct = async () => {
    const {
      product_id,
      price_id,
      description,
      title,
      amount,
      status,
      type,
      tags,
      features,
      slug,
      contacts,
      category
    } = this.state;
    const { createProduct, closeCreateProductModal, showNotification } = this.props;
    if (title && description && tags.length && category) {
      this.setState({ loaderShow: true, loaderMessage: "Updating..." });
      const created = await createProduct({
        product_id,
        price_id,
        description,
        title,
        amount: amount ? (amount * 100) : 0,
        status: status ? "active" : "inactive",
        type,
        tags,
        features,
        slug,
        contacts,
        category
      });
      if (created.success) {
        this.setState({ loaderShow: false, loaderMessage: "" });
        showNotification("success", "Product Created", "Your product was successfully created.");
        closeCreateProductModal();
      } else {
        this.setState({ loaderShow: false, loaderMessage: "" });
        showNotification("error", "Creation failed", created.message);
      }
    } else {
      showNotification("error", "Required Fields", "You must fill in all required fields to create a product.");
    }
  };

  updateProduct = async () => {
    const {
      product_id,
      price_id,
      description,
      title,
      amount,
      status,
      type,
      tags,
      features,
      slug,
      contacts,
      category
    } = this.state;
    const { updateProduct, closeCreateProductModal, showNotification, defaults } = this.props;
    if (product_id && title && description && tags.length && category) {
      this.setState({ loaderShow: true, loaderMessage: "Updating..." });
      const updated = await updateProduct(defaults.id, {
        product_id,
        price_id,
        description,
        title,
        amount: amount ? (amount * 100) : 0,
        status: status ? "active" : "inactive",
        type,
        tags,
        features,
        slug,
        contacts,
        category
      });
      if (updated.success) {
        this.setState({ loaderShow: false, loaderMessage: "" });
        showNotification("success", "Product Updated", "Your product was successfully updated.");
        closeCreateProductModal();
      } else {
        this.setState({ loaderShow: false, loaderMessage: "" });
        showNotification("error", "Update failed", updated.message);
      }
    } else {
      showNotification("error", "Required Fields", "You must fill in all required fields to create a product.");
    }
  };

  updateSelectInput = (value, actionOptions) => {
    switch (actionOptions.action) {
      case "remove-value":
        let difference = this.state[actionOptions.name].filter((state) => state !== actionOptions.removedValue.value);
        this.setState({ [actionOptions.name]: difference });
        break;
      case "select-option":
        this.setState({ [actionOptions.name]: value.map((e) => e.value) });
        break;
      case "create-option":
        const new_option = value[value.length - 1];
        this.setState({ [actionOptions.name]: [...this.state[actionOptions.name], new_option.value] });
        break;
      case "clear":
        this.setState({ [actionOptions.name]: [] });
        break;
      default:
        break;
    }
  };

  render() {
    const { show_product_modal, closeCreateProductModal, updating, viewing } = this.props;
    const {
      loaderShow,
      loaderMessage,
      all_product_tags,
      product_id,
      price_id,
      description,
      title,
      amount,
      status,
      type,
      tags,
      features,
      slug,
      contacts,
      category,
      all_product_categories
    } = this.state;

    return (
      <Modal animationDuration={100} styles={{ modal: { maxWidth: "650px", borderRadius: "5px", marginTop: 50, zIndex: 2147483646 }, overlay: { zIndex: 2147483646 } }} open={show_product_modal} onClose={() => closeCreateProductModal()} center>
        <ViewSecurityQuestionModalInner align="middle" justify="center" isloading={loaderShow ? 1 : 0} >
        <LoaderOverlay show={loaderShow} message={loaderMessage} />
          <Col span={12}>
            <ViewSecurityQuestionModalInnerLogo span={12}>
              <ViewSecurityQuestionModalInnerLogoImg alt="HopeTrust Document Logo" src={icons.colorLogoOnly} />
            </ViewSecurityQuestionModalInnerLogo>
          </Col>
          <SecurityQuestionMainContent span={12}>
            <Row>
              {!updating && !viewing
                ? <ViewSecurityQuestionModalInnerHeader span={12}>New Product</ViewSecurityQuestionModalInnerHeader>
                : <ViewSecurityQuestionModalInnerHeader span={12}>{updating ? "Updating" : "Viewing"} Product</ViewSecurityQuestionModalInnerHeader>
              }
              <Col span={12}>
                <InputWrapper>
                  <InputLabel>Product Type</InputLabel>
                  <Select defaultValue={type} onChange={(event) => this.setState({ type: event.target.value })}>
                    <option disabled value="">Choose a product type</option>
                    <option value="one_time">One Time</option>
                    <option value="monthly">Monthly</option>
                  </Select>
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel><RequiredStar>*</RequiredStar> Title:</InputLabel>
                  <Input type="text" disabled={viewing} value={title} onChange={(event) => this.setState({ title: event.target.value })} placeholder="Enter a title for this product..." />
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel>Product Slug:</InputLabel>
                  <Input type="text" disabled={viewing} value={slug} onChange={(event) => this.setState({ slug: event.target.value })} placeholder="Enter a product slug..." />
                  <InputHint>Note: If left empty, a slug will be created from the product title.</InputHint>
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel>Stripe Product ID:</InputLabel>
                  <Input type="text" readOnly={product_id} value={product_id} onChange={(event) => this.setState({ product_id: event.target.value })} placeholder="Enter a Stripe product ID..." />
                  {!product_id
                    ? <InputHint>Note: If left empty, a new product will be created.</InputHint>
                    : null
                  }
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel>Stripe Price ID:</InputLabel>
                  <Input type="text" disabled={viewing} value={price_id} onChange={(event) => this.setState({ price_id: event.target.value })} placeholder="Enter a Stripe price ID..." />
                  <InputHint>Note: If left empty, a new Stripe price will be created.</InputHint>
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel>Price:</InputLabel>
                  <Input type="number" disabled={viewing} value={amount} onChange={(event) => this.setState({ amount: event.target.value })} onKeyPress={allowNumbersAndDecimalsOnly} placeholder="Enter a price for this product..." />
                  <InputHint>Note: If you enter a Stripe Price ID, the price of the related Stripe product will be used.</InputHint>
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel><RequiredStar>*</RequiredStar> Description: ({512 - description.length} characters remaining)</InputLabel>
                  <TextArea disabled={viewing} value={description} maxLength={512} onKeyPress={numbersLettersUnderscoresHyphens} onChange={(event) => this.setState({ description: event.target.value })} onPaste={(event) => event.clipboardData.getData("text/plain").slice(0, 512)} rows={4} placeholder="Add a description..."></TextArea>
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Category</InputLabel>
                  <CreatableSelect
                    styles={{
                      container: (base, state) => ({
                        ...base,
                        opacity: state.isDisabled ? ".5" : "1",
                        backgroundColor: "transparent"
                      }),
                      control: (base) => ({
                        ...base,
                        ...SelectStyles,
                        borderBottom: "1px solid hsl(0,0%,80%)"
                      }),
                      valueContainer: (base) => ({
                        ...base,
                        fontSize: "13px",
                        paddingLeft: 0
                      }),
                      placeholder: (base) => ({
                        ...base,
                        fontSize: "12px",
                        opacity: "0.5",
                        color: "black"
                      }),
                      multiValue: (base) => ({
                        ...base,
                        borderRadius: "15px",
                        padding: "2px 10px"
                      }),
                      menu: (base) => ({
                        ...base
                      }),
                      menuPortal: (base) => ({
                        ...base
                      })
                    }}
                    isSearchable
                    name="category"
                    placeholder="Choose from the list or type a new one..."
                    backspaceRemovesValue={true}
                    onCreateOption={(value) => this.setState({ category: value })}
                    onChange={(value) => this.setState({ category: value.value })}
                    value={category ? { value: category, label: category } : null}
                    formatCreateLabel={(value) => `Click or press Enter to create new category "${value}"`}
                    options={all_product_categories.filter((e) => e).map((c) => {
                      return { value: c, label: capitalize(c) };
                    })}
                    isDisabled={viewing}
                    className="select-menu"
                    classNamePrefix="ht"
                  />
                  <InputHint>Note: This product will nest under this category on the products view.</InputHint>
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Tags</InputLabel>
                  <CreatableSelect
                    styles={{
                      container: (base, state) => ({
                        ...base,
                        opacity: state.isDisabled ? ".5" : "1",
                        backgroundColor: "transparent"
                      }),
                      control: (base) => ({
                        ...base,
                        ...SelectStyles,
                        borderBottom: "1px solid hsl(0,0%,80%)"
                      }),
                      valueContainer: (base) => ({
                        ...base,
                        fontSize: "13px",
                        paddingLeft: 0
                      }),
                      placeholder: (base) => ({
                        ...base,
                        fontSize: "12px",
                        opacity: "0.5",
                        color: "black"
                      }),
                      multiValue: (base) => ({
                        ...base,
                        borderRadius: "15px",
                        padding: "2px 10px"
                      }),
                      menu: (base) => ({
                        ...base
                      }),
                      menuPortal: (base) => ({
                        ...base
                      })
                    }}
                    isClearable
                    isSearchable
                    isMulti
                    name="tags"
                    placeholder="Choose from the list or type a new one...(select all that apply)"
                    backspaceRemovesValue={true}
                    onChange={this.updateSelectInput}
                    defaultValue={tags.filter((e) => e).map((c) => {
                      return { value: c, label: capitalize(c) };
                    })
                    }
                    options={all_product_tags.filter((e) => e).map((c) => {
                      return { value: c, label: capitalize(c) };
                    })}
                    isDisabled={viewing}
                    className="select-menu"
                    classNamePrefix="ht"
                  />
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel marginbottom={10}>Features</InputLabel>
                  <CreatableSelect
                    styles={{
                      container: (base, state) => ({
                        ...base,
                        opacity: state.isDisabled ? ".5" : "1",
                        backgroundColor: "transparent"
                      }),
                      control: (base) => ({
                        ...base,
                        ...SelectStyles,
                        borderBottom: "1px solid hsl(0,0%,80%)"
                      }),
                      valueContainer: (base) => ({
                        ...base,
                        fontSize: "13px",
                        paddingLeft: 0
                      }),
                      placeholder: (base) => ({
                        ...base,
                        fontSize: "12px",
                        opacity: "0.5",
                        color: "black"
                      }),
                      multiValue: (base) => ({
                        ...base,
                        borderRadius: "15px",
                        padding: "2px 10px"
                      }),
                      menu: (base) => ({
                        ...base
                      }),
                      menuPortal: (base) => ({
                        ...base
                      })
                    }}
                    isClearable
                    isSearchable
                    isMulti
                    name="features"
                    placeholder="Choose from the list or type a new one...(select all that apply)"
                    backspaceRemovesValue={true}
                    onChange={this.updateSelectInput}
                    defaultValue={features.filter((e) => e).map((f) => {
                      return { value: f, label: default_features.find((df) => df.value === f).label };
                    })
                    }
                    options={default_features}
                    isDisabled={viewing}
                    className="select-menu"
                    classNamePrefix="ht"
                  />
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel>Contact(s):</InputLabel>
                    <CreatableSelect
                      styles={{
                      container: (base, state) => ({
                        ...base,
                        opacity: state.isDisabled ? ".5" : "1",
                        backgroundColor: "transparent"
                      }),
                      control: (base) => ({
                        ...base,
                        ...SelectStyles,
                        borderBottom: "1px solid hsl(0,0%,80%)"
                      }),
                      valueContainer: (base) => ({
                        ...base,
                        fontSize: "13px",
                        paddingLeft: 0
                      }),
                      placeholder: (base) => ({
                        ...base,
                        fontSize: "12px",
                        opacity: "0.5",
                        color: "black"
                      }),
                      multiValue: (base) => ({
                        ...base,
                        borderRadius: "15px",
                        padding: "2px 10px"
                      }),
                      menu: (base) => ({
                        ...base
                      }),
                      menuPortal: (base) => ({
                        ...base
                      })
                      }}
                      isClearable
                      isSearchable
                      isMulti
                      name="contacts"
                      placeholder="Add a single or multiple contact email(s)..."
                      backspaceRemovesValue={true}
                      onChange={this.updateSelectInput}
                      defaultValue={contacts.filter((e) => e).map((c) => {
                        return { value: c, label: c };
                      })
                      }
                      isDisabled={viewing}
                      className="select-menu"
                      classNamePrefix="ht"
                    />
                  <InputHint>List of email addresses whom will be notified when this product is purchased.</InputHint>
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper marginbottom={15}>
                  <InputLabel marginbottom={10}>Is this product active?</InputLabel>
                  <CheckBoxInput
                    defaultChecked={status}
                    onChange={(event) => this.setState({ status: event.target.checked })}
                    type="checkbox"
                    id="status"
                    disabled={viewing}
                  />
                </InputWrapper>
              </Col>

              <Col span={12}>
                {!updating && !viewing
                  ? <Button type="button" onClick={() => this.createProduct()} outline green rounded nomargin>Create Product</Button>
                  : null
                }
                {updating
                  ? <Button type="button" onClick={() => this.updateProduct()} outline green rounded nomargin>Update Product</Button>
                  : null
                }
                <Button type="button" onClick={() => closeCreateProductModal()} outline danger rounded>{(!updating && !viewing) ? "Cancel" : "Close"}</Button>
              </Col>
            </Row>
          </SecurityQuestionMainContent>
        </ViewSecurityQuestionModalInner>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
  session: state.session,
  product: state.product
});
const dispatchToProps = (dispatch) => ({
  closeCreateProductModal: () => dispatch(closeCreateProductModal()),
  createProduct: (question) => dispatch(createProduct(question)),
  updateProduct: (id, updates) => dispatch(updateProduct(id, updates)),
  showNotification: (type, title, message, metadata) => dispatch(showNotification(type, title, message, metadata)),
});
export default connect(mapStateToProps, dispatchToProps)(ProductCreateModal);
