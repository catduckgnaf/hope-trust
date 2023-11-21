import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getCardIcon, getReadableFileSizeString, getUserAge } from "./utilities";
import { theme } from "./global-styles";
import { deleteDocument, getDocument, openCreateDocumentModal } from "./store/actions/document";
import { Cell, PermissionTag, PermissionTagIcon, PermissionTagInner, PermissionTagPadding } from "./Components/GenericTable/style";
import { store } from "./store";
import { openMessage } from "./store/actions/message";
import moment from "moment";
import ReactAvatar from "react-avatar";
import { OnlineIndicator } from "./global-components";
import phoneFormatter from "phone-formatter";
import { initiateSubscriptionCancellation, switchAccounts } from "./store/actions/account";
import { deletePaymentSource, updateStripeCustomer } from "./store/actions/stripe";
import { approveAccountMembership, deleteMembership } from "./store/actions/membership";
import { deleteRelationship, openCreateRelationshipModal } from "./store/actions/relationship";
import { navigateTo } from "./store/actions/navigation";
import { deleteProviderRecord, openCreateProviderModal } from "./store/actions/provider";
import { deleteMedication, openCreateMedicationModal } from "./store/actions/medication";
import { deleteGrantorAssetRecord, openCreateGrantorAssetModal } from "./store/actions/grantor-assets";
import { deleteMytoAsset, deleteMYTOSimulation, loadSimulation, openMYTOSimulation, updateMYTOSimulation } from "./store/actions/myto";
import { deleteBeneficiaryAssetRecord, openCreateBeneficiaryAssetModal } from "./store/actions/beneficiary-assets";
import { deleteIncomeRecord, openCreateIncomeModal } from "./store/actions/income";
import { IncomeAgeRange } from "./Components/IncomeSources/style";
import { deleteBenefitRecord, openCreateBenefitModal } from "./store/actions/benefits";
import { advisor_types } from "./store/actions/partners";
import { deleteBudgetRecord, openCreateBudgetModal } from "./store/actions/budgets";
import { Strong } from "./Components/MYTOSimulations/style";
import PlaidButton from "./Components/PlaidButton";
import { openPlaidLinkModal } from "./store/actions/plaid";

const Indicator = (props) => {
  return (
    <OnlineIndicator {...props}>
      <FontAwesomeIcon icon={["fas", "circle"]} />
    </OnlineIndicator>
  );
};

const document_permission_names = {
  "account-admin": "Account Management",
  "finance": "Finances",
  "health-and-life": "Health & Life"
};

export const documents_table_columns = [
  {
    key: "icon",
    isResizable: false,
    isReorderable: false,
    title: "",
    mobile_title: "Icon",
    dataType: "String",
    width: 60,
    format: (icon, data) => {
      const document_types = store.getState().customer_support.core_settings.document_types;
      const type = document_types.find((d) => d.type === data.document_type);
      return <Cell><FontAwesomeIcon style={{ fontSize: "20px", color: theme.hopeTrustBlue }} icon={["fad", (type ? type.icon : "file-alt")]} /></Cell>
    }
  },
  {
    key: "core_account_name",
    title: "Account",
    dataType: "String",
    sortable: true,
    capitalize: true,
    visible: false
  },
  {
    key: "folder",
    title: "Folder",
    dataType: "String",
    sortable: true,
    capitalize: true,
    groupAppendage: (group, groupProps, tableData) => {
      const folder_items = tableData.filter((document) => document.folder === groupProps.groupKey[groupProps.groupKey.length - 1] && document.folder === groupProps.groupKey[0]);
      const folder_usage = folder_items.reduce((accumulator, { size }) => accumulator + size, 0);
      return ` (${getReadableFileSizeString(folder_usage)})`;
    },
    groupCount: (group, groupProps, tableData) => {
      const folder_items = tableData.filter((document) => document.folder === groupProps.groupKey[groupProps.groupKey.length - 1] && document.folder === groupProps.groupKey[0]);
      return `${folder_items.length} ${folder_items.length === 1 ? "file" : "files"}`;
    }
  },
  { key: "friendly_name", title: "Name", dataType: "String", sortable: true, capitalize: true },
  {
    key: "document_type",
    title: "Type",
    dataType: "String",
    sortable: true,
    capitalize: true
},
  { key: "private", title: "Private?", dataType: "Boolean", capitalize: true, labels: (data) => ["Yes", "No"], sortable: true, visible: false },
  {

    key: "account_name",
    title: "Account",
    dataType: "String",
    sortable: true,
    visible: false
  },
  {

    key: "file_type",
    title: "File Type",
    dataType: "String",
    sortable: true,
    visible: false,
    uppercase: true
  },
  { key: "static", title: "Static?", dataType: "Boolean", capitalize: true, labels: (data) => ["static_type", "No"], sortable: true, visible: false },
  { key: "size", title: "Size", dataType: "String", format: (value, data) => getReadableFileSizeString(value, true) },
  {
    key: "uploader_name",
    title: "Author",
    dataType: "String",
    sortable: true
  },
  {
    key: "permissions",
    title: "Permissions",
    dataType: "String",
    sortable: true,
    width: 200,
    format: (value, data) => {
      const permissions = (value || "").split(",");
      return (
        <div>
          {permissions.map((permission, index) => {
            if (permission.length) {
              return (
                <PermissionTag key={index}>
                  <PermissionTagPadding>
                    <PermissionTagInner>
                      <PermissionTagIcon><FontAwesomeIcon icon={["fad", "lock-alt"]} /></PermissionTagIcon> {document_permission_names[permission]}
                    </PermissionTagInner>
                  </PermissionTagPadding>
                </PermissionTag>
              );
            }
            return (
              <PermissionTag>
                <PermissionTagPadding>
                  <PermissionTagInner>
                    <PermissionTagIcon><FontAwesomeIcon icon={["fad", "lock-alt"]} /></PermissionTagIcon> No Permissions
                  </PermissionTagInner>
                </PermissionTagPadding>
              </PermissionTag>
            );
          })}
        </div>
      );
    }
  },
  { key: "created_at", title: "Created", dataType: "Date", sortDirection: "Ascend" },
  {
    title: "Actions",
    key: "show-hide-details-row",
    isSortable: false,
    width: 150,
    isResizable: false,
    isReorderable: false,
    buttons: (data, props) => [
      {
        Component: FontAwesomeIcon,
        tooltipProps: {
          className: "tooltip neutral",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "View"
        },
        props: {
          icon: ["fal", "eye"],
          size: "xl",
          className: "table_button_icon",
          color: theme.hopeTrustBlue,
          style: {
            minWidth: "35px",
            cursor: "pointer"
          }
        },
        onClick: {
          async: true,
          handler: getDocument,
          arguments: [data.filename, data.account_id],
          callback: {
            action: (result) => window.open(result.payload, "_blank").focus(),
            dispatch: false
          }
        },
        show: () => {
          let document_permissions = [];
          if (data.permissions) document_permissions = (data.permissions || "").split(",");
          let canView = [];
          (document_permissions || []).forEach((doc_permission) => canView.push(props.account.permissions.includes(`${doc_permission}-view`)));
          if (document_permissions.length) return canView.every((s) => s);
          if (!document_permissions.length) return true;
          return false;
        }
      },
      {
        Component: FontAwesomeIcon,
        tooltipProps: {
          className: "tooltip neutral",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "Edit"
        },
        props: {
          icon: ["fal", "pen-to-square"],
          size: "xl",
          className: "table_button_icon",
          color: theme.hopeTrustBlue,
          style: {
            minWidth: "35px",
            cursor: "pointer"
          }
        },
        onClick: {
          async: false,
          handler: openCreateDocumentModal,
          arguments: [{}, { ...data, permissions: (data.permissions || "").split(",") }, true, false]
        },
        show: () => {
          let document_permissions = [];
          if (data.permissions) document_permissions = (data.permissions || "").split(",");
          let canEdit = [];
          (document_permissions || []).forEach((doc_permission) => canEdit.push(props.account.permissions.includes(`${doc_permission}-edit`)));
          if (document_permissions.length) return !data.static && canEdit.every((s) => s);
          if (!document_permissions.length && !data.static) return true;
          return false;
        }
      },
      {
        Component: FontAwesomeIcon,
        tooltipProps: {
          className: "tooltip error",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "Delete"
        },
        props: {
          icon: ["fal", "trash-can"],
          size: "xl",
          className: "table_button_icon",
          color: theme.errorRed,
          style: {
            minWidth: "35px",
            cursor: "pointer"
          },
          promptable: 1,
          prompt: "Are you sure you want to delete this document?",
        },
        onClick: {
          async: true,
          handler: deleteDocument,
          arguments: [data.filename, data.friendly_name]
        },
        show: () => {
          let document_permissions = [];
          if (data.permissions) document_permissions = (data.permissions || "").split(",");
          let canEdit = [];
          (document_permissions || []).forEach((doc_permission) => canEdit.push(props.account.permissions.includes(`${doc_permission}-edit`)));
          if (document_permissions.length) return !data.static && canEdit.every((s) => s);
          if (!document_permissions.length && !data.static) return true;
          return false;
        }
      }
    ]
  }
];

