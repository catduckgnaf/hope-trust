import React, { Component } from "react";
import { connect } from "beautiful-react-redux";
import { openCreateDocumentModal, getDocuments } from "../../store/actions/document";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { documents_table_columns } from "../../column-definitions";
import GenericTable from "../../Components/GenericTable";
import { updateCoreAccount } from "../../store/actions/account";
import { showNotification } from "../../store/actions/notification";
import { navigateTo } from "../../store/actions/navigation";
import { components } from "react-select";
import CreatableSelect from "react-select/creatable";
import {
  ViewContainer,
  InputHint,
  PageHeaderSecondaryNoticeIcon,
  Button,
  HeavyFont,
  InputWrapper,
  InputLabel,
  SelectStyles
} from "../../global-components";
import {
  CurrentVaultUsage,
  TotalVaultUsage,
  StatusBox,
  StatusBoxPadding,
  StatusBoxInner,
  StatusSections,
  StatusSection,
  VaultPermissionHintItem,
  OptionContainer,
  OptionImageContainer,
  OptionTextContainer,
} from "./style";
import { getReadableFileSizeString, isValidDomain } from "../../utilities";
import { uniqBy, uniq } from "lodash";

const Option = (props) => {
  return (
    <components.Option {...props}>
      <OptionContainer>
        <OptionImageContainer><FontAwesomeIcon icon={["fad", props.data.icon || "plus-circle"]} /></OptionImageContainer>
        <OptionTextContainer>{props.data.label}</OptionTextContainer>
      </OptionContainer>
    </components.Option>
  );
};

const vault_permissions = (user) => [
  {
    label: "Anyone",
    value: "anyone",
    icon: "users-cog",
    override_permission: true,
    show: true
  },
  {
    label: "Only Me",
    value: "only-me",
    icon: "user",
    override_permission: true,
    isFixed: true,
    show: true
  },
  {
    label: "Account Administrators",
    value: "account-admin-edit",
    icon: "th-large",
    show: !user.is_partner
  },
  {
    label: "Financial Administrators",
    value: "finance-edit",
    icon: "chart-pie",
    show: !user.is_partner
  },
  {
    label: "Health Administrators",
    value: "health-and-life-edit",
    icon: "hand-holding-seedling",
    show: !user.is_partner
  },
  {
    label: "All Account Users",
    value: "account-users",
    icon: "users",
    override_permission: true,
    show: !user.is_partner
  }
].filter((e) => e.show);

class Documents extends Component {
  static defaultProps = {};

  constructor(props) {
    super(props);
    const { accounts, user, session } = props;
    document.title = "Documents";
    const account = accounts.find((account) => account.account_id === session.account_id);
    const current_plan = user.is_partner && !session.is_switching ? account.partner_plan : account.user_plan;
    this.state = {
      current_plan,
      account,
      vault_permission: account.vault_permission,
      saving: false
    };
  }

  filterOptions = (value, actionOptions) => {
    let options = value.map((e) => e.value); // latest options
    const latest_value = options[options.length - 1];
    if (latest_value === "anyone") options = ["anyone"];
    if (latest_value === "only-me") options = ["only-me"];
    if (options.includes("anyone") && options.length > 1) options = options.filter((p) => p !== "anyone");
    if (["anyone", "account-users"].every((p) => !options.includes(p)) && options.length >= 1) options = uniq(["only-me", ...options]);
    if (options.includes("account-users")) {
      const remaining = options.filter((o) => !["anyone", "only-me", "account-admin-edit", "finance-edit", "health-and-life-edit", "account-users"].includes(o));
      options = ["account-users", ...remaining];
    }
    this.setState({ [actionOptions.name]: options });
  };

