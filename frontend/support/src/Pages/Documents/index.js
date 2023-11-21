import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { openCreateDocumentModal, getDocuments, updateDocument } from "../../store/actions/document";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { documents_table_columns } from "../../column-definitions";
import GenericTable from "../../Components/GenericTable";
import {
  ViewContainer
} from "../../global-components";
import {
  CurrentVaultUsage,
  TotalVaultUsage
} from "./style";
import { getReadableFileSizeString } from "../../utilities";
import { uniqBy } from "lodash";

class Documents extends Component {
  static defaultProps = {};

  constructor(props) {
    super(props);
    document.title = "Documents";
    this.state = {};
  }

  render() {
    const { docs, core_settings } = this.props;
    const total_vaults = docs.documents.reduce((acc, doc) => { if (acc.includes(doc.account_id)) return acc; acc.push(doc.account_id); return acc }, []);
    return (
      <ViewContainer margintop={10}>
        <GenericTable
          cellUpdateFunction={updateDocument}
          permissions={["hopetrust-documents-edit"]}
          getData={getDocuments}
          columns={documents_table_columns}
          page_size={25}
          data_path={["documents", "documents"]}
          initial_data={[]}
          loading={docs.isFetching}
          requested={docs.requested}
          header="Document Vault"
          additional_info={<div>Total Vault Usage: {docs.isFetching ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : <CurrentVaultUsage limit={10000000000000000000} usage={docs.usage}>{docs.usage ? getReadableFileSizeString(docs.usage, true) : "0KB"}</CurrentVaultUsage>} in <TotalVaultUsage>{total_vaults.length}</TotalVaultUsage> vaults</div>}
          groups={[
            {
              columnKey: "core_account_name",
              icon: {
                open: "folder-open",
                closed: "folder"
              }
            },
            {
              columnKey: "folder",
              icon: {
                open: "folder-open",
                closed: "folder"
              }
            }
          ]}
          fields={[
            {
              caption: "Associated Account Name",
              name: "account_name",
              type: "string"
            },
            {
              caption: "Core Account Name",
              name: "core_account_name",
              type: "string"
            },
            {
              caption: "Document Type",
              name: "document_type",
              type: "select",
              options: core_settings.document_types.map((d) => ({ caption: d.type, value: d.type }))
            },
            {
              caption: "Folder",
              name: "folder",
              type: "select",
              options: uniqBy(core_settings.document_types.filter((d) => d.category).map((d) => ({ caption: d.category, value: d.category })), "value")
            },
            {
              caption: "Uploader Name",
              name: "uploader_name",
              type: "string"
            },
            {
              caption: "Size (bytes)",
              name: "size",
              type: "number"
            },
            {
              caption: "Is Static",
              name: "static",
              type: "select",
              options: [
                { caption: "Yes", value: "true" },
                { caption: "No", value: "false" }
              ]
            },
            {
              caption: "Is Private",
              name: "private",
              type: "select",
              options: [
                { caption: "Yes", value: "true" },
                { caption: "No", value: "false" }
              ]
            },
            {
              caption: "File Type",
              name: "file_type",
              type: "select",
              options: [
                { caption: "PNG", value: "png" },
                { caption: "JPEG", value: "jpeg" },
                { caption: "JPG", value: "jpg" },
                { caption: "GIF", value: "gif" },
                { caption: "RTF", value: "rtf" },
                { caption: "TXT", value: "txt" },
                { caption: "DOC", value: "doc" },
                { caption: "DOCX", value: "docx" },
                { caption: "PAGES", value: "pages" },
                { caption: "XLS", value: "xls" },
                { caption: "XLSX", value: "xlsx" },
                { caption: "HEVC", value: "hevc" },
                { caption: "HEIC", value: "heic" },
                { caption: "MSWORD", value: "msword" },
                { caption: "PDF", value: "pdf" },
                { caption: "PPT", value: "ppt" },
                { caption: "PPTX", value: "pptx" }
              ]
            },
            {
              caption: "Created",
              name: "created_at",
              type: "date"
            }
          ]}
          newRow={{
            onClick: openCreateDocumentModal,
            arguments: [{}, false, false, false]
          }}
          paging={false}
          search={true}
          columnResizing={true}
          csvExport={false}
        />
      </ViewContainer>
    );
  }
}

const mapStateToProps = (state) => ({
  docs: state.documents,
  core_settings: state.customer_support.core_settings
});
const dispatchToProps = (dispatch) => ({});
export default connect(mapStateToProps, dispatchToProps)(Documents);