export const message_table_columns = [
  { key: "icon", isResizable: false, isReorderable: false, title: "", mobile_title: "Icon", dataType: "String", width: 60, format: (icon, data) => <Cell><FontAwesomeIcon style={{ fontSize: "20px", color: theme.hopeTrustBlue }} swapOpacity={!data.read} icon={["fad", (data.attachments && data.attachments.length) ? "paperclip" : (data.read ? "envelope-open-text" : "envelope")]} /></Cell> },
  { key: "subject", title: "Subject", dataType: "String", sortable: true, capitalize: true },
  { key: "sender_name", title: "Sent By", dataType: "String", sortable: true, capitalize: true, format: (value, data) => value || data.from_email },
  { key: "recipient_name", title: "Recipient", dataType: "String", sortable: true, format: (value, data) => data.is_user ? <Cell sortable={1} capitalize={1}>{value}</Cell> : <Cell sortable={1} capitalize={0}><a rel="noopener noreferrer" target="_blank" href={`mailto:${data.to_email}`}>{data.to_email}</a></Cell> },
  { key: "type", title: "Type", dataType: "String", sortable: true, capitalize: true },
  { key: "read", title: "Read Status", dataType: "Boolean", sortable: true, capitalize: true, labels: (data) => [`Read on ${moment(data.updated).format("MM/DD/YYYY [at] h:mm a")}`, "Unread"] },
  { key: "created_at", title: "Created", dataType: "Date", sortable: true, sortDirection: "Descend", format: (value, data) => value ? moment(value).format("MM/DD/YYYY [at] h:mm A") : "N/A" },
  {
    title: "Actions",
    key: "show-hide-details-row",
    isSortable: false,
    width: 145,
    isResizable: false,
    isReorderable: false,
    buttons: (data) => [
      {
        Component: FontAwesomeIcon,
        tooltipProps: {
          className: "tooltip neutral",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "View"
        },
        props: {
          icon: ["fal", "eye"],
          size: "xl",
          className: "table_button_icon",
          color: theme.hopeTrustBlue,
          style: {
            minWidth: "35px",
            cursor: "pointer"
          }
        },
        onClick: {
          async: false,
          handler: openMessage,
          arguments: [data, false, true]
        },
        show: true
      }
    ]
  }
];

export const subscriptions_table_columns = [
  {
    key: "avatar",
    isResizable: false,
    isReorderable: false,
    title: null,
    mobile_title: "Avatar",
    width: 50,
    Component: (data) => {
      return {
        Custom: ReactAvatar,
        props: {
          src: `https://${process.env.REACT_APP_STAGE || "development"}-api.${process.env.REACT_APP_API_BASE}/support/users/get-user-avatar/${data.account_id}?${Date.now()}`,
          size: 30,
          name: data.account_name,
          round: true
        }
      };
    }
  },
  { key: "account_name", title: "Name", dataType: "String", capitalize: true },
  { key: "plan_name", title: "Plan", dataType: "String", sortable: true, capitalize: true },
  { key: "account_value", title: "Covered Cost", dataType: "Number", sortable: true, format: (value, data) => `$${value}` },
  { key: "in_transfer", title: "In Transfer", dataType: "Boolean", sortable: true, capitalize: true, labels: (data) => ["Yes", "No"] },
  {
    key: "status",
    title: "Status",
    dataType: "String",
    capitalize: true,
    sortable: true,
    width: 125
  },
  { key: "created_at", title: "Created", dataType: "Date", sortable: true, sortDirection: "Descend" },
  {
    title: "Actions",
    key: "show-hide-details-row",
    isSortable: false,
    width: 145,
    isResizable: false,
    isReorderable: false,
    buttons: (data) => [
      {
        Component: FontAwesomeIcon,
        tooltipProps: {
          className: "tooltip error",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "Cancel"
        },
        props: {
          icon: ["fal", "trash-can"],
          size: "xl",
          className: "table_button_icon",
          color: theme.errorRed,
          style: {
            minWidth: "35px",
            cursor: "pointer"
          }
        },
        onClick: {
          async: true,
          handler: initiateSubscriptionCancellation,
          arguments: [data]
        },
        show: () => {
          const current_partner_subscription = store.getState().account.subscriptions.active.find((s) => s.type === "partner") || {};
          const cancelled_subscriptions = store.getState().account.subscriptions.cancelled.filter((s) => s.type === "user");
          const can_cancel = cancelled_subscriptions.length < (current_partner_subscription.max_cancellations || 0);
          return can_cancel && (data.transfer_customer_id && data.transfer_cognito_id) && !data.in_transfer && data.type !== "partner"
        }
      }
    ]
  }
];

export const transaction_widget_columns = [
  { key: "icon", isResizable: false, isReorderable: false, title: "", mobile_title: "Icon", dataType: "String", width: 75, format: (icon, data) => <Cell><FontAwesomeIcon style={{ fontSize: "20px", color: theme.hopeTrustBlue }} icon={["fad", "shopping-cart"]} /></Cell> },
  { key: "status", title: "Status", dataType: "String", capitalize: true },
  { key: "amount", title: "Amount", dataType: "Number", is_currency: true },
  { key: "created_at", title: "Created", dataType: "Date", sortDirection: "Descend" },
  {
    title: "Actions",
    key: "show-hide-details-row",
    isSortable: false,
    width: 100,
    isResizable: false,
    isReorderable: false,
    buttons: (data) => [
      {
        Component: FontAwesomeIcon,
        tooltipProps: {
          className: "tooltip neutral",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "Receipt"
        },
        props: {
          icon: ["fal", "receipt"],
          size: "xl",
          className: "table_button_icon",
          color: theme.hopeTrustBlue,
          style: {
            minWidth: "35px",
            cursor: "pointer"
          }
        },
        link: data.receipt_url,
        show: !!data.receipt_url,
      }
    ]
  },
];

export const payment_methods_widget_columns = [
  { key: "icon", isResizable: false, isReorderable: false, title: "", mobile_title: "Icon", dataType: "String", width: 75, format: (icon, data) => {
    const card_attributes = getCardIcon((data.brand).toLowerCase());
    return <Cell><FontAwesomeIcon style={{ fontSize: "20px", color: card_attributes.color }} icon={[card_attributes.icon_type, card_attributes.icon]} /></Cell>
  }},
  { key: "last4", title: "Status", dataType: "String", format: (value, data) => {
    const isExpired = moment(`${data.exp_month}/1/${data.exp_year}`).isBefore(moment());
    return !isExpired ? `**** ${value}` : `**** ${value} (Expired)`;
  }},
  { key: "exp_month", title: "Expiration", dataType: "String", format: (value, data) => `${data.exp_month} / ${data.exp_year}` },
  {
    title: "Actions",
    key: "show-hide-details-row",
    isSortable: false,
    width: 125,
    isResizable: false,
    isReorderable: false,
    buttons: (data) => [
      {
        Component: FontAwesomeIcon,
        tooltipProps: {
          className: "tooltip neutral",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "Set Default"
        },
        props: {
          icon: ["fal", "check-circle"],
          size: "xl",
          className: "table_button_icon",
          color: theme.hopeTrustBlue,
          style: {
            minWidth: "35px",
            cursor: "pointer"
          }
        },
        onClick: {
          async: true,
          handler: updateStripeCustomer,
          arguments: [data.customer, { default_source: data.id }, data.id]
        },
        show: () => store.getState().account.customer.default_source !== data.id
      },
      {
        Component: FontAwesomeIcon,
        tooltipProps: {
          className: "tooltip error",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "Delete"
        },
        props: {
          icon: ["fal", "trash-can"],
          size: "xl",
          className: "table_button_icon",
          color: theme.errorRed,
          promptable: 1,
          prompt: "Are you sure you want to delete this payment method?",
          style: {
            minWidth: "35px",
            cursor: "pointer"
          }
        },
        onClick: {
          async: true,
          handler: deletePaymentSource,
          arguments: [data.customer, data.id]
        },
        show: () => {
          const sources = store.getState().account.customer.sources;
          const user = store.getState().user;
          const session = store.getState().session;
          const currentAccount = store.getState().accounts.find((a) => a.account_id === session.account_id);
          const account_customer = store.getState().relationship.list.find((u) => u.customer_id && !u.linked_account);
          const current_plan = user.is_partner && !session.is_switching ? currentAccount.partner_plan : currentAccount.user_plan;
          const is_partner_paid = Object.values(currentAccount.subscription).length && ((currentAccount.subscription.customer_id !== account_customer.customer_id) && (currentAccount.subscription.status === "active"));
          const disabled = ((sources.length === 1 && current_plan.monthly) && !is_partner_paid);
          return !disabled;
        }
      }
    ]
  },
];