  updateSelectInput = (value, actionOptions) => {
    let { vault_permission } = this.state;
    switch (actionOptions.action) {
      case "remove-value":
        if ((actionOptions.removedValue.value === "only-me" && vault_permission.includes("only-me"))) break;
        let difference = vault_permission.filter((permission) => permission !== actionOptions.removedValue.value);
        if (!difference.length) difference = ["only-me"];
        this.setState({ [actionOptions.name]: difference });
        break;
      case "select-option":
        this.filterOptions(value, actionOptions);
        break;
      case "create-option":
        this.filterOptions(value, actionOptions);
        break;
      case "pop-value":
        if (actionOptions.removedValue.isFixed) return;
        break;
      case "clear":
        const default_permissions = ["only-me"];
        this.setState({ [actionOptions.name]: default_permissions });
        break;
      default:
        break;
    }
  };

  save = async () => {
    const { updateCoreAccount } = this.props;
    const { vault_permission } = this.state;
    this.setState({ saving: true });
    await updateCoreAccount({ vault_permission });
    this.setState({ saving: false });
  };

  render() {
    const { docs, core_settings, user, showNotification } = this.props;
    const { current_plan, account, vault_permission, saving } = this.state;
    return (
      <ViewContainer margintop={20}>
        {account.account_id === user.cognito_id && account.permissions.includes("account-admin-edit") && (account.features && account.features.messaging)
          ? (
            <StatusBox>
              <StatusBoxPadding>
                <StatusBoxInner>
                  <InputWrapper>
                    <InputLabel marginbottom={10}>Who can email documents to your vault?</InputLabel>
                    <StatusSections>
                      <StatusSection xs={9} sm={9} md={10} lg={10} xl={10}>
                        <CreatableSelect
                          components={{ Option }}
                          styles={{
                            container: (base, state) => ({
                              ...base,
                              opacity: state.isDisabled ? ".5" : "1",
                              backgroundColor: "transparent",
                              zIndex: 999
                            }),
                            multiValue: (base, state) => ({
                              ...base,
                              backgroundColor: state.data.isFixed ? "gray" : base.backgroundColor,
                              borderRadius: "15px",
                              padding: "2px 10px"
                            }),
                            multiValueLabel: (base, state) => {
                              return state.data.isFixed
                                ? { ...base, fontWeight: "bold", color: "white", paddingRight: 6 }
                                : base;
                            },
                            multiValueRemove: (base, state) => {
                              return state.data.isFixed ? { ...base, display: "none" } : base;
                            },
                            menu: (base) => ({
                              ...base,
                              zIndex: 999,
                              textAlign: "left"
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
                          isClearable={vault_permission.some((v) => !v.isFixed)}
                          isSearchable
                          isMulti
                          isLoading={saving}
                          createOptionPosition="first"
                          formatCreateLabel={(val) => `Click or press Enter to add ${val} as a whitelisted domain`}
                          isValidNewOption={(val) => isValidDomain(val)}
                          name="vault_permission"
                          backspaceRemovesValue={true}
                          placeholder="Who can email documents to your vault?"
                          onChange={(value, actions) => {
                            if (actions.action === "select-option") {
                              let options = value.map((e) => e.value); // latest options
                              const latest_value = options[options.length - 1];
                              if (latest_value === "anyone") showNotification("confirm", `Note: Setting this option will allow anyone with your inbox email (${user.username || user.cognito_id}${`@${process.env.REACT_APP_STAGE === "production" ? "" : `${process.env.REACT_APP_STAGE || "development"}-`}message.hopecareplan.com`}) to upload documents to your vault.\n\nAre you sure you want to set this option?`, "", { action: () => this.updateSelectInput(value, actions) });
                              else this.updateSelectInput(value, actions);
                            } else {
                              this.updateSelectInput(value, actions);
                            }
                          }}
                          value={vault_permission.map((permission) => {
                            const permission_value = vault_permissions(user).find((vp) => vp.value === permission);
                            return permission_value ? { value: permission, label: permission === "only-me" && vault_permission.length > 1 ? "Me" : permission_value.label, icon: permission_value.icon, isFixed: permission === "only-me" } : { value: permission, label: permission };
                          })}
                          options={vault_permissions(user).filter((p) => p.override_permission || account.permissions.includes(p.value))}
                        />
                      </StatusSection>
                      <StatusSection xs={3} sm={3} md={2} lg={2} xl={2}>
                        <Button blue nomargin marginleft={10} marginbottom={20} onClick={() => this.save()}>Update</Button>
                      </StatusSection>
                      <StatusSection span={12}>
                        <InputHint>
                          {vault_permission.includes("only-me")
                            ? <VaultPermissionHintItem><PageHeaderSecondaryNoticeIcon blue><FontAwesomeIcon icon={["far", "paperclip"]} /></PageHeaderSecondaryNoticeIcon> Try sending an attachment from <HeavyFont blue>{user.email}</HeavyFont> to <HeavyFont blue onClick={() => navigateTo("/settings")}>{user.username || user.cognito_id}{`@${process.env.REACT_APP_STAGE === "production" ? "" : `${process.env.REACT_APP_STAGE || "development"}-`}message.hopecareplan.com`}</HeavyFont></VaultPermissionHintItem>
                            : null
                          }
                          {!vault_permission.some((val) => isValidDomain(val)) && !vault_permission.includes("anyone")
                            ? <VaultPermissionHintItem><PageHeaderSecondaryNoticeIcon blue><FontAwesomeIcon icon={["far", "at"]} /></PageHeaderSecondaryNoticeIcon> Add any domain to whitelist addresses from that domain, <HeavyFont blue>ie: example.com</HeavyFont></VaultPermissionHintItem>
                            : null
                          }
                          {vault_permission.includes("anyone")
                            ? <VaultPermissionHintItem><PageHeaderSecondaryNoticeIcon blue><FontAwesomeIcon icon={["fas", "exclamation-triangle"]} /></PageHeaderSecondaryNoticeIcon> <HeavyFont blue>Anyone</HeavyFont> {account.vault_permission.includes("anyone") ? "can" : "will be able to"} upload documents to your document vault by emailing an attachment to <HeavyFont blue>{user.username || user.cognito_id}{`@${process.env.REACT_APP_STAGE === "production" ? "" : `${process.env.REACT_APP_STAGE || "development"}-`}message.hopecareplan.com`}</HeavyFont></VaultPermissionHintItem>
                            : null
                          }
                        </InputHint>
                      </StatusSection>
                    </StatusSections>
                  </InputWrapper>
                </StatusBoxInner>
              </StatusBoxPadding>
            </StatusBox>
          )
          : null
        }
        <GenericTable
          permissions={["basic-user"]}
          getData={getDocuments}
          columns={documents_table_columns}
          page_size={25}
          data_path={["documents", "documents"]}
          initial_data={[]}
          loading={docs.isFetching}
          requested={docs.requested}
          header="Document Vault"
          additional_info={<div>Total Vault Usage: {docs.isFetching ? <FontAwesomeIcon icon={["fad", "spinner"]} spin /> : <CurrentVaultUsage limit={current_plan.vault_limit} usage={docs.usage}>{docs.usage ? getReadableFileSizeString(docs.usage, true) : "0KB"}</CurrentVaultUsage>}  of <TotalVaultUsage>{current_plan.vault_limit ? getReadableFileSizeString(current_plan.vault_limit, false) : "0 GB"}</TotalVaultUsage></div>}
          groups={[
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
          paging={true}
          search={true}
          columnResizing={true}
          csvExport={false}

        />
      </ViewContainer>
    );
  }
}

const mapStateToProps = (state) => ({
  accounts: state.accounts,
  user: state.user,
  session: state.session,
  docs: state.documents,
  core_settings: state.customer_support.core_settings
});
const dispatchToProps = (dispatch) => ({
  updateCoreAccount: (updates) => dispatch(updateCoreAccount(updates)),
  showNotification: (type, title, message, metadata) => dispatch(showNotification(type, title, message, metadata)),
  navigateTo: (location, query) => dispatch(navigateTo(location, query))
});
export default connect(mapStateToProps, dispatchToProps)(Documents);
