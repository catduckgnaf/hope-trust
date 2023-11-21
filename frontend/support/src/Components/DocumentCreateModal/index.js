import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import { Row, Col } from "react-simple-flex-grid";
import icons from "../../assets/icons";
import { Modal } from "react-responsive-modal";
import { closeCreateDocumentModal, createDocument, updateDocument, getDocument } from "../../store/actions/document";
import { showNotification } from "../../store/actions/notification";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CreatableSelect from "react-select/creatable";
import {
  DocumentMainContent,
  ViewDocumentModalInner,
  ViewDocumentModalInnerLogo,
  ViewDocumentModalInnerLogoImg,
  ViewDocumentModalInnerHeader,
  OptionContainer,
  OptionImageContainer,
  OptionTextContainer
} from "./style";
import {
  Button,
  InputWrapper,
  InputLabel,
  Input,
  InputHint,
  TextArea,
  RequiredStar,
  CheckBoxInput,
  SelectStyles,
  SelectWrapper,
  Select,
  HeavyFont
} from "../../global-components";
import LoaderOverlay from "../LoaderOverlay";
import { numbersLettersUnderscoresHyphens } from "../../utilities";
import ReactSelect, { components } from "react-select";
import ReactAvatar from "react-avatar";
import { orderBy, uniq } from "lodash";

const Option = (props) => {
  return (
    <components.Option {...props}>
      <OptionContainer>
        <OptionImageContainer><ReactAvatar size={25} src={`https://${process.env.REACT_APP_STAGE || "development"}-api.hopecareplan.com/support/users/get-user-avatar/${props.data.value}`} name={props.data.label} round /></OptionImageContainer>
        <OptionTextContainer>{props.data.label}</OptionTextContainer>
      </OptionContainer>
    </components.Option>
  );
};

class DocumentCreateModal extends Component {
  static propTypes = {
    user: PropTypes.oneOfType([
      PropTypes.bool.isRequired,
      PropTypes.instanceOf(Object).isRequired
    ]),
    session: PropTypes.object.isRequired,
    closeCreateDocumentModal: PropTypes.func.isRequired,
    createDocument: PropTypes.func.isRequired,
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { file, user, customer_support, session, defaults } = this.props;
    const categories = uniq(customer_support.core_settings.document_types.filter((d) => d.category).map((d) => d.category));
    const document_type_groups = categories.map((category) => {
      const option_items = customer_support.core_settings.document_types.filter((d) => d.category === category).map((item) => {
        return { value: item.type, label: item.type };
      });
      return { options: option_items, label: category };
    });
    const all_accounts = [...customer_support.accounts, ...customer_support.partners];
    const account_names = all_accounts.map((acc) => {
      return { value: acc.account_id, label: `${acc.first_name} ${acc.last_name}`, avatar: acc.avatar };
    }).filter((e) => e);
    const associated_accounts = all_accounts.filter((acc) => defaults && defaults.associated_account_id === acc.account_id)
    .map((acc) => {
      return { value: acc.account_id, label: `${acc.first_name} ${acc.last_name}` };
    }).filter((e) => e);
    const account = user && user.accounts ? user.accounts.find((account) => account.account_id === session.account_id) : {};
    const currentUser = account.users.find((u) => u.cognito_id === user.cognito_id);
    this.state = {
      categories,
      document_type_groups,
      loaderShow: false,
      loaderMessage: "",
      file,
      filename: file.name || "",
      currentUser,
      is_private: defaults ? defaults.private : false,
      document_type: defaults ? defaults.document_type : "",
      document_folder: defaults.folder,
      friendly_name: defaults ? defaults.friendly_name : "",
      description: defaults ? (defaults.description || "") : "",
      associated_account: associated_accounts.length ? associated_accounts[0] : null,
      account_names,
      static_type: defaults ? defaults.static_type : "",
      static_document: defaults ? defaults.static : false
    };
  }

  onChange = (e) => {
    const file = e.target.files[0];
    this.setState({ file, filename: file.name }, () => this.titleInput.value = file.name);
  };