export const accounts_table_columns = [
  {
    key: "avatar",
    isResizable: false,
    isReorderable: false,
    title: null,
    mobile_title: "Avatar",
    width: 50,
    Component: (data) => {
      return {
        Custom: ReactAvatar,
        props: {
          src: `https://${process.env.REACT_APP_STAGE || "development"}-api.${process.env.REACT_APP_API_BASE}/support/users/get-user-avatar/${data.account_id}?${Date.now()}`,
          size: 30,
          name: data.name,
          round: true
        }
      };
    }
  },
  { key: "name", title: "Name", dataType: "String", capitalize: true, sortable: true },
  { key: "plan_name", title: "Plan Name", dataType: "String", capitalize: true, sortable: true },
  { key: "created_at", title: "Created", dataType: "Date", sortDirection: "Descend", sortable: true },
  {
    title: "Actions",
    key: "show-hide-details-row",
    isSortable: false,
    width: 150,
    isResizable: false,
    isReorderable: false,
    buttons: (data) => [
      {
        Component: FontAwesomeIcon,
        tooltipProps: {
          className: "tooltip success",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "Switch"
        },
        props: {
          icon: ["fal", "arrow-right-from-bracket"],
          size: "xl",
          className: "table_button_icon",
          color: theme.success,
          style: {
            minWidth: "35px",
            cursor: "pointer"
          }
        },
        onClick: {
          async: true,
          handler: switchAccounts,
          arguments: [data]
        },
        show: () => {
          const session = store.getState().session;
          const not_current = (session.account_id !== data.account_id);
          if (not_current && data.approved) return true;
          return false;
        }
      },
      {
        Component: FontAwesomeIcon,
        tooltipProps: {
          className: "tooltip error",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "Unlink"
        },
        props: {
          icon: ["fal", "trash-can"],
          size: "xl",
          className: "table_button_icon",
          color: theme.errorRed,
          promptable: 1,
          prompt: "Are you sure you want to unlink this account?",
          style: {
            minWidth: "35px",
            cursor: "pointer"
          }
        },
        onClick: {
          async: true,
          handler: deleteMembership,
          arguments: [data.id]
        },
        show: () => {
          const user = store.getState().user;
          const session = store.getState().session;
          const is_payer = data.subscription && Object.values(data.subscription).length && (data.subscription.customer_id === user.customer_id) && (data.subscription.status === "active")
          return data.approved && !data.is_primary && !data.is_core && !is_payer && data.account_id !== session.account_id;
        }
      },
      {
        Component: FontAwesomeIcon,
        tooltipProps: {
          className: "tooltip success",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "Approve"
        },
        props: {
          icon: ["fal", "check-circle"],
          size: "xl",
          className: "table_button_icon",
          color: theme.success,
          promptable: 1,
          prompt: "Are you sure you want to link this account?",
          style: {
            minWidth: "35px",
            cursor: "pointer"
          }
        },
        onClick: {
          async: true,
          handler: approveAccountMembership,
          arguments: [data.account_id, { approved: true, status: "active" }]
        },
        show: () => !data.approved
      },
      {
        Component: FontAwesomeIcon,
        tooltipProps: {
          className: "tooltip error",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "Decline"
        },
        props: {
          icon: ["fal", "times-circle"],
          size: "xl",
          className: "table_button_icon",
          color: theme.errorRed,
          promptable: 1,
          prompt: "Are you sure you want to decline this request?",
          style: {
            minWidth: "35px",
            cursor: "pointer"
          }
        },
        onClick: {
          async: true,
          handler: deleteMembership,
          arguments: [data.id]
        },
        show: () => !data.approved
      }
    ]
  }
];

export const users_table_columns = [
  {
    key: "online",
    isResizable: false,
    isReorderable: false,
    title: null,
    mobile_title: "Online Status",
    width: 20,
    Component: (data) => {
      return {
        Custom: Indicator,
        props: {
          idle: data.idle ? 1 : 0,
          online: data.online ? 1 : 0,
          className: `tooltip ${data.idle ? "neutral" : (data.online ? "success" : "error")}`,
          "data-tooltip": "",
          "data-tooltip-position": "right",
          "data-tooltip-content": data.idle ? `Idle for ${moment(data.last_activity).fromNow(true)}` : (data.online ? "Online Now" : "Offline")
        }
      };
    }
  },
  {
    key: "avatar",
    isResizable: false,
    isReorderable: false,
    title: null,
    mobile_title: "Avatar",
    width: 50,
    Component: (data) => {
      return {
        Custom: ReactAvatar,
        props: {
          src: `https://${process.env.REACT_APP_STAGE || "development"}-api.${process.env.REACT_APP_API_BASE}/support/users/get-user-avatar/${data.cognito_id}?${Date.now()}`,
          size: 30,
          name: `${data.first_name} ${data.last_name}`,
          round: true
        }
      };
    }
  },
  { key: "name", title: "Name", dataType: "String", capitalize: true },
  { key: "type", title: "Type", dataType: "String", capitalize: true, sortable: true, format: (value) => {
    const type = advisor_types.find((a) => a.name === value);
    if (type) return type.alias;
    return value;
  }},
  {
    key: "email",
    title: "Email",
    dataType: "String",
    format: (value, data) => <Cell><a rel="noopener noreferrer" target="_blank" href={value ? `mailto:${value}` : null}>{value ? value : "N/A"}</a></Cell>
  },
  {
    key: "status",
    title: "Status",
    dataType: "String",
    capitalize: true,
    sortable: true,
    width: 105
  },
  {
    key: "last_activity",
    title: "Last Active",
    dataType: "Date",
    width: 135,
    format: (date, data) => {
      return (
        <Cell>{date ? moment(date, "x").format("MMMM DD, YYYY [at] h:mm a") : "N/A"}</Cell>
      );
    }
  },
  { key: "created_at", title: "Created", dataType: "Date", sortable: true, sortDirection: "Descend", width: 125 },
  {
    title: "Actions",
    key: "show-hide-details-row",
    isSortable: false,
    width: 145,
    isResizable: false,
    isReorderable: false,
    buttons: (data) => [
      {
        Component: FontAwesomeIcon,
        tooltipProps: {
          className: "tooltip neutral",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "View"
        },
        props: {
          icon: ["fal", "eye"],
          size: "xl",
          className: "table_button_icon",
          color: theme.hopeTrustBlue,
          style: {
            minWidth: "35px",
            cursor: "pointer"
          }
        },
        onClick: {
          async: false,
          handler: openCreateRelationshipModal,
          arguments: [store.getState().relationship.list.find((d) => d.id === data.id), false, true]
        },
        show: () => {
          const user = store.getState().user;
          const session = store.getState().session;
          const account = store.getState().accounts.find((a) => a.account_id === session.account_id);
          return user.cognito_id !== data.cognito_id && account.permissions.includes("account-admin-view") && !account.permissions.includes("account-admin-edit");
        }
      },
      {
        Component: FontAwesomeIcon,
        tooltipProps: {
          className: "tooltip neutral",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "View"
        },
        props: {
          icon: ["fal", "eye"],
          size: "xl",
          className: "table_button_icon",
          color: theme.hopeTrustBlue,
          style: {
            minWidth: "35px",
            cursor: "pointer"
          }
        },
        onClick: {
          async: true,
          handler: navigateTo,
          arguments: ["/settings", "?tab=profile"]
        },
        show: () => {
          const user = store.getState().user;
          return user.cognito_id === data.cognito_id;
        }
      },
      {
        Component: FontAwesomeIcon,
        tooltipProps: {
          className: "tooltip neutral",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "Edit"
        },
        props: {
          icon: ["fal", "pen-to-square"],
          size: "xl",
          className: "table_button_icon",
          color: theme.hopeTrustBlue,
          style: {
            minWidth: "35px",
            cursor: "pointer"
          }
        },
        onClick: {
          async: false,
          handler: openCreateRelationshipModal,
          arguments: [store.getState().relationship.list.find((d) => d.id === data.id), true, false]
        },
        show: () => {
          const session = store.getState().session;
          const account = store.getState().accounts.find((a) => a.account_id === session.account_id);
          return (data.cognito_id !== store.getState().user.cognito_id) && account.permissions.includes("account-admin-edit")
        }
      },
      {
        Component: FontAwesomeIcon,
        tooltipProps: {
          className: "tooltip error",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": (data.linked_account ? "Unlink" : "Delete")
        },
        props: {
          icon: ["fal", "trash-can"],
          size: "xl",
          className: "table_button_icon",
          color: theme.errorRed,
          promptable: 1,
          prompt: "Are you sure you want to delete this relationship?",
          style: {
            minWidth: "35px",
            cursor: "pointer"
          }
        },
        onClick: {
          async: true,
          handler: deleteRelationship,
          arguments: [data.cognito_id]
        },
        show: () => {
          const session = store.getState().session;
          const account = store.getState().accounts.find((a) => a.account_id === session.account_id);
          if (!account.permissions.includes("account-admin-edit")) return false;
          if (data.cognito_id === store.getState().user.cognito_id) return false;
          if (data.cognito_id === store.getState().session.account_id) return false;
          if (data.type === "beneficiary") return false;
          return true;
        }
      }
    ]
  }
];

