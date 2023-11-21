import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import PropTypes from "prop-types";
import moment from "moment";
import { navigateTo } from "../../store/actions/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Container from "../../Components/Container";
import { getDocument, getDocuments, openCreateDocumentModal } from "../../store/actions/document";
import { showNotification } from "../../store/actions/notification";
import {
  DocumentsListingMain,
  DocumentItem,
  DocumentItemPadding,
  DocumentItemInner,
  DocumentItemSections,
  DocumentItemSection,
  DocumentItemSectionItems,
  DocumentItemSectionItem,
  DocumentItemSectionIcon,
  DocumentItemSectionActionIcon
} from "./style";
import {
  Error,
  ErrorPadding,
  ErrorInner,
  ErrorInnerRow,
  ErrorIcon,
  ErrorMessage,
  Button
} from "../../global-components";

class DocumentsListing extends Component {
  static propTypes = {
    getDocument: PropTypes.func.isRequired,
    showNotification: PropTypes.func.isRequired
  };
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { accounts, documents, getDocuments, relationship, session } = props;
    if (!documents.documents.length) getDocuments();
    const account = accounts.find((account) => account.account_id === session.account_id);
    this.state = {
      accountPermissions: account.permissions,
      accountUsers: relationship.list
    };
  }
  
  getUploader = (cognito_id) => {
    const { accountUsers } = this.state;
    const owner = accountUsers ? accountUsers.filter((u) => u.cognito_id === cognito_id)[0] : false;
    if (owner) return { ...owner, avatar: owner.avatar, isOperator: false };
    return false;
  };

  getSignedURL = async (doc) => {
    const { getDocument, showNotification } = this.props;
    this.setState({ [`${doc.id}_isloading`]: true });
    const URL = await getDocument(doc.filename, doc.account_id);
    if (URL.success) {
      this.setState({ [doc.id]: URL.payload, [`${doc.id}_isloading`]: false }, () => document.getElementById(`link_${doc.id}`).click());
    } else {
      showNotification("error", "", "Could not download this document.");
    }
  };

  render() {
    const { customer_support, documents, openCreateDocumentModal, navigateTo, height, type, span } = this.props;
    const { accountPermissions } = this.state;
    const { document_types = [] } = customer_support.core_settings;
    return (
      <Container title={type} viewall={{ title: "View All", func: () => navigateTo("/documents") }} action={{ title: "New Document", func: () => openCreateDocumentModal({}, {}, false, false) }} xs={12} sm={12} md={12} lg={span} xl={span} height={height} overflow="auto">
        <DocumentsListingMain gutter={20}>
          {documents.documents.length
            ? (
              documents.documents.slice(0, 4).map((doc, index) => {
              const creator = this.getUploader(doc.cognito_id);
              let canView = [];
              let canEdit = [];
              (doc.permissions || []).forEach((doc_permission) => {
                canView.push(accountPermissions.includes(`${doc_permission}-view`));
                canEdit.push(accountPermissions.includes(`${doc_permission}-edit`));
              });
                const name = doc && doc.filename ? doc.filename.split("/") : [];
                const document_type = document_types.find((d) => d.type === doc.document_type);
              return (
                <DocumentItem key={index} xs={12} sm={6} md={6} lg={6} xl={6}>
                  <DocumentItemPadding>
                    <DocumentItemInner>
                      <DocumentItemSections>
                        <DocumentItemSection span={3}>
                          <DocumentItemSectionIcon>
                            <FontAwesomeIcon icon={["fad", (document_type ? document_type.icon : "file-alt")]} />
                          </DocumentItemSectionIcon>
                        </DocumentItemSection>
                        <DocumentItemSection span={5}>
                          <DocumentItemSectionItems>
                            <DocumentItemSectionItem span={12} weight={500} size={14}>
                              {doc.friendly_name || (name.length === 2 ? name[1] : doc.filename || "Untitled")}
                            </DocumentItemSectionItem>
                            <DocumentItemSectionItem span={12} size={13} transform="capitalize">
                              {doc.document_type}
                            </DocumentItemSectionItem>
                            {creator
                              ? (
                                <DocumentItemSectionItem span={12} weight={400} size={12}>
                                  {`Uploaded by: ${creator.first_name} ${creator.last_name}`}
                                </DocumentItemSectionItem>
                              )
                              : null
                            }
                            <DocumentItemSectionItem span={12} weight={400} size={12}>
                              {moment(doc.created_at).format("MMMM DD, YYYY [at] h:mm A")}
                            </DocumentItemSectionItem>
                          </DocumentItemSectionItems>
                        </DocumentItemSection>
                        <DocumentItemSection span={4}>
                          {canEdit.every((s) => s) && !doc.static
                            ? (
                              <DocumentItemSectionActionIcon>
                                <Button onClick={() => openCreateDocumentModal(false, doc, true, false)} small blue>Edit</Button>
                              </DocumentItemSectionActionIcon>
                            )
                            : (
                              <>
                                {canView.every((s) => s)
                                  ? (
                                    <>
                                      <DocumentItemSectionActionIcon>
                                        <Button onClick={() => this.getSignedURL(doc)} small blue>{this.state[`${doc.id}_isloading`] ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : "View"}</Button>
                                      </DocumentItemSectionActionIcon>
                                      <a rel="noopener noreferrer" target="_blank" id={`link_${doc.id}`} href={this.state[doc.id]} download={doc.friendly_name}>{null}</a>
                                    </>
                                  )
                                  : null
                                }
                              </>
                            )
                          }
                        </DocumentItemSection>
                      </DocumentItemSections>
                    </DocumentItemInner>
                  </DocumentItemPadding>
                </DocumentItem>
              );
            })
            )
            : (
              <Error span={12}>
                <ErrorPadding>
                  <ErrorInner span={12}>
                    <ErrorInnerRow>
                      <ErrorIcon span={12}>
                        <FontAwesomeIcon icon={["fad", "file-alt"]} />
                      </ErrorIcon>
                      <ErrorMessage span={12}>You do not have any documents.</ErrorMessage>
                    </ErrorInnerRow>
                  </ErrorInner>
                </ErrorPadding>
              </Error>
            )
          }
        </DocumentsListingMain>
      </Container>
    );
  }
}

const mapStateToProps = (state) => ({
  documents: state.documents,
  accounts: state.accounts,
  relationship: state.relationship,
  session: state.session,
  customer_support: state.customer_support
});
const dispatchToProps = (dispatch) => ({
  getDocument: (filename, account_id) => dispatch(getDocument(filename, account_id)),
  getDocuments: (override) => dispatch(getDocuments(override)),
  navigateTo: (location, query) => dispatch(navigateTo(location, query)),
  showNotification: (type, title, message, metadata) => dispatch(showNotification(type, title, message, metadata)),
  openCreateDocumentModal: (file, defaults, updating, viewing) => dispatch(openCreateDocumentModal(file, defaults, updating, viewing)),
});
export default connect(mapStateToProps, dispatchToProps)(DocumentsListing);
