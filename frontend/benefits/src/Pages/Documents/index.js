import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import { getDocument, openCreateDocumentModal, getDocuments, deleteDocument, updateDocumentsView } from "../../store/actions/document";
import { showNotification } from "../../store/actions/notification";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { throttle, debounce } from "throttle-debounce";
import moment from "moment";
import { isMobile, isTablet } from "react-device-detect";
import {
  ViewContainer,
  Page,
  PageHeader,
  PageHeaderSecondary,
  PageAction,
  Button,
  HeavyFont,
  SelectLabel
} from "../../global-components";
import {
  DocumentCards,
  DocumentCard,
  DocumentCardPadding,
  DocumentCardInner,
  DocumentCardContent,
  DocumentCardSection,
  DocumentCardIcon,
  DocumentCardInnerItem,
  DocumentCardInnerViewButton,
  DocumentCardInnerButtons,
  DocumentCardInnerButtonContainer,
  DocumentFeedOptionsRow,
  BackButtonRow,
  DocumentFeedOptionsContainer,
  DocumentFeedOptions,
  DocumentFeedOptionSection,
  DocumentFeedSearchInputWrapper,
  DocumentFeedSearchInput,
  DocumentFeedSearchSelectWrapper,
  DocumentFeedSearchSelect,
  DocumentFeedSearchMessage,
  DocumentFeedSearchText,
  DocumentFeedSearchAction,
  DocumentFeedSearchButtonWrapper,
  CurrentVaultUsage,
  TotalVaultUsage
} from "./style";
import icons from "./icons";
import { hasWhiteSpace, getReadableFileSizeString, search } from "../../utilities";
import { document_types } from "../../Components/DocumentCreateModal/utilities";