export const providers_table_columns = [
  { key: "full_name", title: "Name", dataType: "String", capitalize: true, sortable: true, width: 150 },
  { key: "type", title: "Type", dataType: "String", capitalize: true, sortable: true },
  { key: "specialty", title: "Specialty", dataType: "String", capitalize: true, sortable: true, width: 125 },
  { key: "associated_name", title: "Relationship", dataType: "String", capitalize: true, sortable: true },
  {
    key: "phone",
    title: "Phone",
    dataType: "String",
    format: (value, data) => <Cell><a rel="noopener noreferrer" target="_blank" href={value ? `tel:${value}` : null}>{value ? phoneFormatter.format(value, "(NNN) NNN-NNNN") : "N/A"}</a></Cell>
  },
  {
    key: "email",
    title: "Email",
    dataType: "String",
    format: (value, data) => <Cell><a rel="noopener noreferrer" target="_blank" href={value ? `mailto:${value}` : null}>{value ? value : "N/A"}</a></Cell>
  },
  { key: "created_at", title: "Created", dataType: "Date", sortDirection: "Descend" },
  {
    title: "Actions",
    key: "show-hide-details-row",
    isSortable: false,
    width: 125,
    isResizable: false,
    isReorderable: false,
    buttons: (data) => [
      {
        Component: FontAwesomeIcon,
        tooltipProps: {
          className: "tooltip neutral",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "View"
        },
        props: {
          icon: ["fal", "eye"],
          size: "xl",
          className: "table_button_icon",
          color: theme.hopeTrustBlue,
          style: {
            minWidth: "35px",
            cursor: "pointer"
          }
        },
        onClick: {
          async: false,
          handler: openCreateProviderModal,
          arguments: [data, false, true]
        },
        show: () => {
          const session = store.getState().session;
          const account = store.getState().accounts.find((a) => a.account_id === session.account_id);
          return account.permissions.includes("health-and-life-view") && !account.permissions.includes("health-and-life-edit");
        }
      },
      {
        Component: FontAwesomeIcon,
        tooltipProps: {
          className: "tooltip neutral",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "Edit"
        },
        props: {
          icon: ["fal", "pen-to-square"],
          size: "xl",
          className: "table_button_icon",
          color: theme.hopeTrustBlue,
          style: {
            minWidth: "35px",
            cursor: "pointer"
          }
        },
        onClick: {
          async: false,
          handler: openCreateProviderModal,
          arguments: [data, true, false]
        },
        show: () => {
          const session = store.getState().session;
          const account = store.getState().accounts.find((a) => a.account_id === session.account_id);
          return account.permissions.includes("account-admin-edit")
        }
      },
      {
        Component: FontAwesomeIcon,
        tooltipProps: {
          className: "tooltip error",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "Delete"
        },
        props: {
          icon: ["fal", "trash-can"],
          size: "xl",
          className: "table_button_icon",
          color: theme.errorRed,
          promptable: 1,
          prompt: "Are you sure you want to delete this provider?",
          style: {
            minWidth: "35px",
            cursor: "pointer"
          }
        },
        onClick: {
          async: true,
          handler: deleteProviderRecord,
          arguments: [data.id]
        },
        show: () => {
          const session = store.getState().session;
          const account = store.getState().accounts.find((a) => a.account_id === session.account_id);
          return account.permissions.includes("account-admin-edit")
        }
      }
    ]
  },
];

export const medications_table_columns = [
  { key: "name", title: "Name", dataType: "String", capitalize: true, sortable: true },
  { key: "frequency", title: "Frequency", dataType: "String", capitalize: true, sortable: true },
  { key: "dose", title: "Dose", dataType: "Number", format: (value, data) => `${value}${data.unit}` },
  { key: "provider_id", title: "Physician", dataType: "String", capitalize: true, sortable: true, format: (value, data) => data.physician },
  {
    key: "assistant",
    title: "Assistant",
    dataType: "String",
    capitalize: true,
    sortable: true,
    format: (value, data) => data.assistant_name || "Anyone"
  },
  { key: "created_at", title: "Created", dataType: "Date", sortDirection: "Descend" },
  {
    title: "Actions",
    key: "show-hide-details-row",
    isSortable: false,
    width: 125,
    isResizable: false,
    isReorderable: false,
    buttons: (data) => [
      {
        Component: FontAwesomeIcon,
        tooltipProps: {
          className: "tooltip neutral",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "View"
        },
        props: {
          icon: ["fal", "eye"],
          size: "xl",
          className: "table_button_icon",
          color: theme.hopeTrustBlue,
          style: {
            minWidth: "35px",
            cursor: "pointer"
          }
        },
        onClick: {
          async: false,
          handler: openCreateMedicationModal,
          arguments: [data, false, true]
        },
        show: () => {
          const session = store.getState().session;
          const account = store.getState().accounts.find((a) => a.account_id === session.account_id);
          return account.permissions.includes("health-and-life-view") && !account.permissions.includes("health-and-life-edit");
        }
      },
      {
        Component: FontAwesomeIcon,
        tooltipProps: {
          className: "tooltip neutral",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "Edit"
        },
        props: {
          icon: ["fal", "pen-to-square"],
          size: "xl",
          className: "table_button_icon",
          color: theme.hopeTrustBlue,
          style: {
            minWidth: "35px",
            cursor: "pointer"
          }
        },
        onClick: {
          async: false,
          handler: openCreateMedicationModal,
          arguments: [data, true, false]
        },
        show: () => {
          const session = store.getState().session;
          const account = store.getState().accounts.find((a) => a.account_id === session.account_id);
          return account.permissions.includes("account-admin-edit")
        }
      },
      {
        Component: FontAwesomeIcon,
        tooltipProps: {
          className: "tooltip error",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "Delete"
        },
        props: {
          icon: ["fal", "trash-can"],
          size: "xl",
          className: "table_button_icon",
          color: theme.errorRed,
          style: {
            minWidth: "35px",
            cursor: "pointer"
          },
          promptable: 1,
          prompt: "Are you sure you want to delete this medication?"
        },
        onClick: {
          async: true,
          handler: deleteMedication,
          arguments: [data.id]
        },
        show: () => {
          const session = store.getState().session;
          const account = store.getState().accounts.find((a) => a.account_id === session.account_id);
          return account.permissions.includes("account-admin-edit")
        }
      }
    ]
  },
];