  getSignedURL = async (doc) => {
    const { getDocument, showNotification } = this.props;
    this.setState({ [`${doc.id}_isloading`]: true });
    const URL = await getDocument(doc.filename, doc.account_id);
    if (URL.success) {
      this.setState({ [doc.id]: URL.payload }, () => document.getElementById(`link_edit_${doc.id}`).click());
    } else {
      showNotification("error", "", "Could not download this document.");
    }
    this.setState({ [`${doc.id}_isloading`]: false });
  };

  createNewDocument = async (file) => {
    let manualFile;
    const { filename, document_type, description, document_folder = "Other", associated_account, is_private, static_type, static_document } = this.state;
    const { createDocument, closeCreateDocumentModal, showNotification } = this.props;
    if ((file && file.name) || (this.fileInput && this.fileInput.files.length)) {
      if (this.fileInput && this.fileInput.files.length) manualFile = this.fileInput.files[0];
      let friendly_name = this.titleInput.value.replace("'", "’");
      this.setState({ loaderShow: true, loaderMessage: "Uploading..." });
      createDocument({
        filename: document_folder ? `${document_folder}/${filename}` : filename,
        friendly_name,
        description,
        size: file ? file.size : manualFile.size,
        document_type: document_type ? document_type.replace("'", "’") : "Other",
        private: is_private,
        static_type,
        static: static_document,
        associated_account_id: associated_account ? associated_account.value : null
      }, ((file && file.name) ? file : manualFile), (file && file.type ? file.type : manualFile.type))
      .then((created) => {
        if (created.success) {
          closeCreateDocumentModal();
          showNotification("success", "", "New document created.");
        } else {
          showNotification("error", "", created.message);
        }
        this.setState({ loaderShow: false, loaderMessage: "" });
      })
      .catch((error) => {
        this.setState({ loaderShow: false, loaderMessage: "" });
        showNotification("error", "", error.message);
      });
    } else {
      showNotification("error", "", "You need to choose a file to upload.");
    }
  };

  updateDocument = async () => {
    const { document_type, description, associated_account, is_private, static_type, static_document, document_folder } = this.state;
    const { updateDocument, closeCreateDocumentModal, showNotification, defaults } = this.props;
    let friendly_name = this.titleInput.value.replace("'", "’");
    this.setState({ loaderShow: true, loaderMessage: "Uploading..." });
    const updated = await updateDocument(defaults.id, {
      description,
      friendly_name,
      document_type: document_type ? document_type.replace("'", "’") : "Other",
      private: is_private,
      associated_account_id: associated_account ? associated_account.value : null,
      static_type,
      static: static_document
    }, { new_folder: document_folder, new_key: friendly_name, old_folder: defaults.folder, old_key: defaults.original_name, parent_folder: defaults.account_id, extension: defaults.file_type });
    if (updated.success) {
      this.setState({ loaderShow: false, loaderMessage: "" });
      showNotification("success", "Document Updated", "Your document was successfully updated.");
      closeCreateDocumentModal();
    } else {
      this.setState({ loaderShow: false, loaderMessage: "" });
      showNotification("error", "Update failed", updated.message);
    }
  };

  handleCreateFolder = (value) => {
    if (value.match("^[A-Za-z0-9 _-]+$")) {
      this.setState({ document_folder: value });
    } else {
      alert("Folder name is not valid.");
    }
  };