class Documents extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    getDocument: PropTypes.func.isRequired,
    showNotification: PropTypes.func.isRequired,
    openCreateDocumentModal: PropTypes.func.isRequired,
    getDocuments: PropTypes.func.isRequired,
  }
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { user, session, docs } = props;
    document.title = "Documents";
    const account = (user && user.accounts) ? user.accounts.find((account) => account.account_id === session.account_id) : {};
    const current_plan = user.is_partner && !session.is_switching ? account.partner_plan : account.user_plan;
    this.state = {
      documents: docs.foldered[docs.view] || [],
      filter: {
        document_type: ""
      },
      term: "",
      isLoading: false,
      fetching: {},
      current_plan
    };
    this.autocompleteSearchDebounced = debounce(500, this.onTermSelect);
    this.autocompleteSearchThrottled = throttle(500, this.onTermSelect);
  }

  componentDidMount() {
    const { getDocuments, docs } = this.props;
    if ((!docs.requested && !docs.isFetching)) getDocuments();
  }

  onChange = (e) => {
    const { showNotification, openCreateDocumentModal } = this.props;
    const file = e.target.files[0];
    if (file) {
      openCreateDocumentModal(file);
    } else {
      showNotification("error", "", "You must choose a file.");
    }
  };

  getUploader = (cognito_id) => {
    const { user, session } = this.props;
    const account = user.accounts.find((account) => account.account_id === session.account_id);
    const owner = account.users ? account.users.find((u) => u.cognito_id === cognito_id) : false;
    if (owner) return owner;
    return false;
  };

  getAssociatedAccount = (account_id) => {
    if (account_id) {
      const { clients } = this.props;
      const account = clients.list.find((account) => account.account_id === account_id);
      if (account) return account;
      return false;
    }
    return false;
  };

  getSignedURL = async (doc) => {
    const { getDocument, showNotification } = this.props;
    this.setState({ [`${doc.id}_isloading`]: true, fetching: { name: doc.filename, id: doc.id } });
    const URL = await getDocument(doc.original_name || doc.filename, doc.account_id);
    if (URL.success) {
      this.setState({ [doc.id]: URL.payload }, () => document.getElementById("link_url").click());
    } else {
      showNotification("error", "", "Could not download this document.");
    }
    this.setState({ [`${doc.id}_isloading`]: false });
  };

  deleteDocument = (key, friendly) => {
    const { showNotification, deleteDocument } = this.props;
    showNotification("delete", "Are you sure you want to delete this document?", "", { action: () => deleteDocument(key, friendly) });
  };

  changeQuery = (event) => {
    this.setState({ term: event.target.value, isLoading: true }, () => {
      const term = this.state.term;
      if (term.length < 5) {
        this.autocompleteSearchThrottled(event);
      } else {
        this.autocompleteSearchDebounced(event);
      }
    });
  };

  onDocumentTypeSelect = (event) => this.updateFilter("document_type", event.target.value);

  onTermSelect = () => {
    const { docs, updateDocumentsView } = this.props;
    const { documents, term } = this.state;
    setTimeout(() => {
      if (term.length) {
        this.setState({
          term,
          documents: search(["document_type", "friendly_name", "filename", "description", "permissions"], (documents || docs.documents), term),
          isLoading: false
        });
      } else {
        this.setState({
          term: "",
          documents: [],
          isLoading: false,
        }, () => updateDocumentsView("folder"));
      }
    }, 500);
  };

  clearFilters = () => {
    const { updateDocumentsView } = this.props;
    this.setState({
      documents: [],
      filter: {},
      term: "",
    }, () => updateDocumentsView("folder"));
    this.termSelect.value= "";
    if (this.documentTypeSelect) this.documentTypeSelect.value = "";
  };

  updateFilter = (id, value) => {
    let { filter, term } = this.state;
    const { docs } = this.props;
    let updated = [];
    let searchable = docs.foldered[docs.view] ? docs.foldered[docs.view] : docs.documents;
    if (value) filter[id] = value;
    if (term) searchable = search(["document_type", "friendly_name", "filename", "description", "permissions"], searchable, term);
    if (Object.keys(filter).length) {
      updated = searchable.filter((item) => {
        for (let key in filter) {
          if (item[key] === "undefined" || item[key] !== filter[key]) return false;
        }
        return true;
      });
    } else {
      updated = searchable;
    }
    this.setState({ documents: updated });
  };

  render() {
    const { isLoading, documents, term, filter, fetching, current_plan } = this.state;
    const { openCreateDocumentModal, docs, updateDocumentsView, getDocuments } = this.props;
    return (
      <ViewContainer>
        <a rel="noopener noreferrer" target="_blank" id="link_url" href={this.state[fetching.id] || ""} download={fetching.name}>{null}</a>
        <Page>
          <PageHeader paddingleftmobile={15} xs={12} sm={12} md={6} lg={6} xl={6} align="left">Document Vault
            <PageHeaderSecondary>
              Using {docs.isFetching ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : <CurrentVaultUsage limit={current_plan.vault_limit} usage={docs.usage}>{docs.usage ? getReadableFileSizeString(docs.usage, true) : "0KB"}</CurrentVaultUsage>} of <TotalVaultUsage>5GB</TotalVaultUsage>
            </PageHeaderSecondary>
          </PageHeader>
          <PageAction xs={12} sm={12} md={6} lg={6} xl={6} align={isMobile && !isTablet ? "left" : "right"}>
            <label htmlFor="new_document">
              <input
                id="new_document"
                type="file"
                accept=".heic, .hevc, .heif, .xlsx, .xls, .pdf, .png, .gif, .jpg, .jpeg, .doc, .docx, application/msword, application/pdf, .ppt, .pptx, .txt"
                onChange={(e) => this.onChange(e)}
                style={{ opacity: 0, position: "absolute", height: "100%", width: "160px" }}
              />
              <Button secondary outline blue rounded>Add Document</Button>
            </label>
            <Button secondary outline blue rounded onClick={() => getDocuments(true)}>{docs.isFetching ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : "Refresh"}</Button>
          </PageAction>
        </Page>
        {docs.view !== "folder" || !docs.folders.length
          ? (
            <DocumentFeedOptionsRow>
              <DocumentFeedOptionsContainer span={12}>
                <DocumentFeedOptions>
                  <DocumentFeedOptionSection align="left" xs={12} sm={12} md={6} lg={6} xl={6}>
                    <DocumentFeedSearchInputWrapper>
                      <DocumentFeedSearchInput ref={(input) => this.termSelect = input} type="text" placeholder="Search documents..." onChange={this.changeQuery} />
                    </DocumentFeedSearchInputWrapper>
                  </DocumentFeedOptionSection>
                  <DocumentFeedOptionSection align="right" xs={12} sm={12} md={4} lg={4} xl={4}>
                    <DocumentFeedSearchSelectWrapper>
                      <SelectLabel>
                        <DocumentFeedSearchSelect ref={(input) => this.documentTypeSelect = input} defaultValue="" onChange={this.onDocumentTypeSelect}>
                          <option disabled value="">Choose a document type</option>
                          {document_types.map((group, groupIndex) => {
                            return (
                              <optgroup key={groupIndex} label={group.name}>
                                {group.items.map((item, itemIndex) => {
                                  return (
                                    <option key={itemIndex} value={item}>{item}</option>
                                  );
                                })}
                              </optgroup>
                            );
                          })}
                        </DocumentFeedSearchSelect>
                      </SelectLabel>
                    </DocumentFeedSearchSelectWrapper>
                  </DocumentFeedOptionSection>
                  <DocumentFeedOptionSection align="right" xs={12} sm={12} md={2} lg={2} xl={2}>
                    <DocumentFeedSearchButtonWrapper>
                      <Button secondary blue outline rounded onClick={() => this.clearFilters()}>Clear</Button>
                    </DocumentFeedSearchButtonWrapper>
                  </DocumentFeedOptionSection>
                </DocumentFeedOptions>
              </DocumentFeedOptionsContainer>
            </DocumentFeedOptionsRow>
          )
          : null
        }
        {docs.view !== "folder"
          ? (
            <BackButtonRow>
              <DocumentFeedOptionsContainer span={12}>
                <DocumentCardInnerViewButton outline small blue width={100} nomargin onClick={() => updateDocumentsView("folder")}>
                  <FontAwesomeIcon icon={["fad", "arrow-left"]} style={{ marginRight: "10px" }}/> Back
                </DocumentCardInnerViewButton>
              </DocumentFeedOptionsContainer>
            </BackButtonRow>
          )
          : null
        }
        {docs.folders.length && !isLoading
          ? (
            <>
              {docs.view === "folder"
                ? (
                  <DocumentCards gutter={20}>
                    {docs.folders.map((folder_name, folder_name_index) => {
                      return (
                        <DocumentCard key={folder_name_index} xs={12} sm={6} md={6} lg={4} xl={3}>
                          <DocumentCardPadding>
                            <DocumentCardInner height={115}>
                              <DocumentCardContent>
                                <DocumentCardSection span={3}>
                                  <DocumentCardIcon>
                                    <FontAwesomeIcon icon={["fad", "folder-open"]} />
                                  </DocumentCardIcon>
                                </DocumentCardSection>
                                <DocumentCardSection span={9} minheight={50}>
                                  <DocumentCardInnerItem fontsize={16}>{folder_name || "Untitled"}</DocumentCardInnerItem>
                                  <DocumentCardInnerItem>Size: {docs.foldered[folder_name].some((d) => d.size) ? getReadableFileSizeString(docs.foldered[folder_name].reduce((a, { size }) => a + size, 0), true) : "N/A"}</DocumentCardInnerItem>
                                  <DocumentCardInnerItem transform="capitalize">{docs.foldered[folder_name].length} {docs.foldered[folder_name].length === 1 ? "File" : "Files"}</DocumentCardInnerItem>
                                </DocumentCardSection>
                                <DocumentCardSection span={12}>
                                  <DocumentCardInnerButtons gutter={10}>
                                    <DocumentCardInnerButtonContainer span={4}>
                                      <DocumentCardInnerViewButton outline small blue widthPercent={100} nomargin onClick={() => updateDocumentsView(folder_name)}>
                                        Open
                                      </DocumentCardInnerViewButton>
                                    </DocumentCardInnerButtonContainer>
                                  </DocumentCardInnerButtons>
                                </DocumentCardSection>
                              </DocumentCardContent>
                            </DocumentCardInner>
                          </DocumentCardPadding>
                        </DocumentCard>
                      );
                    })}
                  </DocumentCards>
                )
                : null
              }
              {documents.length
                ? (
                  <DocumentCards gutter={20}>
                    {documents.map((document, index) => {
                      const creator = this.getUploader(document.cognito_id);
                      const associated = this.getAssociatedAccount(document.associated_account_id);
                      const name = document && document.original_name ? document.original_name.split("/") : [];
                      return (
                        <DocumentCard key={index} xs={12} sm={6} md={6} lg={4} xl={3}>
                          <DocumentCardPadding>
                            <DocumentCardInner height={225}>
                              <DocumentCardContent>
                                <DocumentCardSection span={3}>
                                  <DocumentCardIcon>
                                    <FontAwesomeIcon icon={["fad", icons[document.document_type] || "file-alt"]} />
                                  </DocumentCardIcon>
                                </DocumentCardSection>
                                <DocumentCardSection span={9} minheight={170}>
                                  <DocumentCardInnerItem fontsize={16}>{document.friendly_name || (name.length === 2 ? name[1] : document.filename || "Untitled")}{document.size ? ` (${getReadableFileSizeString(document.size, true)})` : ""}</DocumentCardInnerItem>
                                  <DocumentCardInnerItem transform="capitalize">{document.document_type || "Unknown File Type"}</DocumentCardInnerItem>
                                  <DocumentCardInnerItem>{moment(document.created_at).format("MMMM DD, YYYY [at] h:mm A")}</DocumentCardInnerItem>
                                  {document.description && document.description.length
                                    ? <DocumentCardInnerItem multiline><HeavyFont>Description:</HeavyFont> {hasWhiteSpace(document.description) ? `${document.description.substring(0, 60)}${document.description.length > 60 ? "..." : ""}` : `${document.description.substring(0, 30)}${document.description.length > 30 ? "..." : ""}`}</DocumentCardInnerItem>
                                    : null
                                  }
                                  {associated
                                    ? <DocumentCardInnerItem><HeavyFont>Associated with:</HeavyFont> {`${associated.first_name} ${associated.last_name}`}</DocumentCardInnerItem>
                                    : null
                                  }
                                  <DocumentCardInnerItem><HeavyFont>Uploaded by:</HeavyFont> {`${creator.first_name} ${creator.last_name}`}</DocumentCardInnerItem>
                                </DocumentCardSection>
                                <DocumentCardSection span={12}>
                                  <DocumentCardInnerButtons gutter={10}>

                                    <DocumentCardInnerButtonContainer span={4}>
                                      <DocumentCardInnerViewButton outline small blue widthPercent={100} nomargin onClick={() => this.getSignedURL(document)}>
                                        {this.state[`${document.id}_isloading`] ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : "View"}
                                      </DocumentCardInnerViewButton>
                                    </DocumentCardInnerButtonContainer>

                                    <DocumentCardInnerButtonContainer span={4}>
                                      <DocumentCardInnerViewButton outline small blue widthPercent={100} nomargin onClick={() => openCreateDocumentModal(false, document, true, false)}>
                                        Edit
                                      </DocumentCardInnerViewButton>
                                    </DocumentCardInnerButtonContainer>

                                    <DocumentCardInnerButtonContainer span={4}>
                                      <DocumentCardInnerViewButton outline small danger widthPercent={100} nomargin onClick={() => this.deleteDocument(document.original_name, document.friendly_name)}>
                                        Delete
                                      </DocumentCardInnerViewButton>
                                    </DocumentCardInnerButtonContainer>

                                  </DocumentCardInnerButtons>
                                </DocumentCardSection>
                              </DocumentCardContent>
                            </DocumentCardInner>
                          </DocumentCardPadding>
                        </DocumentCard>
                      );
                    })}
                  </DocumentCards>
                )
                : (
                  <>
                    {docs.view !== "folder"
                      ? (
                        <>
                          {isLoading
                            ? (
                              <DocumentFeedSearchMessage>
                                <DocumentFeedSearchText span={12}>{`Searching for "${term}"`}</DocumentFeedSearchText>
                                <DocumentFeedSearchAction span={12}>
                                  <Button onClick={() => this.clearFilters()} outline primary blue>Cancel</Button>
                                </DocumentFeedSearchAction>
                              </DocumentFeedSearchMessage>
                            )
                            : (
                              <DocumentFeedSearchMessage>
                                <DocumentFeedSearchText span={12}>{`Found ${documents.length} ${filter.document_type ? `"${filter.document_type}"` : ""} documents ${term ? ` for "${term}"` : ""}${docs.view ? ` in "${docs.view}"` : ""}`}</DocumentFeedSearchText>
                                <DocumentFeedSearchAction span={12}>
                                  <Button onClick={() => this.clearFilters()} outline primary blue>Reset Filters</Button>
                                </DocumentFeedSearchAction>
                              </DocumentFeedSearchMessage>
                            )
                          }
                        </>
                      )
                      : null
                    }
                  </>
                )
              }
            </>
          )
          : (
            <DocumentFeedSearchMessage>
              <DocumentFeedSearchText span={12}>No Document Folders Found.</DocumentFeedSearchText>
            </DocumentFeedSearchMessage>
          )
        }
      </ViewContainer>
    );
  }
}

const mapStateToProps = (state) => ({
  user: state.user,
  docs: state.documents,
  session: state.session,
  clients: state.clients
});
const dispatchToProps = (dispatch) => ({
  getDocument: (key, account_id) => dispatch(getDocument(key, account_id)),
  deleteDocument: (key, friendly) => dispatch(deleteDocument(key, friendly)),
  getDocuments: (override) => dispatch(getDocuments(override)),
  openCreateDocumentModal: (file, defaults, updating, viewing) => dispatch(openCreateDocumentModal(file, defaults, updating, viewing)),
  showNotification: (type, title, message, metadata) => dispatch(showNotification(type, title, message, metadata)),
  updateDocumentsView: (view) => dispatch(updateDocumentsView(view)),
});
export default connect(mapStateToProps, dispatchToProps)(Documents);