export const grantor_assets_table_columns = [
  {
    key: "icon",
    isResizable: false,
    isReorderable: false,
    title: "",
    mobile_title: "Icon",
    dataType: "String",
    width: 60,
    format: (value, data) =>{
      return (
        <div style={{ display: "flex" }}>
          {data.source === "Plaid"
            ? <div
              {...{
                className: "tooltip neutral",
                "data-tooltip": "",
                "data-tooltip-position": "right",
                "data-tooltip-content": "Bank Account Linked By Plaid"
              }}
              style={{ marginLeft: "-11px", color: theme.hopeTrustBlue, fontSize: "17px" }}><FontAwesomeIcon icon={["fad", "university"]} />
              <FontAwesomeIcon icon={["fas", "circle"]} style={{
                color: data.color || "#AAAAAA",
                display: "inline-block",
                verticalAlign: "top",
                background: "#FFF",
                borderRadius: "50%",
                padding: "1px",
                position: "relative",
                left: "-6px",
                top: "5px",
                zIndex: 1,
                fontSize: "9px"
              }} />
            </div>
            : null
          }
          {data.source !== "Plaid"
            ? <Indicator style={{ color: data.color || "#AAAAAA", display: "inline-block", verticalAlign: "top", marginRight: "10px" }} />
            : null
          }
        </div>
      );
    }
  },
  {
    key: "account_type",
    title: "Type",
    dataType: "String",
    sortable: true,
    capitalize: true,
    width: 150,
    format: (value, data) => <Cell capitalize={1} sortable={1}>{(data.friendly_name || value)}</Cell>
  },
  { key: "category", title: "Category", dataType: "String", sortable: true, capitalize: true, width: 150, format: (value, data) => (data.category || "Uncategorized") },
  { key: "account_number", title: "Account Number", dataType: "String", visible: false, sortable: true, capitalize: true, format: (value, data) => <Cell uppercase={1}>{value ? `****${value.slice(0, 4)}` : "N/A"}</Cell>},
  { key: "institution_name", title: "Institution", dataType: "String", sortable: true, capitalize: true },
  { key: "vesting_type", title: "Vesting Type", dataType: "String", sortable: true, capitalize: true, visible: false },
  { key: "assigned_percent", title: "Trust Percentage", dataType: "Number", sortable: true, format: (value) => `${value}%` },
  {
    key: "value",
    title: "Value",
    dataType: "Number",
    format: (value, data) => value ? `${(value).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    })}` : "$0"
  },
  {
    key: "trust_assets",
    title: "Trust Assets",
    dataType: "Number",
    format: (value, data) => value ? `${(value).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    })}` : "$0"
  },
  { key: "inflation", title: "Inflation Adjusted", dataType: "Boolean", capitalize: true, sortable: true, labels: (data) => ["Yes", "No"], visible: false },
  { key: "created_at", title: "Created", dataType: "Date", sortable: true, sortDirection: "Descend" },
  {
    title: "Actions",
    key: "show-hide-details-row",
    isSortable: false,
    width: 145,
    isResizable: false,
    isReorderable: false,
    buttons: (data) => [
      {
        Component: FontAwesomeIcon,
        tooltipProps: {
          className: "tooltip neutral",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "View"
        },
        props: {
          icon: ["fal", "eye"],
          size: "xl",
          className: "table_button_icon",
          color: theme.hopeTrustBlue,
          style: {
            minWidth: "35px",
            cursor: "pointer"
          }
        },
        onClick: {
          async: false,
          handler: openCreateGrantorAssetModal,
          arguments: [data.type, data.account_type, data.source, data, false, true, data.simulation]
        },
        show: () => {
          const session = store.getState().session;
          const account = store.getState().accounts.find((a) => a.account_id === session.account_id);
          return account.permissions.includes("grantor-assets-view") && !account.permissions.includes("grantor-assets-edit")
        }
      },
      {
        Component: FontAwesomeIcon,
        tooltipProps: {
          className: "tooltip neutral",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "Edit"
        },
        props: {
          icon: ["fal", "pen-to-square"],
          size: "xl",
          className: "table_button_icon",
          color: theme.hopeTrustBlue,
          style: {
            minWidth: "35px",
            cursor: "pointer"
          }
        },
        onClick: {
          async: false,
          handler: openCreateGrantorAssetModal,
          arguments: [data.type, data.account_type, data.source, data, true, false, data.simulation]
        },
        show: () => {
          const session = store.getState().session;
          const account = store.getState().accounts.find((a) => a.account_id === session.account_id);
          return account.permissions.includes("grantor-assets-edit")
        }
      },
      {
        Component: FontAwesomeIcon,
        tooltipProps: {
          className: "tooltip error",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "Delete"
        },
        props: {
          icon: ["fal", "trash-can"],
          size: "xl",
          className: "table_button_icon",
          color: theme.errorRed,
          style: {
            minWidth: "35px",
            cursor: "pointer"
          },
          promptable: 1,
          prompt: "Are you sure you want to delete this asset?",
        },
        onClick: {
          async: true,
          handler: deleteGrantorAssetRecord,
          arguments: [data.id, data.plaid_item_id]
        },
        show: () => {
          const session = store.getState().session;
          const account = store.getState().accounts.find((a) => a.account_id === session.account_id);
          return account.permissions.includes("grantor-assets-edit") && !data.simulation
        }
      },
      {
        Component: FontAwesomeIcon,
        tooltipProps: {
          className: "tooltip error",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "Delete"
        },
        props: {
          icon: ["fal", "trash-can"],
          size: "xl",
          className: "table_button_icon",
          color: theme.errorRed,
          style: {
            minWidth: "35px",
            cursor: "pointer"
          },
          promptable: 1,
          prompt: "Are you sure you want to remove this medication from your simulation?",
        },
        onClick: {
          async: true,
          handler: deleteMytoAsset,
          arguments: [data.id]
        },
        show: () => {
          const session = store.getState().session;
          const account = store.getState().accounts.find((a) => a.account_id === session.account_id);
          return account.permissions.includes("grantor-assets-edit") && data.simulation
        }
      },
      {
        Component: PlaidButton,
        tooltipProps: {
          className: "tooltip error",
          "data-tooltip": "",
          "data-tooltip-position": "left",
          "data-tooltip-content": data.bank_status ? `${data.bank_status.includes("PENDING_EXPIRATION__") ? `Authorization will expire ${moment(data.bank_status.split("PENDING_EXPIRATION__")[1]).fromNow()}` : "Authorization has expired. Click to reauthorize."}` : "Authorization has expired. Click to reauthorize."
        },
        props: {
          access_token: data.access_token,
          user: store.getState().user,
          session: store.getState().session,
          onSuccess: (token, metadata, dispatch) => {
            if (token && metadata) dispatch(openPlaidLinkModal(token, metadata));
          },
          promptable: 0,
          Component: (open, disabled) => {
            return <FontAwesomeIcon
              className="table_button_icon"
              icon={["fal", "warning"]}
              size="xl"
              color={disabled ? theme.labelGrey : theme.errorRed}
              style={{
                minWidth: "35px",
                cursor: "pointer"
              }}
              onClick={open} />;
          }
        },
        onClick: {},
        show: () => {
          const session = store.getState().session;
          const account = store.getState().accounts.find((a) => a.account_id === session.account_id);
          const needs_reflow = (data.bank_status ? (data.bank_status === "LOGIN_REQUIRED" || data.bank_status.includes("PENDING_EXPIRATION__")) : false);
          return account.permissions.includes("finance-edit") && needs_reflow && !data.simulation
        }
      }
    ]
  }
];

export const beneficiary_assets_table_columns = [
  {
    key: "icon",
    isResizable: false,
    isReorderable: false,
    title: "",
    mobile_title: "Icon",
    dataType: "String",
    width: 60,
    format: (value, data) => {
      return (
        <div style={{ display: "flex" }}>
          {data.source === "Plaid"
            ? <div
              {...{
                className: "tooltip neutral",
                "data-tooltip": "",
                "data-tooltip-position": "right",
                "data-tooltip-content": "Bank Account Linked By Plaid"
              }}
              style={{ marginLeft: "-11px", color: theme.hopeTrustBlue, fontSize: "17px" }}><FontAwesomeIcon icon={["fad", "university"]} />
              <FontAwesomeIcon icon={["fas", "circle"]} style={{
                color: data.color || "#AAAAAA",
                display: "inline-block",
                verticalAlign: "top",
                background: "#FFF",
                borderRadius: "50%",
                padding: "1px",
                position: "relative",
                left: "-6px",
                top: "5px",
                zIndex: 1,
                fontSize: "9px"
              }} />
            </div>
            : null
          }
          {data.source !== "Plaid"
            ? <Indicator style={{ color: data.color || "#AAAAAA", display: "inline-block", verticalAlign: "top", marginRight: "10px" }} />
            : null
          }
        </div>
      );
    }
  },
  {
    key: "account_type",
    title: "Type",
    dataType: "String",
    sortable: true,
    capitalize: true,
    width: 150,
    format: (value, data) => <Cell capitalize={1} sortable={1}>{(data.friendly_name || value)}</Cell>
  },
  { key: "category", title: "Category", dataType: "String", sortable: true, capitalize: true, width: 150, format: (value, data) => (data.category || "Uncategorized") },
  { key: "account_number", title: "Account Number", dataType: "String", visible: false, sortable: true, capitalize: true, format: (value, data) => <Cell uppercase={1}>{value ? `****${value.slice(0, 4)}` : "N/A"}</Cell> },
  { key: "institution_name", title: "Institution", dataType: "String", sortable: true, capitalize: true },
  {
    key: "value",
    title: "Total Value",
    dataType: "Number",
    format: (value, data) => value ? `${(value).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    })}` : "$0"
  },
  {
    key: "net_value",
    title: "Net Value",
    dataType: "Number",
    format: (value, data) => value ? `${(value).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    })}` : "$0"
  },
  { key: "inflation", title: "Inflation Adjusted", dataType: "Boolean", capitalize: true, sortable: true, labels: (data) => ["Yes", "No"], visible: false },
  { key: "created_at", title: "Created", dataType: "Date", sortable: true, sortDirection: "Descend" },
  {
    title: "Actions",
    key: "show-hide-details-row",
    isSortable: false,
    width: 145,
    isResizable: false,
    isReorderable: false,
    buttons: (data) => [
      {
        Component: FontAwesomeIcon,
        tooltipProps: {
          className: "tooltip neutral",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "View"
        },
        props: {
          icon: ["fal", "eye"],
          size: "xl",
          className: "table_button_icon",
          color: theme.hopeTrustBlue,
          style: {
            minWidth: "35px",
            cursor: "pointer"
          }
        },
        onClick: {
          async: false,
          handler: openCreateBeneficiaryAssetModal,
          arguments: [data.type, data.account_type, data.source, data, false, true, data.simulation]
        },
        show: () => {
          const session = store.getState().session;
          const account = store.getState().accounts.find((a) => a.account_id === session.account_id);
          return account.permissions.includes("finance-view") && !account.permissions.includes("finance-edit")
        }
      },
      {
        Component: FontAwesomeIcon,
        tooltipProps: {
          className: "tooltip neutral",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "Edit"
        },
        props: {
          icon: ["fal", "pen-to-square"],
          size: "xl",
          className: "table_button_icon",
          color: theme.hopeTrustBlue,
          style: {
            minWidth: "35px",
            cursor: "pointer"
          }
        },
        onClick: {
          async: false,
          handler: openCreateBeneficiaryAssetModal,
          arguments: [data.type, data.account_type, data.source, data, true, false, data.simulation]
        },
        show: () => {
          const session = store.getState().session;
          const account = store.getState().accounts.find((a) => a.account_id === session.account_id);
          return account.permissions.includes("finance-edit")
        }
      },
      {
        Component: FontAwesomeIcon,
        tooltipProps: {
          className: "tooltip error",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "Delete"
        },
        props: {
          icon: ["fal", "trash-can"],
          size: "xl",
          className: "table_button_icon",
          color: theme.errorRed,
          style: {
            minWidth: "35px",
            cursor: "pointer"
          },
          promptable: 1,
          prompt: "Are you sure you want to delete this beneficiary asset?",
        },
        onClick: {
          async: true,
          handler: deleteBeneficiaryAssetRecord,
          arguments: [data.id, data.plaid_item_id]
        },
        show: () => {
          const session = store.getState().session;
          const account = store.getState().accounts.find((a) => a.account_id === session.account_id);
          return account.permissions.includes("finance-edit") && !data.simulation
        }
      },
      {
        Component: FontAwesomeIcon,
        tooltipProps: {
          className: "tooltip error",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "Delete"
        },
        props: {
          icon: ["fal", "trash-can"],
          size: "xl",
          className: "table_button_icon",
          color: theme.errorRed,
          style: {
            minWidth: "35px",
            cursor: "pointer"
          },
          promptable: 1,
          prompt: "Are you sure you want to remove this beneficiary asset from your simulation?",
        },
        onClick: {
          async: true,
          handler: deleteMytoAsset,
          arguments: [data.id]
        },
        show: () => {
          const session = store.getState().session;
          const account = store.getState().accounts.find((a) => a.account_id === session.account_id);
          return account.permissions.includes("finance-edit") && data.simulation
        }
      },
      {
        Component: PlaidButton,
        tooltipProps: {
          className: "tooltip error",
          "data-tooltip": "",
          "data-tooltip-position": "left",
          "data-tooltip-content": data.bank_status ? `${data.bank_status.includes("PENDING_EXPIRATION__") ? `Authorization will expire ${moment(data.bank_status.split("PENDING_EXPIRATION__")[1]).fromNow()}` : "Authorization has expired. Click to reauthorize."}` : "Authorization has expired. Click to reauthorize."
        },
        props: {
          access_token: data.access_token,
          user: store.getState().user,
          session: store.getState().session,
          onSuccess: (token, metadata, dispatch) => {
            if (token && metadata) dispatch(openPlaidLinkModal(token, metadata));
          },
          promptable: 0,
          Component: (open, disabled) => {
            return <FontAwesomeIcon
                    className="table_button_icon"
                    icon={["fal", "warning"]}
                    size="xl"
                    color={disabled ? theme.labelGrey : theme.errorRed}
                    style={{
                      minWidth: "35px",
                      cursor: "pointer"
                    }}
                    onClick={open} />;
          }
        },
        onClick: {},
        show: () => {
          const session = store.getState().session;
          const account = store.getState().accounts.find((a) => a.account_id === session.account_id);
          const needs_reflow = (data.bank_status ? (data.bank_status === "LOGIN_REQUIRED" || data.bank_status.includes("PENDING_EXPIRATION__")) : false);
          return account.permissions.includes("finance-edit") && needs_reflow && !data.simulation
        }
      }
    ]
  }
];