  render() {
    const { creatingDocument, closeCreateDocumentModal, defaults, updating, viewing, user, documents } = this.props;
    const { categories, document_type_groups, loaderShow, loaderMessage, file, document_type, description, document_folder, associated_account, account_names, is_private, static_type, static_document } = this.state;
    const does_own_associated_document = defaults && (user.cognito_id === defaults.cognito_id);

    let document_folders = categories.map((folder) => {
      return { value: folder, label: folder };
    });
    documents.documents.forEach((doc) => {
      if (!document_folders.map((d) => d.value).includes(doc.folder)) document_folders.push({ value: doc.folder, label: doc.folder });
    });
    document_folders = orderBy(document_folders, "value", "asc");

    return (
      <Modal animationDuration={100} styles={{ modal: { maxWidth: "650px", borderRadius: "5px", marginTop: 50, zIndex: 2147483646 }, overlay: { zIndex: 2147483646 } }} open={creatingDocument} onClose={() => closeCreateDocumentModal()} center>
        <ViewDocumentModalInner align="middle" justify="center" isloading={loaderShow ? 1 : 0} >
        <LoaderOverlay show={loaderShow} message={loaderMessage} />
          <Col span={12}>
            <ViewDocumentModalInnerLogo span={12}>
              <ViewDocumentModalInnerLogoImg alt="HopeTrust Document Logo" src={icons.colorLogoOnly} />
            </ViewDocumentModalInnerLogo>
          </Col>
          <DocumentMainContent span={12}>
            <Row>
               {!updating && !viewing
                ? <ViewDocumentModalInnerHeader span={12}>New Document</ViewDocumentModalInnerHeader>
                : null
              }
              {updating || viewing
                ? <ViewDocumentModalInnerHeader span={12}>{defaults.friendly_name || defaults.filename || "Untitled"}</ViewDocumentModalInnerHeader>
                : null
              }

              {!updating && !viewing
                ? (
                  <Col span={12}>
                    {!file.name
                      ? (
                        <InputWrapper>
                          <InputLabel>
                            <Input
                              style={{ opacity: 0, position: "absolute", height: "100%" }}
                              onChange={(e) => this.onChange(e)}
                              ref={(input) => this.fileInput = input}
                              type="file"
                              accept=".heic, .hevc, .heif, .xlsx, .xls, .pdf, .png, .gif, .jpg, .jpeg, .doc, .docx, .rtf, application/msword, application/pdf, .ppt, .pptx, .txt, .pages"
                            />
                            <Button type="button" rounded nomargin widthPercent={100}>Choose file</Button>
                          </InputLabel>
                        </InputWrapper>
                      )
                      : null
                    }
                  </Col>
                )
                : (
                  <>
                    <Button type="button" onClick={() => this.getSignedURL(defaults)} outline green rounded nomargin widthPercent={100} marginbottom={20}>{this.state[`${defaults.id}_isloading`] ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : "View Document"}</Button>
                    <a rel="noopener noreferrer" target="_blank" id={`link_edit_${defaults.id}`} href={this.state[defaults.id] || ""} download={defaults.filename}>{null}</a>
                  </>
                )
              }

              <Col span={12}>
                <InputWrapper>
                  <InputLabel><RequiredStar>*</RequiredStar> Title:</InputLabel>
                  <Input disabled={viewing} ref={(input) => this.titleInput = input} onKeyPress={numbersLettersUnderscoresHyphens} type="text" defaultValue={defaults ? (defaults.friendly_name || defaults.filename) : file.name} placeholder="Add a title..." />
                  {!is_private && associated_account && does_own_associated_document
                    ? <InputHint warning={1}>Note: This document name will be public to linked accounts.</InputHint>
                    : null
                  }
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Folder</InputLabel>
                  <CreatableSelect
                    styles={{
                      container: (base, state) => ({
                        ...base,
                        opacity: state.isDisabled ? ".5" : "1",
                        backgroundColor: "transparent",
                        zIndex: 1001
                      }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 1001
                      }),
                      placeholder: (base) => ({
                        ...base,
                        fontWeight: 300,
                        fontSize: "13px",
                        lineHeight: "13px",
                        opacity: "0.5"
                      }),
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 1001
                      }),
                      control: (base) => ({
                        ...base,
                        ...SelectStyles
                      }),
                      valueContainer: (base) => ({
                        ...base,
                        fontSize: "13px",
                        paddingLeft: 0
                      })
                    }}
                    isClearable
                    isSearchable
                    name="document_folder"
                    placeholder="Choose a document folder, or create a new one..."
                    clearValue={() => this.setState({ document_folder: "" })}
                    onChange={(val) => this.setState({ document_folder: val ? val.value : "" })}
                    value={document_folder ? { value: document_folder, label: document_folder } : null}
                    options={document_folders}
                    onCreateOption={(value) => this.handleCreateFolder(value)}
                    formatCreateLabel={(value) => `Click or press Enter to create new folder "${value}"`}
                    isDisabled={viewing}
                    onBlur={(a) => {
                      if (a.currentTarget.value && (!document_folder || (document_folder !== a.currentTarget.value))) this.handleCreateFolder(a.currentTarget.value);
                    }}
                  />
                  {!is_private && associated_account && does_own_associated_document
                    ? <InputHint warning={1}>Note: This document folder name will be public to linked accounts.</InputHint>
                    : null
                  }
                </InputWrapper>
              </Col>
              <Col span={12}>
                <InputWrapper>
                  <InputLabel marginbottom={10}><RequiredStar>*</RequiredStar> Document Type</InputLabel>
                  <CreatableSelect
                    styles={{
                      container: (base, state) => ({
                        ...base,
                        opacity: state.isDisabled ? ".5" : "1",
                        backgroundColor: "transparent",
                        zIndex: 1000
                      }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 1000
                      }),
                      placeholder: (base) => ({
                        ...base,
                        fontWeight: 300,
                        fontSize: "13px",
                        lineHeight: "13px",
                        opacity: "0.5"
                      }),
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 1000
                      }),
                      control: (base) => ({
                        ...base,
                        ...SelectStyles
                      }),
                      valueContainer: (base) => ({
                        ...base,
                        fontSize: "13px",
                        paddingLeft: 0
                      })
                    }}
                    isClearable
                    isSearchable
                    name="document_type"
                    placeholder="Choose a document type, type to search..."
                    clearValue={() => this.setState({ document_type: "" })}
                    onChange={(val) => this.setState({ document_type: val ? val.value : "" })}
                    value={(document_type) ? { value: document_type, label: document_type } : null}
                    options={document_type_groups}
                    onCreateOption={(val) => this.setState({ document_type: val })}
                    formatCreateLabel={(value) => `Click or press Enter to create new document type "${value}"`}
                    isDisabled={viewing}
                    onBlur={(a) => {
                      if (a.currentTarget.value && (!document_type || (document_type !== a.currentTarget.value))) this.setState({ document_type: a.currentTarget.value });
                    }}
                  />
                </InputWrapper>
              </Col>
              {!static_document && (does_own_associated_document || !defaults)
                ? (
                  <>
                    <Col span={12}>
                      <InputWrapper>
                        <InputLabel marginbottom={10}>Link to account?</InputLabel>
                        <ReactSelect
                          styles={{
                            container: (base, state) => ({
                              ...base,
                              opacity: state.isDisabled ? ".5" : "1",
                              backgroundColor: "transparent",
                              zIndex: 999
                            }),
                            multiValue: (base) => ({
                              ...base,
                              borderRadius: "15px",
                              padding: "2px 10px"
                            }),
                            menu: (base) => ({
                              ...base,
                              zIndex: 999
                            }),
                            menuPortal: (base) => ({
                              ...base,
                              zIndex: 999
                            }),
                            placeholder: (base) => ({
                              ...base,
                              fontWeight: 300,
                              fontSize: "13px",
                              lineHeight: "13px"
                            }),
                            control: (base) => ({
                              ...base,
                              ...SelectStyles
                            }),
                            valueContainer: (base) => ({
                              ...base,
                              fontSize: "13px",
                              paddingLeft: 0
                            })
                          }}
                          components={{ Option }}
                          isSearchable
                          isClearable
                          name="associated_account"
                          placeholder="Choose an account from the list..."
                          clearValue={() => this.setState({ associated_account: null, is_private: false, static_document: false, static_type: "" })}
                          onChange={(aa) => this.setState({ associated_account: aa, is_private: true, static_document: false, static_type: "" })}
                          value={associated_account}
                          options={account_names}
                          isDisabled={viewing}
                        />
                      </InputWrapper>
                    </Col>
                  </>
                )
                : null
              }
              {does_own_associated_document || !defaults
                ? (
                  <>
                    {associated_account
                      ? (
                        <Col span={12}>
                          <InputWrapper>
                            <InputLabel marginbottom={10}>{`Hide this document from ${associated_account.label}'s account?`}</InputLabel>
                            <CheckBoxInput
                              defaultChecked={is_private}
                              onChange={(event) => this.setState({ is_private: event.target.checked, static_document: false, static_type: "" })}
                              type="checkbox"
                              id="is_private"
                              disabled={viewing}
                            />
                          </InputWrapper>
                        </Col>
                      )
                      : null
                    }
                  </>
                )
                : null
              }
              {!associated_account
                ? (
                  <Col span={12}>
                    <InputWrapper>
                      <InputLabel marginbottom={10}>Is this a static document?</InputLabel>
                      <CheckBoxInput
                        defaultChecked={static_document}
                        onChange={(event) => this.setState({ static_document: event.target.checked, associated_account: null, is_private: false })}
                        type="checkbox"
                        id="static_document"
                        disabled={viewing}
                      />
                    </InputWrapper>
                  </Col>
                )
                : null
              }
              {static_document
                ? (
                  <Col span={12}>
                    <SelectWrapper>
                      <InputLabel><RequiredStar>*</RequiredStar> Static Document Type</InputLabel>
                      <Select
                        id="static_type"
                        value={static_type || ""}
                        onChange={(event) => this.setState({ [event.target.id]: event.target.value, associated_account: null, is_private: false })}>
                        <option disabled value="">Choose a static document type</option>
                        <option value="client">Client</option>
                        <option value="partner">Partner</option>
                        <option value="benefits">Benefits</option>
                      </Select>
                      {static_type
                        ? <InputHint warning={1}>Note: This document will display in <HeavyFont>every</HeavyFont> {static_type} document vault.</InputHint>
                        : null
                      }
                    </SelectWrapper>
                  </Col>
                )
                : null
              }
              <Col span={12}>
                <InputWrapper>
                  <InputLabel>Description (optional): ({255 - description.length} characters remaining)</InputLabel>
                  <TextArea disabled={viewing} value={description} maxLength={255} onKeyPress={numbersLettersUnderscoresHyphens} onChange={(event) => this.setState({ description: event.target.value })} onPaste={(event) => event.clipboardData.getData("text/plain").slice(0, 255)} rows={4} placeholder="Add a description..."></TextArea>
                </InputWrapper>
              </Col>

              <Col span={12}>
                {!updating && !viewing
                  ? <Button type="button" onClick={() => this.createNewDocument(file)} outline green rounded nomargin>Create Document</Button>
                  : null
                }
                {updating
                  ? <Button type="button" onClick={() => this.updateDocument()} outline green rounded nomargin>Update Document</Button>
                  : null
                }
                <Button type="button" onClick={() => closeCreateDocumentModal()} outline danger rounded>{(!updating && !viewing) ? "Cancel" : "Close"}</Button>
              </Col>
            </Row>
          </DocumentMainContent>
        </ViewDocumentModalInner>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
  session: state.session,
  documents: state.documents,
  customer_support: state.customer_support
});
const dispatchToProps = (dispatch) => ({
  closeCreateDocumentModal: () => dispatch(closeCreateDocumentModal()),
  createDocument: (document, blob, type) => dispatch(createDocument(document, blob, type)),
  updateDocument: (id, updates, new_file_config) => dispatch(updateDocument(id, updates, new_file_config)),
  showNotification: (type, title, message, metadata) => dispatch(showNotification(type, title, message, metadata)),
  getDocument: (key, associated_account_id) => dispatch(getDocument(key, associated_account_id)),
});
export default connect(mapStateToProps, dispatchToProps)(DocumentCreateModal);