export const income_table_columns = [
  {
    key: "icon",
    isResizable: false,
    isReorderable: false,
    title: "",
    mobile_title: "Icon",
    dataType: "String",
    width: 60,
    format: (value, data) => <Indicator style={{ color: data.color || "#AAAAAA", display: "inline-block", verticalAlign: "top", marginRight: "10px" }} />
  },
  {
    key: "income_type",
    title: "Type",
    dataType: "String",
    sortable: true,
    capitalize: true,
    width: 150
  },
  { key: "category", title: "Category", dataType: "String", sortable: true, capitalize: true, width: 150, format: (value, data) => (data.category || "Uncategorized") },
  { key: "term", title: "Projected Age Range", dataType: "String", sortable: true, capitalize: true, width: 150, format: (value, data) => {
    const beneficiary = store.getState().relationship.list.find((u) => u.type === "beneficiary");
    const term = (data.term || "").split(",");
    const is_source_viable = term.length && term[0] <= getUserAge(beneficiary.birthday);
    return is_source_viable ? <Cell capitalize={1} color="#4BB543"><IncomeAgeRange alt="Age In Range"><span>{term[0]} - {term[1]}</span></IncomeAgeRange></Cell> : <Cell capitalize={1} color="red"><IncomeAgeRange alt="Age Out Of Range"><span>{term[0]} - {term[1]}</span></IncomeAgeRange></Cell>
  }},
  {
    key: "monthly_income",
    title: "Monthly Income",
    dataType: "Number",
    format: (value, data) => value ? `${(value).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    })}` : "$0"
  },
  {
    key: "annual_income",
    title: "Annual Income",
    dataType: "Number",
    format: (value, data) => value ? `${(value).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    })}` : "$0"
  },
  { key: "inflation", title: "Inflation Adjusted", dataType: "Boolean", capitalize: true, sortable: true, labels: (data) => ["Yes", "No"], visible: false },
  { key: "created_at", title: "Created", dataType: "Date", sortable: true, sortDirection: "Descend" },
  {
    title: "Actions",
    key: "show-hide-details-row",
    isSortable: false,
    width: 145,
    isResizable: false,
    isReorderable: false,
    buttons: (data) => [
      {
        Component: FontAwesomeIcon,
        tooltipProps: {
          className: "tooltip neutral",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "View"
        },
        props: {
          icon: ["fal", "eye"],
          size: "xl",
          className: "table_button_icon",
          color: theme.hopeTrustBlue,
          style: {
            minWidth: "35px",
            cursor: "pointer"
          }
        },
        onClick: {
          async: false,
          handler: openCreateIncomeModal,
          arguments: [{ ...data, term: (data.term || "").split(",")}, false, true, data.simulation]
        },
        show: () => {
          const session = store.getState().session;
          const account = store.getState().accounts.find((a) => a.account_id === session.account_id);
          return account.permissions.includes("finance-view") && !account.permissions.includes("finance-edit")
        }
      },
      {
        Component: FontAwesomeIcon,
        tooltipProps: {
          className: "tooltip neutral",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "Edit"
        },
        props: {
          icon: ["fal", "pen-to-square"],
          size: "xl",
          className: "table_button_icon",
          color: theme.hopeTrustBlue,
          style: {
            minWidth: "35px",
            cursor: "pointer"
          }
        },
        onClick: {
          async: false,
          handler: openCreateIncomeModal,
          arguments: [{ ...data, term: (data.term || "").split(",")}, true, false, data.simulation]
        },
        show: () => {
          const session = store.getState().session;
          const account = store.getState().accounts.find((a) => a.account_id === session.account_id);
          return account.permissions.includes("finance-edit")
        }
      },
      {
        Component: FontAwesomeIcon,
        tooltipProps: {
          className: "tooltip error",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "Delete"
        },
        props: {
          icon: ["fal", "trash-can"],
          size: "xl",
          className: "table_button_icon",
          color: theme.errorRed,
          style: {
            minWidth: "35px",
            cursor: "pointer"
          },
          promptable: 1,
          prompt: "Are you sure you want to delete this income source?",
        },
        onClick: {
          async: true,
          handler: deleteIncomeRecord,
          arguments: [data.id]
        },
        show: () => {
          const session = store.getState().session;
          const account = store.getState().accounts.find((a) => a.account_id === session.account_id);
          return account.permissions.includes("finance-edit") && !data.simulation
        }
      },
      {
        Component: FontAwesomeIcon,
        tooltipProps: {
          className: "tooltip error",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "Delete"
        },
        props: {
          icon: ["fal", "trash-can"],
          size: "xl",
          className: "table_button_icon",
          color: theme.errorRed,
          style: {
            minWidth: "35px",
            cursor: "pointer"
          },
          promptable: 1,
          prompt: "Are you sure you want to remove this income source from your simulation?",
        },
        onClick: {
          async: true,
          handler: deleteMytoAsset,
          arguments: [data.id]
        },
        show: () => {
          const session = store.getState().session;
          const account = store.getState().accounts.find((a) => a.account_id === session.account_id);
          return account.permissions.includes("finance-edit") && data.simulation
        }
      }
    ]
  }
];

export const benefits_table_columns = [
  {
    key: "icon",
    isResizable: false,
    isReorderable: false,
    title: "",
    mobile_title: "Icon",
    dataType: "String",
    width: 60,
    format: (value, data) => <Indicator style={{ color: data.color || "#AAAAAA", display: "inline-block", verticalAlign: "top", marginRight: "10px" }} />
  },
  {
    key: "program_name",
    title: "Type",
    dataType: "String",
    sortable: true,
    capitalize: true,
    width: 150
  },
  { key: "category", title: "Category", dataType: "String", sortable: true, capitalize: true, width: 150, format: (value, data) => (data.category || "Uncategorized") },
  {
    key: "term", title: "Projected Age Range", dataType: "String", sortable: true, capitalize: true, width: 150, format: (value, data) => {
      const beneficiary = store.getState().relationship.list.find((u) => u.type === "beneficiary");
      const term = (data.term || "").split(",");
      const is_source_viable = term.length && term[0] <= getUserAge(beneficiary.birthday);
      return is_source_viable ? <Cell capitalize={1}><IncomeAgeRange color="#4BB543" alt="Age In Range"><span>{term[0]} - {term[1]}</span></IncomeAgeRange></Cell> : <Cell capitalize={1}><IncomeAgeRange color="red" alt="Age Out Of Range"><span>{term[0]} - {term[1]}</span></IncomeAgeRange></Cell>
    }
  },
  {
    key: "renewal_date",
    title: "Renewal Date",
    dataType: "Date",
    sortable: true
  },
  {
    key: "value",
    title: "Monthly Income",
    dataType: "Number",
    format: (value, data) => value ? `${(value).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    })}` : "$0"
  },
  {
    key: "annual_value",
    title: "Annual Income",
    dataType: "Number",
    format: (value, data) => value ? `${(value).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    })}` : "$0"
  },
  { key: "account_number", title: "Account Number", dataType: "String", visible: false, sortable: true, capitalize: true, format: (value, data) => <Cell uppercase={1}>{value ? `****${value.slice(0, 4)}` : "N/A"}</Cell> },
  { key: "inflation", title: "Inflation Adjusted", dataType: "Boolean", capitalize: true, sortable: true, labels: (data) => ["Yes", "No"], visible: false },
  { key: "created_at", title: "Created", dataType: "Date", sortable: true, sortDirection: "Descend" },
  {
    title: "Actions",
    key: "show-hide-details-row",
    isSortable: false,
    width: 145,
    isResizable: false,
    isReorderable: false,
    buttons: (data) => [
      {
        Component: FontAwesomeIcon,
        tooltipProps: {
          className: "tooltip neutral",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "View"
        },
        props: {
          icon: ["fal", "eye"],
          size: "xl",
          className: "table_button_icon",
          color: theme.hopeTrustBlue,
          style: {
            minWidth: "35px",
            cursor: "pointer"
          }
        },
        onClick: {
          async: false,
          handler: openCreateBenefitModal,
          arguments: [{ ...data, term: (data.term || "").split(",") }, false, true, data.simulation]
        },
        show: () => {
          const session = store.getState().session;
          const account = store.getState().accounts.find((a) => a.account_id === session.account_id);
          return account.permissions.includes("finance-view") && !account.permissions.includes("finance-edit")
        }
      },
      {
        Component: FontAwesomeIcon,
        tooltipProps: {
          className: "tooltip neutral",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "Edit"
        },
        props: {
          icon: ["fal", "pen-to-square"],
          size: "xl",
          className: "table_button_icon",
          color: theme.hopeTrustBlue,
          style: {
            minWidth: "35px",
            cursor: "pointer"
          }
        },
        onClick: {
          async: false,
          handler: openCreateBenefitModal,
          arguments: [{ ...data, term: (data.term || "").split(",") }, true, false, data.simulation]
        },
        show: () => {
          const session = store.getState().session;
          const account = store.getState().accounts.find((a) => a.account_id === session.account_id);
          return account.permissions.includes("finance-edit")
        }
      },
      {
        Component: FontAwesomeIcon,
        tooltipProps: {
          className: "tooltip error",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "Delete"
        },
        props: {
          icon: ["fal", "trash-can"],
          size: "xl",
          className: "table_button_icon",
          color: theme.errorRed,
          style: {
            minWidth: "35px",
            cursor: "pointer"
          },
          promptable: 1,
          prompt: "Are you sure you want to delete this government benefit?",
        },
        onClick: {
          async: true,
          handler: deleteBenefitRecord,
          arguments: [data.id]
        },
        show: () => {
          const session = store.getState().session;
          const account = store.getState().accounts.find((a) => a.account_id === session.account_id);
          return account.permissions.includes("finance-edit") && !data.simulation
        }
      },
      {
        Component: FontAwesomeIcon,
        tooltipProps: {
          className: "tooltip error",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "Delete"
        },
        props: {
          icon: ["fal", "trash-can"],
          size: "xl",
          className: "table_button_icon",
          color: theme.errorRed,
          style: {
            minWidth: "35px",
            cursor: "pointer"
          },
          promptable: 1,
          prompt: "Are you sure you want to remove this government benefit from your simulation?",
        },
        onClick: {
          async: true,
          handler: deleteMytoAsset,
          arguments: [data.id]
        },
        show: () => {
          const session = store.getState().session;
          const account = store.getState().accounts.find((a) => a.account_id === session.account_id);
          return account.permissions.includes("finance-edit") && data.simulation
        }
      }
    ]
  }
];

export const expense_table_columns = [
  {
    key: "parent_category",
    title: "Category",
    dataType: "String",
    sortable: true,
    capitalize: true,
    groupCount: (group, groupProps, tableData) => {
      const beneficiary = store.getState().relationship.list.find((r) => r.type === "beneficiary");
      const category_items = tableData.filter((item) => item.parent_category === groupProps.groupKey[groupProps.groupKey.length - 1] && item.parent_category === groupProps.groupKey[0]);
      const items = category_items.filter(({ term }) => (term.length && term[0] <= getUserAge(beneficiary.birthday)));
      const category_sum = items.reduce((accumulator, { value }) => {
        return accumulator + value;
      }, 0);
      return ` ${category_sum.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      })}`;
    }
  },
  {
    key: "icon",
    isResizable: false,
    isReorderable: false,
    title: "",
    mobile_title: "Icon",
    dataType: "String",
    width: 60,
    format: (value, data) => {
      const item = store.getState().customer_support.core_settings.budget_categories.find((b) => b.name === data.budget_category);
      return <Indicator style={{ color: (item ? item.color : "#AAAAAA"), display: "inline-block", verticalAlign: "top", marginRight: "10px" }} />
    }
  },
  {
    key: "percent",
    isResizable: false,
    isReorderable: false,
    title: "",
    mobile_title: "Percentage",
    dataType: "String",
    width: 100,
    format: (val, data) => {
      const beneficiary = store.getState().relationship.list.find((u) => u.type === "beneficiary");
      const usable_budgets = store.getState().budgets.budget_items.filter((b) => b.term.length && b.term[0] <= getUserAge(beneficiary.birthday));
      const usable_myto_budgets = store.getState().myto.budgets.filter((b) => b.term.length && b.term[0] <= getUserAge(beneficiary.birthday));
      const total_budget = usable_budgets.reduce((a, { value }) => a + value, 0);
      const total_myto_budget = usable_myto_budgets.reduce((a, { value }) => a + value, 0);
      const is_budget_viable = data.term.length && data.term[0] <= getUserAge(beneficiary.birthday);
      return <Cell>{data.simulation && is_budget_viable && total_myto_budget ? ((data.value / total_myto_budget) * 100).toFixed(2) : (is_budget_viable && total_budget) ? ((data.value / total_budget) * 100).toFixed(2) : 0}%</Cell>
    }
  },
  {
    key: "budget_category",
    title: "Type",
    dataType: "String",
    capitalize: true,
    sortable: true
  },
  {
    key: "term", title: "Projected Age Range", dataType: "String", sortable: true, capitalize: true, width: 150, format: (value, data) => {
      const beneficiary = store.getState().relationship.list.find((u) => u.type === "beneficiary");
      const term = (data.term || "").split(",");
      const is_source_viable = term.length && term[0] <= getUserAge(beneficiary.birthday);
      return is_source_viable ? <Cell capitalize={1}><IncomeAgeRange color="#4BB543" alt="Age In Range"><span>{term[0]} - {term[1]}</span></IncomeAgeRange></Cell> : <Cell capitalize={1}><IncomeAgeRange color="red" alt="Age Out Of Range"><span>{term[0]} - {term[1]}</span></IncomeAgeRange></Cell>
    }
  },
  {
    key: "value",
    title: "Monthly Value",
    dataType: "Number",
    format: (value, data) => value ? `${(value).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    })}` : "$0"
  },
  {
    key: "annual_value",
    title: "Annual Value",
    dataType: "Number",
    format: (value, data) => value ? `${(value).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    })}` : "$0"
  },
  { key: "inflation", title: "Inflation Adjusted", dataType: "Boolean", capitalize: true, sortable: true, labels: (data) => ["Yes", "No"], visible: false },
  { key: "created_at", title: "Created", dataType: "Date", sortable: true, sortDirection: "Descend" },
  {
    title: "Actions",
    key: "show-hide-details-row",
    isSortable: false,
    width: 145,
    isResizable: false,
    isReorderable: false,
    buttons: (data) => [
      {
        Component: FontAwesomeIcon,
        tooltipProps: {
          className: "tooltip neutral",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "View"
        },
        props: {
          icon: ["fal", "eye"],
          size: "xl",
          className: "table_button_icon",
          color: theme.hopeTrustBlue,
          style: {
            minWidth: "35px",
            cursor: "pointer"
          }
        },
        onClick: {
          async: false,
          handler: openCreateBudgetModal,
          arguments: [{ ...data, term: (data.term || "").split(",") }, false, true, data.simulation]
        },
        show: () => {
          const session = store.getState().session;
          const account = store.getState().accounts.find((a) => a.account_id === session.account_id);
          return account.permissions.includes("budget-view") && !account.permissions.includes("budget-edit")
        }
      },
      {
        Component: FontAwesomeIcon,
        tooltipProps: {
          className: "tooltip neutral",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "Edit"
        },
        props: {
          icon: ["fal", "pen-to-square"],
          size: "xl",
          className: "table_button_icon",
          color: theme.hopeTrustBlue,
          style: {
            minWidth: "35px",
            cursor: "pointer"
          }
        },
        onClick: {
          async: false,
          handler: openCreateBudgetModal,
          arguments: [{ ...data, term: (data.term || "").split(",") }, true, false, data.simulation]
        },
        show: () => {
          const session = store.getState().session;
          const account = store.getState().accounts.find((a) => a.account_id === session.account_id);
          return account.permissions.includes("budget-edit")
        }
      },
      {
        Component: FontAwesomeIcon,
        tooltipProps: {
          className: "tooltip error",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "Delete"
        },
        props: {
          icon: ["fal", "trash-can"],
          size: "xl",
          className: "table_button_icon",
          color: theme.errorRed,
          style: {
            minWidth: "35px",
            cursor: "pointer"
          },
          promptable: 1,
          prompt: "Are you sure you want to delete this expense?",
        },
        onClick: {
          async: true,
          handler: deleteBudgetRecord,
          arguments: [data.id]
        },
        show: () => {
          const session = store.getState().session;
          const account = store.getState().accounts.find((a) => a.account_id === session.account_id);
          return account.permissions.includes("budget-edit") && !data.simulation
        }
      },
      {
        Component: FontAwesomeIcon,
        tooltipProps: {
          className: "tooltip error",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "Delete"
        },
        props: {
          icon: ["fal", "trash-can"],
          size: "xl",
          className: "table_button_icon",
          color: theme.errorRed,
          style: {
            minWidth: "35px",
            cursor: "pointer"
          },
          promptable: 1,
          prompt: "Are you sure you want to remove this expense from your simulation?",
        },
        onClick: {
          async: true,
          handler: deleteMytoAsset,
          arguments: [data.id]
        },
        show: () => {
          const session = store.getState().session;
          const account = store.getState().accounts.find((a) => a.account_id === session.account_id);
          return account.permissions.includes("budget-edit") && data.simulation
        }
      }
    ]
  }
];

export const myto_table_columns = [
  {
    key: "simulation_name",
    title: "Name",
    dataType: "String",
    capitalize: true,
    width: 150,
    format: (value, data) => <Cell capitalize={1}>{data.is_actual && !data.simulation_name ? `Projection - ${moment(data.created_at).format("MMMM DD, YYYY h:mm A")}` : (data.simulation_name || `Simulation #${data.id}`)}</Cell>
  },
  {
    key: "desired_life_of_fund",
    title: "Fund Life",
    dataType: "Number",
    sortable: true,
    capitalize: true,
    format: (value, data) => <Cell capitalize={1} sortable={1}>{`${(data.desired_life_of_fund || 0).toLocaleString()} ${(data.desired_life_of_fund === 1) ? "year" : "years"}`}</Cell>
  },
  {
    key: "replacement_cost",
    title: "Replacement Cost",
    dataType: "Number",
    capitalize: true,
    format: (value, data) => <Cell>${(data.total_benefits_value > 0) ? ((data.replacement_cost || 0)).toLocaleString() : "0"}</Cell>
  },
  {
    key: "trust_funding_gap",
    title: "Need - Avail. Assets =  Gap (With Benefits)",
    dataType: "Number",
    width: 200,
    format: (value, data) => <Cell>${(data.total_benefits_value > 0) ? <span>{(data.final_average || 0).toLocaleString()} <Strong color="black">-</Strong> ${(data.current_available || 0).toLocaleString()} <Strong color="black">=</Strong> <Strong is_negative={data.trust_funding_gap < 0 ? 1 : 0}>${(data.trust_funding_gap || 0).toLocaleString()}</Strong></span> : "0"}</Cell>
  },
  {
    key: "trust_fund_gap_without_benefits",
    title: "Need - Avail. Assets =  Gap (Without Benefits)",
    dataType: "Number",
    width: 200,
    format: (value, data) => <Cell>${(data.total_benefits_value > 0) ? <span>{(data.final_average_without_benefits || 0).toLocaleString()} <Strong color="black">-</Strong> ${(data.current_available || 0).toLocaleString()} <Strong color="black">=</Strong> <Strong is_negative={data.trust_fund_gap_without_benefits < 0 ? 1 : 0}>${(data.trust_fund_gap_without_benefits || 0).toLocaleString()}</Strong></span> : <span>{(data.final_average || 0).toLocaleString()} <Strong color="black">-</Strong> ${(data.current_available || 0).toLocaleString()} <Strong color="black">=</Strong> <Strong is_negative={data.trust_funding_gap < 0 ? 1 : 0}>${(data.trust_funding_gap || 0).toLocaleString()}</Strong></span>}</Cell>
  },
  { key: "created_at", title: "Created", dataType: "Date", sortable: true, sortDirection: "Descend" },
  {
    title: "Actions",
    key: "show-hide-details-row",
    isSortable: false,
    width: 145,
    isResizable: false,
    isReorderable: false,
    buttons: (data) => [
      {
        Component: FontAwesomeIcon,
        tooltipProps: {
          className: "tooltip error",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "Delete"
        },
        props: {
          icon: ["fal", "trash-can"],
          size: "xl",
          className: "table_button_icon",
          color: theme.errorRed,
          style: {
            minWidth: "35px",
            cursor: "pointer"
          },
          promptable: 1,
          prompt: "Are you sure you want to delete this simulation?",
        },
        onClick: {
          async: true,
          handler: deleteMYTOSimulation,
          arguments: [data.id]
        },
        show: () => {
          const session = store.getState().session;
          const account = store.getState().accounts.find((a) => a.account_id === session.account_id);
          return account.permissions.includes("myto-edit")
        }
      },
      {
        Component: FontAwesomeIcon,
        tooltipProps: {
          className: "tooltip neutral",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "Load"
        },
        props: {
          icon: ["fal", "arrow-up-from-bracket"],
          size: "xl",
          className: "table_button_icon",
          color: theme.hopeTrustBlue,
          style: {
            minWidth: "35px",
            cursor: "pointer"
          }
        },
        onClick: {
          async: false,
          handler: loadSimulation,
          arguments: [data]
        },
        show: () => {
          const session = store.getState().session;
          const account = store.getState().accounts.find((a) => a.account_id === session.account_id);
          return account.permissions.includes("myto-edit")
        }
      },
      {
        Component: FontAwesomeIcon,
        tooltipProps: {
          className: "tooltip neutral",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "Set Default"
        },
        props: {
          icon: ["fal", "check-circle"],
          size: "xl",
          className: "table_button_icon",
          color: theme.hopeTrustBlue,
          style: {
            minWidth: "35px",
            cursor: "pointer"
          }
        },
        onClick: {
          async: true,
          handler: updateMYTOSimulation,
          arguments: [data.id, { default_simulation: true }]
        },
        show: () => {
          const session = store.getState().session;
          const account = store.getState().accounts.find((a) => a.account_id === session.account_id);
          return account.permissions.includes("myto-edit") && !data.default_simulation
        }
      },
      {
        Component: FontAwesomeIcon,
        tooltipProps: {
          className: "tooltip disabled",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "Default"
        },
        props: {
          icon: ["fal", "check-circle"],
          size: "xl",
          className: "table_button_icon",
          color: theme.labelGrey,
          style: {
            minWidth: "35px",
            cursor: "pointer",
            pointerEvents: "none"
          }
        },
        onClick: {},
        show: () => {
          const session = store.getState().session;
          const account = store.getState().accounts.find((a) => a.account_id === session.account_id);
          return account.permissions.includes("myto-edit") && data.default_simulation
        }
      },
      {
        Component: FontAwesomeIcon,
        tooltipProps: {
          className: "tooltip neutral",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "View"
        },
        props: {
          icon: ["fal", "eye"],
          size: "xl",
          className: "table_button_icon",
          color: theme.hopeTrustBlue,
          style: {
            minWidth: "35px",
            cursor: "pointer"
          }
        },
        onClick: {
          async: false,
          handler: openMYTOSimulation,
          arguments: [data]
        },
        show: () => {
          const session = store.getState().session;
          const account = store.getState().accounts.find((a) => a.account_id === session.account_id);
          return account.permissions.includes("myto-view")
        }
      },
    ]
  }
];