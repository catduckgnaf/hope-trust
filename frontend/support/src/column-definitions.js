import { openCreateProductModal, deleteProduct } from "./store/actions/product";
import {
  deletePartnerPlan,
  deleteUserPlan,
  openCreatePartnerPlanModal,
  openCreateUserPlanModal
} from "./store/actions/plans";
import { Icon, Text } from "./global-components";
import { navigateTo } from "./store/actions/navigation";
import ReactAvatar from "react-avatar";
import moment from "moment";
import {
  updateMembership,
  deleteMembership
} from "./store/actions/membership";
import { customerServiceGetPendingApprovals, openUserUpdateModal, sendClientInvite, updateCoreSettings } from "./store/actions/customer-support";
import { openPushNotificationModal } from "./store/actions/notification";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { OnlineIndicator } from "./global-components";
import { openAccountUpdateModal } from "./store/actions/account";
import { advisor_types, createReferralCode, generateOrgExport } from "./store/actions/partners";
import { getReadableFileSizeString, getTicketIcon, US_STATES } from "./utilities";
import { theme } from "./global-styles";
import { deleteDocument, getDocument, openCreateDocumentModal } from "./store/actions/document";
import { deleteTicket, openCreateTicketModal } from "./store/actions/tickets";
import { deleteMessageRecord, openMessage } from "./store/actions/message";
import { copyToClipboard } from "./store/actions/utilities";
import { deleteReferral, openCreateReferralModal } from "./store/actions/referral";
import { deleteSecurityQuestionRecord, openCreateSecurityQuestionModal, openSecurityQuestionResponseModal } from "./store/actions/security-questions";
import { approveWholesaleRequest, declineWholesaleRequest, deleteWholesaleConnection, deleteWholesaler, openCreateWholesaleConnectionModal, openCreateWholesaleModal } from "./store/actions/wholesale";
import { deleteRetailer, openCreateRetailModal } from "./store/actions/retail";
import { deleteAgent, openCreateAgentModal } from "./store/actions/agents";
import { approveGroupRequest, declineGroupRequest, deleteGroup, deleteGroupConnection, openCreateGroupConnectionModal, openCreateGroupModal } from "./store/actions/groups";
import { deleteTeam, openCreateTeamModal } from "./store/actions/teams";
import { deleteCEConfig, openCeConfigModal, openCeCourseModal, deleteCECourse } from "./store/actions/ce-management";
import { Cell, PermissionTag, PermissionTagIcon, PermissionTagInner, PermissionTagPadding } from "./Components/GenericTable/style";
import { store } from "./store";
import config from "./config";
import { deleteSession, deleteSurvey, openCreateSurveyModal } from "./store/actions/survey";
const Gateway = config.apiGateway.find((gateway) => gateway.name === "support");

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

const devices = {
  "Generic Linux": { icon: "linux", type: "fab" },
  "Android": { icon: "android", type: "fab" },
  "BlackBerry": { icon: "blackberry", type: "fab" },
  "Bluebird": { icon: "phone-laptop", type: "fas" },
  "Chrome OS": { icon: "chrome", type: "fab" },
  "Datalogic": { icon: "phone-laptop", type: "fas" },
  "Honeywell": { icon: "phone-laptop", type: "fas" },
  "iPad": { icon: "tablet-alt", type: "fas" },
  "iPhone": { icon: "mobile-alt", type: "fas" },
  "iPod": { icon: "mp3-player", type: "fas" },
  "macOS": { icon: "desktop-alt", type: "fas" },
  "Windows": { icon: "windows", type: "fab" },
  "Zebra": { icon: "phone-laptop", type: "fas" },
  "default": { icon: "phone-laptop", type: "fas" }
};

export const transaction_table_columns = [
  { key: "name", title: "Customer", dataType: "String", sortable: true, capitalize: true },
  { key: "type", title: "Type", dataType: "String", sortable: true, capitalize: true },
  { key: "status", title: "Status", dataType: "String", sortable: true, capitalize: true },
  { key: "amount", title: "Amount", dataType: "Number", is_currency: true },
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
      },
      {
        Component: FontAwesomeIcon,
        tooltipProps: {
          className: "tooltip neutral",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "Invoice"
        },
        props: {
          icon: ["fal", "file-invoice-dollar"],
          size: "xl",
          className: "table_button_icon",
          color: theme.hopeTrustBlue,
          style: {
            minWidth: "35px",
            cursor: "pointer"
          }
        },
        link: data.invoice_url,
        show: !!data.invoice_url
      },
      {
        Component: FontAwesomeIcon,
        tooltipProps: {
          className: "tooltip neutral",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "PDF Invoice"
        },
        props: {
          icon: ["fal", "file-pdf"],
          size: "xl",
          className: "table_button_icon",
          color: theme.hopeTrustBlue,
          style: {
            minWidth: "35px",
            cursor: "pointer"
          }
        },
        link: data.invoice_pdf,
        show: !!data.invoice_pdf
      }
    ]
  },
];

export const product_table_columns = [
  { key: "title", title: "Title", dataType: "String", capitalize: true },
  {
    key: "status",
    title: "Status",
    dataType: "String",
    capitalize: true,
    width: 125,
    isEditable: true,
    editorType: "select",
    options: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" }
    ]
  },
  { key: "amount", title: "Amount", dataType: "Number", is_currency: true },
  { key: "count", title: "Purchases", dataType: "Number", is_currency: false, filter: (data, dispatch) => data.count ? dispatch(navigateTo("/user-management", `?customer_ids=${data.customers}`)) : null },
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
          handler: openCreateProductModal,
          arguments: [data, true, false]
        },
        show: true
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
          }
        },
        onClick: {
          async: true,
          handler: deleteProduct,
          arguments: [data.id, data.price_id]
        },
        show: true
      }
    ]
  }
];

export const partner_plan_table_columns = [
  { key: "name", title: "Name", dataType: "String", sortable: true, capitalize: true },
  { key: "monthly", title: "Cost", dataType: "Number", is_currency: true },
  { key: "discount", title: "Discount", dataType: "String", uppercase: true, sortable: true },
  { key: "type", title: "Type", dataType: "String", sortable: true, capitalize: true, format: (value, data) => {
    const type = advisor_types.find((t) => t.name === value);
    if (type) return type.alias;
    return value;
    
  }},
  { key: "count", title: "Subscribers", dataType: "Number", is_currency: false, filter: (data, dispatch) => data.count ? dispatch(navigateTo("/partner-management", `?account_ids=${data.account_ids}`)) : null },
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
          handler: openCreatePartnerPlanModal,
          arguments: [data, true, false]
        },
        show: true
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
          }
        },
        onClick: {
          async: true,
          handler: deletePartnerPlan,
          arguments: [data.id]
        },
        show: true
      }
    ]
  }
];

export const user_plan_table_columns = [
  { key: "name", title: "Name", dataType: "String", sortable: true, capitalize: true },
  { key: "monthly", title: "Cost", dataType: "Number", is_currency: true },
  { key: "discount", title: "Discount", dataType: "String", uppercase: true, sortable: true },
  { key: "type", title: "Type", dataType: "String", sortable: true, capitalize: true },
  { key: "count", title: "Subscribers", dataType: "Number", is_currency: false, filter: (data, dispatch) => data.count ? dispatch(navigateTo("/client-management", `?account_ids=${data.account_ids}`)) : null },
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
          handler: openCreateUserPlanModal,
          arguments: [data, true, false]
        },
        show: true
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
          }
        },
        onClick: {
          async: true,
          handler: deleteUserPlan,
          arguments: [data.id]
        },
        show: true
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
          src: `${Gateway.endpoint}/users/get-user-avatar/${data.cognito_id}?${Date.now()}`,
          size: 30,
          name: `${data.first_name} ${data.last_name}`,
          round: true
        }
      };
    }
  },
  { key: "name", title: "Name", dataType: "String", capitalize: true },
  {
    key: "email",
    title: "Email",
    dataType: "String",
    format: (value, data) => <Cell><a rel="noreferrer" target="_blank" href={value ? `mailto:${value}` : null}>{value ? value : "N/A"}</a></Cell>
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
      const device_item = devices[data.device];
      return (
        <Cell>
          {data.device
            ? <FontAwesomeIcon title={data.device} style={{ marginRight: "10px" }} icon={[device_item.type, device_item.icon]} />
            : null
          }{date ? moment(date, "x").format("MMMM DD, YYYY [at] h:mm a") : "N/A"}
        </Cell>
      );
    }
  },
  { key: "logins", title: "Logins", dataType: "Number", is_currency: false, width: 105 },
  { key: "count", title: "Memberships", dataType: "Number", is_currency: false, width: 150, filter: (data, dispatch) => data.count ? dispatch(navigateTo("/client-management", `?account_ids=${data.accounts}`)) : null },
  { key: "created_at", title: "Created", dataType: "Date", sortable: true, sortDirection: "Descend", width: 125 },
  {
    key: "icon",
    isResizable: false,
    isReorderable: false,
    title: null,
    mobile_title: "Customer Status",
    dataType: "String",
    width: 60,
    format: (icon, data) => {
      return (
        <Cell
          nooverflow={1}
          color={data.customer_id ? (data.status === "inactive" ? theme.errorRed : theme.success) : theme.lineGrey}>
            <span {...({
              style: { pointerEvents: data.customer_id ? "all" : "none"},
              className: "tooltip success",
              "data-tooltip": "",
              "data-tooltip-position": "top",
              "data-tooltip-content": data.customer_id ? (data.status === "inactive" ? "Payment Collection Paused" : "Account Customer") : ""
            })}>
              <FontAwesomeIcon icon={["fad", "usd-circle"]} />
            </span>
        </Cell>
      );
    }
  },
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
          handler: openUserUpdateModal,
          arguments: [data, true]
        },
        show: true
      },
      {
        Component: FontAwesomeIcon,
        tooltipProps: {
          className: "tooltip neutral",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "Monitor"
        },
        props: {
          icon: ["fal", "square-user"],
          size: "xl",
          className: "table_button_icon",
          color: theme.hopeTrustBlue,
          style: {
            minWidth: "35px",
            cursor: "pointer"
          }
        },
        link: `https://app.logrocket.com/maqc00/hopetrust/?filters=[{"type":"email","operator":{"name":"is","type":"IS","hasStrings":true,"autocompleteEnabled":true},"strings":["${encodeURIComponent(data.email)}"]},{"id":"rJz0dxQBq","type":"timeOnPage","params":{"url":{"operator":{"name":"contains","type":"CONTAINS","hasStrings":true},"strings":["${process.env.REACT_APP_STAGE === "production" ? "app" : (process.env.REACT_APP_STAGE || "development")}"],"type":"href"},"time":{"operator":{"name":"at least once","type":"GT","hasStrings":false,"hideLabel":true,"value":"1s"},"strings":["1s"]}}}]`,
        show: data.online
      },
      {
        Component: FontAwesomeIcon,
        tooltipProps: {
          className: "tooltip neutral",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "View Partner"
        },
        props: {
          icon: ["fal", "user-tie"],
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
          handler: navigateTo,
          arguments: ["/partner-management", `?account_ids=${data.cognito_id}`]
        },
        show: data.is_partner
      },
      {
        Component: FontAwesomeIcon,
        tooltipProps: {
          className: "tooltip neutral",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "Send Push"
        },
        props: {
          icon: ["fal", "bell-on"],
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
          handler: openPushNotificationModal,
          arguments: [[data.cognito_id]]
        },
        show: true
      }
    ]
  }
];

export const cs_table_columns = [
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
          src: `${Gateway.endpoint}/users/get-user-avatar/${data.cognito_id}?${Date.now()}`,
          size: 30,
          name: `${data.first_name} ${data.last_name}`,
          round: true
        }
      };
    }
  },
  { key: "name", title: "Name", dataType: "String", capitalize: true },
  {
    key: "email",
    title: "Email",
    dataType: "String",
    format: (value, data) => <Cell><a rel="noreferrer" target="_blank" href={value ? `mailto:${value}` : null}>{value ? value : "N/A"}</a></Cell>
  },
  {
    key: "status",
    title: "Status",
    dataType: "String",
    capitalize: true,
    sortable: true,
    width: 125
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
          handler: openUserUpdateModal,
          arguments: [data, true]
        },
        show: true
      }
    ]
  }
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
          src: `${Gateway.endpoint}/users/get-user-avatar/${data.account_id}?${Date.now()}`,
          size: 30,
          name: data.name,
          round: true
        }
      };
    }
  },
  { key: "name", title: "Name", dataType: "String", capitalize: true },
  { key: "plan_name", title: "Plan", dataType: "String", sortable: true, capitalize: true },
  { key: "subscription_id", title: "Subscription ID", dataType: "String", uppercase: true },
  { key: "partner_account_id", title: "Partner", dataType: "String", capitalize: true, sortable: true, format: (value, data) => data.partner_name || "N/A"},
  { key: "count", title: "Members", dataType: "Number", is_currency: false, filter: (data, dispatch) => data.count ? dispatch(navigateTo("/user-management", `?account_id=${data.account_id}`)) : null },
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
          handler: openAccountUpdateModal,
          arguments: [data, "user", false]
        },
        show: true
      }
    ]
  }
];

export const accounts_widget_columns = [
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
          src: `${Gateway.endpoint}/users/get-user-avatar/${data.account_id}?${Date.now()}`,
          size: 30,
          name: data.name,
          round: true
        }
      };
    }
  },
  { key: "name", title: "Name", dataType: "String", capitalize: true },
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
          handler: openAccountUpdateModal,
          arguments: [data, "user", false]
        },
        show: true
      }
    ]
  }
];

export const partners_table_columns = [
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
          src: `${Gateway.endpoint}/users/get-user-avatar/${data.account_id}?${Date.now()}`,
          size: 30,
          name: data.partner_name,
          round: true
        }
      };
    }
  },
  { key: "partner_name", title: "Name", dataType: "String" },
  { key: "plan_name", title: "Plan", dataType: "String", sortable: true, capitalize: true, visible: false },
  { key: "name", title: "Organization", dataType: "String", sortable: true, capitalize: true, width: 150 },
  {
    key: "email",
    title: "Email",
    dataType: "String",
    format: (value, data) => <Cell><a rel="noreferrer" target="_blank" href={value ? `mailto:${value}` : null}>{value ? value : "N/A"}</a></Cell>
  },
  { key: "referral_code", title: "Referral Code", dataType: "String", uppercase: true, visible: false, onClick: (value, data, dispatch) => dispatch(copyToClipboard(value, "Referral Code"))},
  { key: "partner_type", title: "Type", dataType: "String", sortable: true, capitalize: true, format: (value, data) => {
    const type = advisor_types.find((t) => t.name === value);
    if (type) return type.alias;
    return value;
    
  }},
  { key: "count", title: "Clients", dataType: "Number", is_currency: false, filter: (data, dispatch) => data.count ? dispatch(navigateTo("/client-management", `?account_ids=${data.accounts}`)) : null },
  { key: "is_entity", title: "Entity?", dataType: "Boolean", sortable: true, capitalize: true, labels: (data) => ["Yes", "No"] },
  { key: "contract_signed_on", title: "Contracts", dataType: "Date", sortable: true, width: 130 },
  { key: "created_at", title: "Created", dataType: "Date", sortable: true, width: 130, sortDirection: "Descend" },
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
          handler: openAccountUpdateModal,
          arguments: [data, "partner", false]
        },
        show: true
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
          icon: ["fal", "circle-check"],
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
          handler: createReferralCode,
          arguments: [data]
        },
        show: !data.domain_approved && !data.referral_code && !["insurance"].includes(data.type)
      }
    ]
  }
];

export const partners_widget_columns = [
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
          src: `${Gateway.endpoint}/users/get-user-avatar/${data.cognito_id}?${Date.now()}`,
          size: 30,
          name: data.name,
          round: true
        }
      };
    }
  },
  { key: "partner_name", title: "Name", dataType: "String", capitalize: true },
  { key: "name", title: "Organization", dataType: "String", capitalize: true },
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
          handler: openAccountUpdateModal,
          arguments: [data, "partner", false]
        },
        show: (data.domain_approved || data.referral_code)
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
          icon: ["fal", "circle-check"],
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
          handler: createReferralCode,
          arguments: [data]
        },
        show: (!data.domain_approved && !data.referral_code) && !["insurance"].includes(data.type)
      }
    ]
  }
];

export const users_widget_columns = [
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
          src: `${Gateway.endpoint}/users/get-user-avatar/${data.cognito_id}?${Date.now()}`,
          size: 30,
          name: data.name,
          round: true
        }
      };
    }
  },
  { key: "name", title: "Name", dataType: "String", capitalize: true },
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
          handler: openUserUpdateModal,
          arguments: [data, true]
        },
        show: true
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

export const tickets_widget_columns = [
  { key: "icon", isResizable: false, isReorderable: false, title: "", mobile_title: "Icon", dataType: "String", width: 60, format: (icon, data) => <Cell><Icon status={data.permission_status || data.status} type={data.request_type}><FontAwesomeIcon icon={["fad", getTicketIcon(data.request_type, data.status)]} swapOpacity={!["money", "medical"].includes(data.request_type)} /></Icon></Cell> },
  { key: "title", title: "Title", dataType: "String", capitalize: true },
  {
    key: "status",
    title: "Status",
    dataType: "String",
    format: (value, data) => <Text capitalize bold status={data.status}>{value}</Text>,
    isEditable: true,
    width: 125,
    editorType: "select",
    options: [
      { value: "new", label: "New" },
      { value: "open", label: "Open" },
      { value: "pending", label: "Pending" },
      { value: "solved", label: "Solved" },
      { value: "closed", label: "Closed" }
    ]
  },
  { key: "created_at", title: "Created", dataType: "Date", sortDirection: "Descend", width: 125 },
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
          handler: openCreateTicketModal,
          arguments: [data, true, false]
        },
        show: true
      }
    ]
  }
];

export const message_widget_columns = [
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
          src: `${Gateway.endpoint}/users/get-user-avatar/${data.cognito_id}?${Date.now()}`,
          size: 30,
          name: data.sender_name,
          round: true
        }
      };
    }
  },
  { key: "subject", title: "Title", dataType: "String", capitalize: true },
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
      const document_types = (store.getState().customer_support.core_settings.document_types || []);
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
    groupAppendage: (group, groupProps, tableData) => {
      const folder_items = tableData.filter((document) => document.core_account_name === groupProps.groupKey[0]);
      const folder_usage = folder_items.reduce((accumulator, { size }) => accumulator + size, 0);
      return ` (${getReadableFileSizeString(folder_usage)})`;
    },
    groupCount: (group, groupProps, tableData) => {
      const folder_items = tableData.filter((document) => document.core_account_name === groupProps.groupKey[0]);
      return `${folder_items.length} ${folder_items.length === 1 ? "file" : "files"}`;
    }
  },
  {
    key: "folder",
    title: "Folder",
    dataType: "String",
    sortable: true,
    capitalize: true,
    groupAppendage: (group, groupProps, tableData) => {
      const folder_items = tableData.filter((document) => document.folder === groupProps.groupKey[groupProps.groupKey.length - 1] && document.core_account_name === groupProps.groupKey[0]);
      const folder_usage = folder_items.reduce((accumulator, { size }) => accumulator + size, 0);
      return ` (${getReadableFileSizeString(folder_usage)})`;
    },
    groupCount: (group, groupProps, tableData) => {
      const folder_items = tableData.filter((document) => document.folder === groupProps.groupKey[groupProps.groupKey.length - 1] && document.core_account_name === groupProps.groupKey[0]);
      return `${folder_items.length} ${folder_items.length === 1 ? "file" : "files"}`;
    }
  },
  { key: "friendly_name", title: "Name", dataType: "String", sortable: true, capitalize: true },
  {
    key: "document_type",
    title: "Type",
    dataType: "String",
    sortable: true,
    capitalize: true,
    isEditable: true,
    editorType: "select",
    options: (store.getState().customer_support.core_settings.document_types || []).map((d) => ({ value: d.type, label: d.type }))
  },
  { key: "private", title: "Private?", dataType: "Boolean", capitalize: true, labels: (data) => ["Yes", "No"], sortable: true, visible: false },
  {

    key: "file_type",
    title: "File Type",
    dataType: "String",
    sortable: true,
    visible: false,
    uppercase: true
  },
  {
  
    key: "account_name",
    title: "Account",
    dataType: "String",
    sortable: true
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
          async: true,
          handler: getDocument,
          arguments: [data.filename, data.account_id],
          callback: {
            action: (result) => window.open(result.payload, "_blank").focus(),
            dispatch: false
          }
        },
        show: true
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
          arguments: [{}, data, true, false]
        },
        show: true
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
          }
        },
        onClick: {
          async: true,
          handler: deleteDocument,
          arguments: [data.account_id, data.filename, data.friendly_name]
        },
        show: true
      }
    ]
  }
];

export const tickets_table_columns = [
  { key: "icon", isResizable: false, isReorderable: false, title: "", mobile_title: "Icon", dataType: "String", width: 60, format: (icon, data) => <Cell><Icon status={data.permission_status || data.status} type={data.request_type}><FontAwesomeIcon icon={["fad", getTicketIcon(data.request_type, data.status)]} swapOpacity={!["money", "medical"].includes(data.request_type)} /></Icon></Cell> },
  { key: "request_type", title: "Type", dataType: "String", sortable: true, capitalize: true, format: (value, data) => value ? (value === "other_request_type" ? "Other" : value.replace(/_/g, " ")) : "N/A" },
  { key: "title", title: "Title", dataType: "String", sortable: true, capitalize: true, visible: false },
  { key: "creator_name", title: "User", dataType: "String", sortable: true, capitalize: true, visible: false, format: (value, data) => {
    return (
      <div style={{ display: "flex" }}>
        <div style={{ marginRight: "10px" }}><ReactAvatar src={`${Gateway.endpoint}/users/get-user-avatar/${data.cognito_id}?${Date.now()}`} size={30} name={value} round /></div> <Cell sortable={1} capitalize={1}>{value}</Cell>
      </div>
    );
  }},
  { key: "account_name", title: "Account", dataType: "String", sortable: true, capitalize: true, format: (value, data) => {
    return (
      <div style={{ display: "flex" }}>
        <div style={{ marginRight: "10px" }}><ReactAvatar src={`${Gateway.endpoint}/users/get-user-avatar/${data.account_id}?${Date.now()}`} size={30} name={value} round /></div> <Cell sortable={1} capitalize={1}>{value}</Cell>
      </div>
    );
  }},
  { key: "user_plan_name", title: "Plan", dataType: "String", sortable: true, capitalize: true, format: (value, data) => value || data.partner_plan_name, visible: false },
  {
    key: "priority",
    title: "Priority",
    dataType: "String",
    sortable: true,
    capitalize: true,
    width: 125,
    format: (value, data) => <Text capitalize bold priority={data.priority}>{value}</Text>,
    isEditable: true,
    editorType: "select",
    options: [
      { value: "urgent", label: "Urgent" },
      { value: "high", label: "High" },
      { value: "normal", label: "Normal" },
      { value: "low", label: "Low" }
    ]
},
  {
    key: "assignee_name",
    title: "Assignee",
    dataType: "String",
    sortable: true,
    capitalize: true,
    format: (value, data) => {
      return (
        <div style={{ display: "flex" }}>
          <div style={{ marginRight: "10px" }}><ReactAvatar src={`${Gateway.endpoint}/users/get-user-avatar/${data.assignee}?${Date.now()}`} size={30} name={value} round /></div> <Cell sortable={1} capitalize={1}>{value || "Unassigned"}</Cell>
        </div>
      );
    }
  },
  {
    key: "status",
    title: "Status",
    dataType: "String",
    sortable: true,
    width: 125,
    format: (value, data) => <Text capitalize bold status={data.status}>{value}</Text>,
    isEditable: true,
    editorType: "select",
    options: [
      { value: "new", label: "New" },
      { value: "open", label: "Open" },
      { value: "pending", label: "Pending" },
      { value: "solved", label: "Solved" },
      { value: "closed", label: "Closed" }
    ]
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
          handler: openCreateTicketModal,
          arguments: [data, true, false]
        },
        show: true
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
          }
        },
        onClick: {
          async: true,
          handler: deleteTicket,
          arguments: [data.id]
        },
        show: true
      }
    ]
  }
];

export const message_table_columns = [
  { key: "icon", isResizable: false, isReorderable: false, title: "", mobile_title: "Icon", dataType: "String", width: 60, format: (icon, data) => <Cell><FontAwesomeIcon style={{ fontSize: "20px", color: theme.hopeTrustBlue }} swapOpacity={!data.read} icon={["fad", (data.attachments && data.attachments.length) ? "paperclip" : (data.read ? "envelope-open-text" : "envelope")]} /></Cell> },
  { key: "sender_name", title: "Sent By", dataType: "String", sortable: true, capitalize: true, format: (value, data) => value || data.from_email },
  { key: "recipient_name", title: "Recipient", dataType: "String", sortable: true, format: (value, data) => value ? <Cell sortable={1} capitalize={1}>{value}</Cell> : <Cell><a rel="noreferrer noopener" target="_blank" href={`mailto:${data.to_email}`}>{data.to_email}</a></Cell>},
  { key: "updated_at", title: "Read Status", dataType: "Date", sortable: true, format: (value, message) => message.read ? `Read on ${moment(value).format("MM/DD/YYYY [at] h:mm a")}` : "Unread" },
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
          }
        },
        onClick: {
          async: true,
          handler: deleteMessageRecord,
          arguments: [data.id]
        },
        show: true
      }
    ]
  }
];

export const referral_table_columns = [
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
          src: `${Gateway.endpoint}/partners/get-organization-logo/${data.name}`,
          size: 30,
          name: data.name,
          round: true
        }
      };
    }
  },
  { key: "name", title: "Name", dataType: "String", sortable: true, capitalize: true },
  { key: "hubspot_company_id", title: "Company ID", dataType: "String", isEditable: true },
  {
    key: "type",
    title: "Type",
    dataType: "String",
    capitalize: true,
    isEditable: true,
    editorType: "select",
    options: advisor_types.map((d) => ({ value: d.name, label: d.alias })),
    format: (value, data) => {
      const type = advisor_types.find((t) => t.name === value);
      if (type) return type.alias;
      return value;
    }
  },
  {
    key: "prefix",
    title: "Prefix",
    dataType: "String",
    uppercase: true,
    visible: false,
    isEditable: true
  },
  { key: "count", title: "Partners", dataType: "Number", is_currency: false, filter: (data, dispatch) => data.count ? dispatch(navigateTo("/partner-management", `?account_ids=${data.partners}`)) : null },
  {
    key: "status",
    title: "Status",
    dataType: "String",
    capitalize: true,
    width: 125,
    isEditable: true,
    editorType: "select",
    options: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" }
    ]
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
          className: "tooltip neutral",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "Export"
        },
        props: {
          icon: ["fal", "file-pdf"],
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
          handler: generateOrgExport,
          arguments: [data.name]
        },
        show: data.count
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
          handler: openCreateReferralModal,
          arguments: [data, true, false]
        },
        show: true
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
          }
        },
        onClick: {
          async: true,
          handler: deleteReferral,
          arguments: [data.id]
        },
        show: true
      }
    ]
  }
];

export const security_questions_table_columns = [
  { key: "question", title: "Question", dataType: "String" },
  {
    key: "category",
    title: "Category",
    dataType: "String",
    capitalize: true,
    isEditable: true,
    editorType: "select",
    options: [...new Set((store.getState().security.questions || []).map(item => item.category))].map((item) => ({ value: item, label: item })),
  },
  { key: "updated_at", title: "Updated", dataType: "Date" },
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
          "data-tooltip-content": "View Responses"
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
          handler: openSecurityQuestionResponseModal,
          arguments: [data, false, true]
        },
        show: !!data.respondents.length
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
          handler: openCreateSecurityQuestionModal,
          arguments: [data, true, false]
        },
        show: true
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
          }
        },
        onClick: {
          async: true,
          handler: deleteSecurityQuestionRecord,
          arguments: [data.id]
        },
        show: true
      }
    ]
  }
];

export const wholesaler_table_columns = [
  {
    key: "logo",
    isResizable: false,
    isReorderable: false,
    title: null,
    mobile_title: "Logo",
    width: 50,
    Component: (data) => {
      return {
        Custom: ReactAvatar,
        props: {
          src: data.logo,
          size: 30,
          name: data.name,
          round: true
        }
      };
    }
  },
  { key: "name", title: "Name", dataType: "String", sortable: true, capitalize: true },
  {
    key: "email",
    title: "Email",
    dataType: "String",
    format: (value, data) => <Cell><a rel="noreferrer" target="_blank" href={value ? `mailto:${value}` : null}>{value ? value : "N/A"}</a></Cell>
  },
  { key: "contact_name", title: "Contact", dataType: "String", sortable: true, capitalize: true },
  { key: "contract_signed", title: "Contract Signed", dataType: "Boolean", sortable: true, capitalize: true, labels: (data) => ["Yes", "No"] },
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
          handler: openCreateWholesaleModal,
          arguments: [data, true, false]
        },
        show: true
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
          }
        },
        onClick: {
          async: true,
          handler: deleteWholesaler,
          arguments: [data.id]
        },
        show: true
      }
    ]
  }
];

export const retailer_table_columns = [
  {
    key: "logo",
    isResizable: false,
    isReorderable: false,
    title: null,
    mobile_title: "Logo",
    width: 50,
    Component: (data) => {
      return {
        Custom: ReactAvatar,
        props: {
          src: data.logo,
          size: 30,
          name: data.name,
          round: true
        }
      };
    }
  },
  { key: "name", title: "Name", dataType: "String", sortable: true, capitalize: true },
  {
    key: "email",
    title: "Email",
    dataType: "String",
    format: (value, data) => <Cell><a rel="noreferrer" target="_blank" href={value ? `mailto:${value}` : null}>{value ? value : "N/A"}</a></Cell>
  },
  { key: "contact_name", title: "Contact", dataType: "String", sortable: true, capitalize: true },
  { key: "contract_signed", title: "Contract Signed", dataType: "Boolean", sortable: true, capitalize: true, labels: (data) => ["Yes", "No"] },
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
          handler: openCreateRetailModal,
          arguments: [data, true, false]
        },
        show: true
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
          }
        },
        onClick: {
          async: true,
          handler: deleteRetailer,
          arguments: [data.id]
        },
        show: true
      }
    ]
  }
];

export const agent_table_columns = [
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
          src: `${Gateway.endpoint}/users/get-user-avatar/${data.cognito_id}?${Date.now()}`,
          size: 30,
          name: data.contact_name,
          round: true
        }
      };
    }
  },
  { key: "contact_name", title: "Contact", dataType: "String", sortable: true, capitalize: true },
  {
    key: "email",
    title: "Email",
    dataType: "String",
    format: (value, data) => <Cell><a rel="noreferrer" target="_blank" href={value ? `mailto:${value}` : null}>{value ? value : "N/A"}</a></Cell>
  },
  { key: "count", title: "Clients", dataType: "Number", is_currency: false, filter: (data, dispatch) => data.count ? dispatch(navigateTo("/client-management", `?account_ids=${data.accounts}`)) : null },
  { key: "contract_signed", title: "Contract Signed", dataType: "Boolean", sortable: true, capitalize: true, labels: (data) => ["Yes", "No"] },
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
          handler: openCreateAgentModal,
          arguments: [data, true, false]
        },
        show: true
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
          }
        },
        onClick: {
          async: true,
          handler: deleteAgent,
          arguments: [data.id]
        },
        show: true
      }
    ]
  }
];

export const group_table_columns = [
  {
    key: "logo",
    isResizable: false,
    isReorderable: false,
    title: null,
    mobile_title: "Logo",
    width: 50,
    Component: (data) => {
      return {
        Custom: ReactAvatar,
        props: {
          src: data.logo,
          size: 30,
          name: data.name,
          round: true
        }
      };
    }
  },
  { key: "name", title: "Name", dataType: "String", sortable: true, capitalize: true },
  {
    key: "email",
    title: "Email",
    dataType: "String",
    format: (value, data) => <Cell><a rel="noreferrer" target="_blank" href={value ? `mailto:${value}` : null}>{value ? value : "N/A"}</a></Cell>
  },
  { key: "contact_name", title: "Contact", dataType: "String", sortable: true, capitalize: true },
  { key: "count", title: "Clients", dataType: "Number", is_currency: false, filter: (data, dispatch) => data.count ? dispatch(navigateTo("/client-management", `?account_ids=${data.accounts}`)) : null },
  { key: "contract_signed", title: "Contract Signed", dataType: "Boolean", sortable: true, capitalize: true, labels: (data) => ["Yes", "No"] },
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
          handler: openCreateGroupModal,
          arguments: [data, true, false]
        },
        show: true
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
          }
        },
        onClick: {
          async: true,
          handler: deleteGroup,
          arguments: [data.id]
        },
        show: true
      }
    ]
  }
];

export const team_table_columns = [
  {
    key: "logo",
    isResizable: false,
    isReorderable: false,
    title: null,
    mobile_title: "Logo",
    width: 50,
    Component: (data) => {
      return {
        Custom: ReactAvatar,
        props: {
          src: data.logo,
          size: 30,
          name: data.name,
          round: true
        }
      };
    }
  },
  { key: "name", title: "Name", dataType: "String", sortable: true, capitalize: true },
  {
    key: "email",
    title: "Email",
    dataType: "String",
    format: (value, data) => <Cell><a rel="noreferrer" target="_blank" href={value ? `mailto:${value}` : null}>{value ? value : "N/A"}</a></Cell>
  },
  { key: "contact_name", title: "Contact", dataType: "String", sortable: true, capitalize: true },
  { key: "count", title: "Clients", dataType: "Number", is_currency: false, filter: (data, dispatch) => data.count ? dispatch(navigateTo("/client-management", `?account_ids=${data.accounts}`)) : null },
  { key: "contract_signed", title: "Contract Signed", dataType: "Boolean", sortable: true, capitalize: true, labels: (data) => ["Yes", "No"] },
  { key: "created_at", title: "Created", dataType: "Date", sortable: true, sortDirection: "Descend" },
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
          handler: openCreateTeamModal,
          arguments: [data, true, false]
        },
        show: true
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
          }
        },
        onClick: {
          async: true,
          handler: deleteTeam,
          arguments: [data.id]
        },
        show: true
      }
    ]
  }
];

export const ce_config_widget_columns = [
  {
    key: "abbreviation",
    title: null,
    mobile_title: "Abbreviation",
    isResizable: false,
    isReorderable: false,
    isSortable: false,
    width: 50,
    Component: (data) => {
      return {
        Custom: ReactAvatar,
        props: {
          size: 30,
          value: US_STATES.find((s) => s.name === data.state).abbreviation,
          maxInitials: 2,
          round: true
        }
      };
    }
  },
  { key: "state", title: "State", dataType: "String", capitalize: true },
  {
    key: "course_renewal",
    title: "Course Renewal",
    dataType: "Date",
    isEditable: true,
    editorType: "date",
    format: (value, data) => value ? moment(value).format("MM/DD/YYYY") : "N/A",
    width: 150
  },
  {
    key: "provider_renewal",
    title: "Provider Renewal",
    dataType: "Date",
    isEditable: true,
    editorType: "date",
    format: (value) => value ? moment(value).format("MM/DD/YYYY") : "N/A",
    width: 150
  },
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
          handler: openCeConfigModal,
          arguments: [data, true, false]
        },
        show: true
      }
    ]
  }
];

export const ce_credits_widget_columns = [
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
          src: `${Gateway.endpoint}/users/get-user-avatar/${data.cognito_id}?${Date.now()}`,
          size: 30,
          name: data.partner_name,
          round: true
        }
      };
    }
  },
  { key: "partner_name", title: "Partner", dataType: "String", capitalize: true },
  { key: "course_title", title: "Course", dataType: "String", capitalize: true },
  { key: "state", title: "State", dataType: "String", capitalize: true },
  { key: "percentage", title: "Score", dataType: "Number", width: 75, format: (value, data) => data.passed ? <Cell capitalize={1} color="#4BB543">{value}%</Cell> : <Cell capitalize={1} color="red">{value}%</Cell> },
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
          "data-tooltip-content": "View Results"
        },
        props: {
          icon: ["fal", "memo-circle-info"],
          size: "xl",
          className: "table_button_icon",
          color: theme.hopeTrustBlue,
          style: {
            minWidth: "35px",
            cursor: "pointer"
          }
        },
        link: data.view_results_url,
        show: !!data.view_results_url
      }
    ]
  }
];

export const ce_state_table_columns = [
  {
    key: "abbreviation",
    title: null,
    mobile_title: "Abbreviation",
    isResizable: false,
    isReorderable: false,
    isSortable: false,
    width: 50,
    Component: (data) => {
      return {
        Custom: ReactAvatar,
        props: {
          size: 30,
          value: US_STATES.find((s) => s.name === data.state).abbreviation,
          maxInitials: 2,
          round: true
        }
      };
    }
  },
  { key: "state", title: "State", dataType: "String", sortable: true, capitalize: true, sortDirection: "Ascend" },
  { key: "course_number", title: "Course #", dataType: "String", uppercase: true, width: 100, isEditable: true },
  {
    key: "status",
    title: "Status",
    dataType: "String",
    capitalize: true,
    width: 125,
    isEditable: true,
    editorType: "select",
    options: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" }
    ]
  },
  { key: "count", title: "Passed", dataType: "Number", is_currency: false, width: 100, filter: (data, dispatch) => data.count ? dispatch(navigateTo("/partner-management", `?account_ids=${data.accounts}`)) : null },
  { key: "average_score", title: "Average", dataType: "Number", is_currency: false, width: 100, format: (value, data) => `${value || 0}%` },
  {
    key: "course_renewal",
    title: "Course Renewal",
    dataType: "Date",
    sortable: true,
    isEditable: true,
    editorType: "date",
    format: (value) => value ? moment(value).format("MM/DD/YYYY") : "N/A" 
  },
  {
    key: "provider_renewal",
    title: "Provider Renewal",
    dataType: "Date",
    sortable: true,
    isEditable: true,
    editorType: "date",
    format: (value) => value ? moment(value).format("MM/DD/YYYY") : "N/A" 
  },
  { key: "created_at", title: "Created", dataType: "Date", sortable: true },
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
          handler: openCeConfigModal,
          arguments: [data, true, false]
        },
        show: true
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
          }
        },
        onClick: {
          async: true,
          handler: deleteCEConfig,
          arguments: [data.id]
        },
        show: true
      }
    ]
  }
];

export const ce_credits_table_columns = [
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
          src: `${Gateway.endpoint}/users/get-user-avatar/${data.cognito_id}?${Date.now()}`,
          size: 30,
          name: data.partner_name,
          round: true
        }
      };
    }
  },
  { key: "course_title", title: "Course", dataType: "String", sortable: true, capitalize: true, width: 150 },
  { key: "partner_name", title: "Partner", dataType: "String", sortable: true, capitalize: true },
  { key: "npn", title: "NPN", dataType: "String", uppercase: true, visible: false },
  { key: "resident_state_license_number", title: "License #", dataType: "String", uppercase: true, visible: false },
  { key: "proctor_name", title: "Proctor Name", dataType: "String", sortable: true, capitalize: true, visible: false },
  { key: "proctor_email", title: "Proctor Email", dataType: "String", sortable: true, capitalize: true, visible: false },
  { key: "state", title: "State", dataType: "String", sortable: true, capitalize: true },
  { key: "percentage", title: "Score", dataType: "Number", format: (value, data) => data.passed ? <Cell capitalize={1} color="#4BB543">{value}%</Cell> : <Cell capitalize={1} color="red">{value}%</Cell> },
  { key: "passed", title: "Passed", dataType: "Boolean", sortable: true, labels: (data) => ["Yes", "No"], format: (value, data) => data.passed ? <Cell capitalize={1} sortable={1} bold={1} color="#4BB543">Yes</Cell> : <Cell capitalize={1} color="red">No</Cell> },
  { key: "confirmation_number", title: "Confirmation #", dataType: "String", uppercase: true, isEditable: true, width: 125 },
  { key: "status", title: "Status", dataType: "String", sortable: true, capitalize: true },
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
          "data-tooltip-content": "View Results"
        },
        props: {
          icon: ["fal", "memo-circle-info"],
          size: "xl",
          className: "table_button_icon",
          color: theme.hopeTrustBlue,
          style: {
            minWidth: "35px",
            cursor: "pointer"
          }
        },
        link: data.view_results_url,
        show: !!data.view_results_url
      }
    ]
  }
];

export const pending_approval_table_columns = [
  {
    key: "avatar",
    isResizable: false, isReorderable: false,
    title: null,
    mobile_title: "Avatar",
    width: 50,
    Component: (data) => {
      return {
        Custom: ReactAvatar,
        props: {
          src: `${Gateway.endpoint}/users/get-user-avatar/${data.cognito_id}?${Date.now()}`,
          size: 30,
          name: data.requester_name,
          round: true
        }
      };
    }
  },
  { key: "requester_name", title: "Name", dataType: "String", sortable: true, capitalize: true },
  { key: "parent_id", title: "Requested Account", dataType: "String", sortable: true, capitalize: true, format: (value, data) => (data[`${data.type}_name`] ? data[`${data.type}_name`] : data.requested_name) },
  { key: "type", title: "Type", dataType: "String", sortable: true, capitalize: true, width: 125, format: (value, data) => value || "New Member" },
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
          className: "tooltip success",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "Approve"
        },
        props: {
          icon: ["fal", "circle-check"],
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
          handler: updateMembership,
          arguments: [data.parent_id, data.cognito_id, { approved: true }, data.cognito_id],
          callback: {
            action: customerServiceGetPendingApprovals,
            dispatch: true
          }
        },
        show: true
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
          icon: ["fal", "circle-x"],
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
          handler: deleteMembership,
          arguments: [data.membership_id],
          callback: {
            action: customerServiceGetPendingApprovals,
            dispatch: true
          }
        },
        show: true
      }
    ]
  }
];

export const wholesale_approval_table_columns = [
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
          src: `${Gateway.endpoint}/users/get-user-avatar/${data.cognito_id}?${Date.now()}`,
          size: 30,
          name: data.contact_name,
          round: true
        }
      };
    }
  },
  { key: "contact_name", title: "Requested By", dataType: "String", sortable: true, capitalize: true },
  { key: "retailer_name", title: "Retail Account", dataType: "String", sortable: true, capitalize: true },
  { key: "name", title: "Wholesale Account", dataType: "String", sortable: true, capitalize: true },
  { key: "status", title: "Status", dataType: "String", sortable: true, capitalize: true, format: (value, data) => (value === "active") ? "Approved" : value },
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
          handler: openCreateWholesaleConnectionModal,
          arguments: [data, true, false]
        },
        show: ["active", "declined"].includes(data.status)
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
          icon: ["fal", "circle-check"],
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
          handler: approveWholesaleRequest,
          arguments: [data.config_id, data.cognito_id, data.id]
        },
        show: data.status === "pending"
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
          icon: ["fal", "circle-x"],
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
          handler: declineWholesaleRequest,
          arguments: [data.config_id, data.cognito_id, data.id]
        },
        show: data.status === "pending"
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
          }
        },
        onClick: {
          async: true,
          handler: deleteWholesaleConnection,
          arguments: [data.id]
        },
        show: ["declined", "active"].includes(data.status)
      }
    ]
  }
];

export const group_approval_table_columns = [
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
          src: `${Gateway.endpoint}/users/get-user-avatar/${data.cognito_id}?${Date.now()}`,
          size: 30,
          name: data.contact_name,
          round: true
        }
      };
    }
  },
  { key: "contact_name", title: "Requested By", dataType: "String", sortable: true, capitalize: true },
  { key: "cognito_id", title: "Organization", dataType: "String", sortable: true, capitalize: true, format: (value, data) => data[`${data.type}_name`] || data.team_name || data.agent_name || "N/A" },
  { key: "group_name", title: "Group Account", dataType: "String", sortable: true, capitalize: true },
  { key: "type", title: "Type", dataType: "String", sortable: true, capitalize: true },
  { key: "status", title: "Status", dataType: "String", sortable: true, capitalize: true, format: (value, data) => (value === "active") ? "Approved" : value },
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
          handler: openCreateGroupConnectionModal,
          arguments: [data, true, false]
        },
        show: ["active", "declined"].includes(data.status)
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
          icon: ["fal", "circle-check"],
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
          handler: approveGroupRequest,
          arguments: [data.config_id, data.cognito_id, data.id]
        },
        show: data.status === "pending"
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
          icon: ["fal", "circle-x"],
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
          handler: declineGroupRequest,
          arguments: [data.config_id, data.cognito_id, data.id]
        },
        show: data.status === "pending"
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
          }
        },
        onClick: {
          async: true,
          handler: deleteGroupConnection,
          arguments: [data.id]
        },
        show: ["declined", "active"].includes(data.status)
      }
    ]
  }
];

export const benefit_accounts_table_columns = [
  { key: "name", title: "Account", dataType: "String", capitalize: true, format: (value, data) => data.name || data.invite_name},
  {
    key: "wholesaler_name", title: "Wholesaler", dataType: "String", sortable: true, format: (value, data) => {
      let icon = "";
      if (data.benefits_parent === data.wholesaler_cognito_id) icon = <FontAwesomeIcon title="Payee" style={{ fontSize: "14px", color: theme.buttonGreen, marginRight: "5px" }} icon={["fad", "badge-dollar"]} />;
      return <Cell capitalize={1} sortable={1} bold={1} color={(data.benefits_parent === data.wholesaler_cognito_id) ? theme.buttonGreen : theme.labelGrey}>{icon}{value ? value : "N/A"}</Cell>
    }
  },
  {
    key: "retailer_name", title: "Retailer", dataType: "String", sortable: true, format: (value, data) => {
      let icon = "";
      if (data.benefits_parent === data.retailer_cognito_id) icon = <FontAwesomeIcon title="Payee" style={{ fontSize: "14px", color: theme.buttonGreen, marginRight: "5px" }} icon={["fad", "badge-dollar"]} />;
      return <Cell capitalize={1} sortable={1} bold={1} color={(data.benefits_parent === data.retailer_cognito_id) ? theme.buttonGreen : theme.labelGrey}>{icon}{value ? value : "N/A"}</Cell>
    }
  },
  {
    key: "agent_name", title: "Agent", dataType: "String", sortable: true, format: (value, data) => {
      let icon = "";
      if (data.benefits_parent === data.agent_cognito_id || !!data.agent_owned) icon = <FontAwesomeIcon title="Payee" style={{ fontSize: "14px", color: theme.buttonGreen, marginRight: "5px" }} icon={["fad", "badge-dollar"]} />;
      return <Cell capitalize={1} sortable={1} bold={1} color={(data.benefits_parent === data.agent_cognito_id) ? theme.buttonGreen : theme.labelGrey}>{icon}{value ? value : "N/A"}</Cell>
    }
  },
  {
    key: "group_name", title: "Group", dataType: "String", sortable: true, format: (value, data) => {
      let icon = "";
      if (data.benefits_parent === data.group_cognito_id && !data.agent_owned) icon = <FontAwesomeIcon title="Payee" style={{ fontSize: "14px", color: theme.buttonGreen, marginRight: "5px" }} icon={["fad", "badge-dollar"]} />;
      return <Cell capitalize={1} sortable={1} bold={1} color={(data.benefits_parent === data.group_cognito_id) ? theme.buttonGreen : theme.labelGrey}>{icon}{value ? value : "N/A"}</Cell>
    }
  },
  {
    key: "team_name", title: "Team", dataType: "String", sortable: true, format: (value, data) => {
      let icon = "";
      if (data.benefits_parent === data.team_cognito_id && !data.agent_owned) icon = <FontAwesomeIcon title="Payee" style={{ fontSize: "14px", color: theme.buttonGreen, marginRight: "5px" }} icon={["fad", "badge-dollar"]} />;
      return <Cell capitalize={1} sortable={1} bold={1} color={(data.benefits_parent === data.team_cognito_id) ? theme.buttonGreen : theme.labelGrey}>{icon}{value ? value : "N/A"}</Cell>
    }
  },
  { key: "plan_name", title: "Plan", dataType: "String", sortable: true, capitalize: true, visible: false },
  { key: "invite_status", title: "Invite Status", dataType: "String", sortable: true, format: (value, data) => <Cell capitalize={1} color={value === "sent" ? theme.hopeTrustBlue : (value === "read" ? theme.notificationOrange : theme.success)} bold={1} sortable={1}>{value}</Cell> },
  { key: "created_at", title: "Created", dataType: "Date", sortable: true, sortDirection: "Descend" },
  {
    title: "Actions",
    key: "show-hide-details-row",
    isSortable: false,
    isReorderable: false,
    isResizable: false,
    visible: false,
    width: 125,
    buttons: (data) => [
      {
        Component: FontAwesomeIcon,
        tooltipProps: {
          className: "tooltip neutral",
          "data-tooltip": "",
          "data-tooltip-position": "top",
          "data-tooltip-content": "Resend"
        },
        props: {
          icon: ["fal", "share"],
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
          handler: sendClientInvite,
          arguments: [data]
        },
        show: ["sent", "read"].includes(data.invite_status) && data.invite_url
      }
    ]
  }
];

export const message_settings_columns = [
  { key: "term", title: "Term", dataType: "String", sortable: true },
  { key: "created_at", title: "Created", dataType: "Date", sortable: true, sortDirection: "Descend" },
  {
    title: "Actions",
    key: "show-hide-details-row",
    isSortable: false,
    isEditable: false,
    isReorderable: false,
    isResizable: false,
    width: 250,
    buttons: (data, props) => [
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
          isTableDispatch: true,
          async: false,
          handler: "openNewItemField",
          arguments: {
            initial_values: data,
            values: data,
            rowKeyValue: props.rowKeyValue,
            updateProp: "email_signature_identifiers",
            action: updateCoreSettings
          }
        },
        show: true
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
          }
        },
        onClick: {
          async: true,
          handler: updateCoreSettings,
          arguments: [{ email_signature_identifiers: { type: "delete", value: data } }],
          tableAction: {
            action: "deleteItem",
            arguments: {
              rowKeyValue: props.rowKeyValue
            }
          }
        },
        show: true
      }
    ]
  }  
];

export const document_settings_columns = [
  { key: "category", title: "Parent Category", dataType: "String", sortable: true },
  { key: "type", title: "Type", dataType: "String", sortable: true },
  { key: "icon", isResizable: false, isReorderable: false, title: "Icon", dataType: "String", sortable: true, format: (value, data) => <FontAwesomeIcon size="2x" border fixedWidth color={theme.hopeTrustBlue} icon={["fad", value]} /> },
  { key: "created_at", title: "Created", dataType: "Date", sortable: true, sortDirection: "Descend" },
  {
    title: "Actions",
    key: "show-hide-details-row",
    isSortable: false,
    isEditable: false,
    isReorderable: false,
    isResizable: false,
    width: 250,
    buttons: (data, props) => [
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
          isTableDispatch: true,
          async: false,
          handler: "openNewItemField",
          arguments: {
            initial_values: data,
            values: data,
            rowKeyValue: props.rowKeyValue,
            updateProp: "document_types",
            action: updateCoreSettings
          }
        },
        show: true
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
          }
        },
        onClick: {
          async: true,
          handler: updateCoreSettings,
          arguments: [{ document_types: { type: "delete", value: data } }]
        },
        show: true
      }
    ]
  }
];

export const budget_category_columns = [
  { key: "category", title: "Parent Category", dataType: "String", sortable: true },
  { key: "parent_color", title: "Parent Color", dataType: "String", sortable: true, format: (value, data) => <FontAwesomeIcon size="2x" border fixedWidth color={value || "#000000"} icon={["fas", "circle"]} /> },
  { key: "name", title: "Child Category", dataType: "String", sortable: true },
  { key: "color", title: "Child Color", dataType: "String", sortable: true, format: (value, data) => <FontAwesomeIcon size="2x" border fixedWidth color={value || "#000000"} icon={["fas", "circle"]} /> },
  { key: "created_at", title: "Created", dataType: "Date", sortable: true, sortDirection: "Descend" },
  {
    title: "Actions",
    key: "show-hide-details-row",
    isSortable: false,
    isEditable: false,
    isReorderable: false,
    isResizable: false,
    width: 250,
    buttons: (data, props) => [
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
          isTableDispatch: true,
          async: false,
          handler: "openNewItemField",
          arguments: {
            initial_values: data,
            values: data,
            rowKeyValue: props.rowKeyValue,
            updateProp: "budget_categories",
            action: updateCoreSettings,
            action_type: "update"
          }
        },
        show: true
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
          }
        },
        onClick: {
          async: true,
          handler: updateCoreSettings,
          arguments: [{ budget_categories: { type: "delete", value: data } }]
        },
        show: true
      }
    ]
  }
];

export const asset_type_columns = [
  { key: "category", title: "Parent Category", dataType: "String", sortable: true },
  { key: "type", title: "Child Category", dataType: "String", sortable: true },
  { key: "color", title: "Child Color", dataType: "String", sortable: true, format: (value, data) => <FontAwesomeIcon size="2x" border fixedWidth color={value || "#000000"} icon={["fas", "circle"]} /> },
  { key: "created_at", title: "Created", dataType: "Date", sortable: true, sortDirection: "Descend" },
  {
    title: "Actions",
    key: "show-hide-details-row",
    isSortable: false,
    isEditable: false,
    isReorderable: false,
    isResizable: false,
    width: 250,
    buttons: (data, props) => [
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
          isTableDispatch: true,
          async: false,
          handler: "openNewItemField",
          arguments: {
            initial_values: data,
            values: data,
            rowKeyValue: props.rowKeyValue,
            updateProp: "asset_types",
            action: updateCoreSettings,
            action_type: "update"
          }
        },
        show: true
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
          }
        },
        onClick: {
          async: true,
          handler: updateCoreSettings,
          arguments: [{ asset_types: { type: "delete", value: data } }]
        },
        show: true
      }
    ]
  }
];

export const income_type_columns = [
  { key: "category", title: "Parent Category", dataType: "String", sortable: true },
  { key: "type", title: "Child Category", dataType: "String", sortable: true },
  { key: "color", title: "Child Color", dataType: "String", sortable: true, format: (value, data) => <FontAwesomeIcon size="2x" border fixedWidth color={value || "#000000"} icon={["fas", "circle"]} /> },
  { key: "created_at", title: "Created", dataType: "Date", sortable: true, sortDirection: "Descend" },
  {
    title: "Actions",
    key: "show-hide-details-row",
    isSortable: false,
    isEditable: false,
    isReorderable: false,
    isResizable: false,
    width: 250,
    buttons: (data, props) => [
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
          isTableDispatch: true,
          async: false,
          handler: "openNewItemField",
          arguments: {
            initial_values: data,
            values: data,
            rowKeyValue: props.rowKeyValue,
            updateProp: "income_types",
            action: updateCoreSettings,
            action_type: "update"
          }
        },
        show: true
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
          }
        },
        onClick: {
          async: true,
          handler: updateCoreSettings,
          arguments: [{ income_types: { type: "delete", value: data } }]
        },
        show: true
      }
    ]
  }
];

export const benefit_type_columns = [
  { key: "category", title: "Parent Category", dataType: "String", sortable: true },
  { key: "type", title: "Child Category", dataType: "String", sortable: true },
  { key: "color", title: "Child Color", dataType: "String", sortable: true, format: (value, data) => <FontAwesomeIcon size="2x" border fixedWidth color={value || "#000000"} icon={["fas", "circle"]} /> },
  { key: "created_at", title: "Created", dataType: "Date", sortable: true, sortDirection: "Descend" },
  {
    title: "Actions",
    key: "show-hide-details-row",
    isSortable: false,
    isEditable: false,
    isReorderable: false,
    isResizable: false,
    width: 250,
    buttons: (data, props) => [
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
          isTableDispatch: true,
          async: false,
          handler: "openNewItemField",
          arguments: {
            initial_values: data,
            values: data,
            rowKeyValue: props.rowKeyValue,
            updateProp: "benefit_types",
            action: updateCoreSettings,
            action_type: "update"
          }
        },
        show: true
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
          }
        },
        onClick: {
          async: true,
          handler: updateCoreSettings,
          arguments: [{ benefit_types: { type: "delete", value: data } }]
        },
        show: true
      }
    ]
  }
];

export const contact_settings_columns = [
  { key: "category", title: "Category", dataType: "String", sortable: true },
  { key: "child_category", title: "Child Category", dataType: "String", sortable: true },
  { key: "type", title: "Type", dataType: "String", sortable: true },
  { key: "created_at", title: "Created", dataType: "Date", sortable: true, sortDirection: "Descend" },
  {
    title: "Actions",
    key: "show-hide-details-row",
    isSortable: false,
    isEditable: false,
    isReorderable: false,
    isResizable: false,
    width: 250,
    buttons: (data, props) => [
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
          isTableDispatch: true,
          async: false,
          handler: "openNewItemField",
          arguments: {
            initial_values: data,
            values: data,
            rowKeyValue: props.rowKeyValue,
            updateProp: "contact_types",
            action: updateCoreSettings
          }
        },
        show: true
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
          }
        },
        onClick: {
          async: true,
          handler: updateCoreSettings,
          arguments: [{ contact_types: { type: "delete", value: data } }],
          tableAction: {
            action: "deleteItem",
            arguments: {
              rowKeyValue: props.rowKeyValue
            }
          }
        },
        show: true
      }
    ]
  }
];

export const ce_courses_table_columns = [
  { key: "category", title: "Category", dataType: "String", sortable: true },
  { key: "course_type", title: "Course Type", dataType: "String", sortable: true, capitalize: true, visible: false },
  { key: "title", title: "Title", dataType: "String", sortable: true },
  { key: "video_id", title: "Vimeo ID", dataType: "String", isEditable: true },
  { key: "quiz_id", title: "Classmarker ID", dataType: "String", isEditable: true },
  { key: "count", title: "Partners", dataType: "Number", is_currency: false, width: 100, filter: (data, dispatch) => data.count ? dispatch(navigateTo("/partner-management", `?account_ids=${data.accounts}`)) : null },
  { key: "count_passed", title: "Passed", dataType: "Number", is_currency: false, visible: false, width: 100, filter: (data, dispatch) => data.count_passed ? dispatch(navigateTo("/partner-management", `?account_ids=${data.passed}`)) : null },
  { key: "count_failed", title: "Failed", dataType: "Number", is_currency: false, visible: false, width: 100, filter: (data, dispatch) => data.count_failed ? dispatch(navigateTo("/partner-management", `?account_ids=${data.failed}`)) : null },
  { key: "average_score", title: "Average", dataType: "Number", is_currency: false, width: 100, format: (value, data) => `${value || 0}%` },
  { key: "status", title: "Status", dataType: "String", sortable: true, capitalize: true },
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
          handler: openCeCourseModal,
          arguments: [data, true, false]
        },
        show: true
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
          }
        },
        onClick: {
          async: true,
          handler: deleteCECourse,
          arguments: [data.id]
        },
        show: true
      }
    ]
  }
];

export const survey_table_columns = [
  {
    key: "icon",
    isSortable: false,
    isResizable: false,
    isReorderable: false,
    title: "",
    mobile_title: "Icon",
    dataType: "String",
    width: 80,
    format: (icon, data) => {
      return <Cell><FontAwesomeIcon style={{ fontSize: "20px", color: theme.hopeTrustBlue }} icon={["fad", (icon || "file-alt")]} /></Cell>
    }
  },
  {
    key: "category",
    isSortable: false,
    title: "Category",
    dataType: "String",
    capitalize: true,
    isEditable: true,
    editorType: "select",
    options: [...new Set((store.getState().survey.list || []).map(item => item.category))].map((item) => ({ value: item, label: item })),
  },
  { key: "sort_order", title: "Order", dataType: "Number", visible: false, isSortable: false },
  { key: "survey_name", title: "Title", dataType: "String", isEditable: true, isSortable: false },
  { key: "survey_id", title: "Survey ID", dataType: "String", sortable: true, isSortable: false },
  { key: "slug", title: "Slug", dataType: "String", isEditable: true, isSortable: false },
  {
    key: "status",
    isSortable: false,
    title: "Status",
    dataType: "String",
    capitalize: true,
    width: 125,
    isEditable: true,
    editorType: "select",
    options: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" }
    ]
  },
  { key: "created_at", isSortable: false, title: "Created", dataType: "Date", sortable: true },
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
          handler: openCreateSurveyModal,
          arguments: [data, true, false]
        },
        show: true
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
          }
        },
        onClick: {
          async: true,
          handler: deleteSurvey,
          arguments: [data.id]
        },
        show: true
      }
    ]
  }
];

export const sessions_table_columns = [
  {
    key: "icon",
    isResizable: false,
    isReorderable: false,
    title: "",
    mobile_title: "Icon",
    dataType: "String",
    width: 80,
    format: (icon, data) => {
      return <Cell><FontAwesomeIcon style={{ fontSize: "20px", color: theme.hopeTrustBlue }} icon={["fad", (icon || "file-alt")]} /></Cell>
    }
  },
  {
    key: "category",
    title: "Category",
    dataType: "String",
    capitalize: true,
    isEditable: true,
    editorType: "select",
    visible: false,
    options: [...new Set((store.getState().survey.list || []).map(item => item.category))].map((item) => ({ value: item, label: item })),
  },
  { key: "session_id", title: "Session ID", dataType: "String", sortable: true, visible: false },
  { key: "survey_name", title: "Survey", dataType: "String", sortable: true },
  { key: "survey_id", title: "Survey ID", dataType: "String", sortable: true, visible: false },
  { key: "slug", title: "Slug", dataType: "String", sortable: true, visible: false },
  { key: "account_name", title: "Account", dataType: "String", sortable: true },
  { key: "updated_by", title: "Updated By", dataType: "String", sortable: true },
  {
    key: "status",
    title: "Status",
    dataType: "String",
    capitalize: true,
    width: 125,
    isEditable: true,
    editorType: "select",
    options: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" }
    ]
  },
  { key: "is_complete", title: "Complete", dataType: "Boolean", sortable: true, capitalize: true, labels: (data) => ["Yes", "No"] },
  { key: "access_time", title: "Last Update", dataType: "Date", sortable: true, sortDirection: "Descend", format: (date) => moment(date).format("MM/DD/YY [at] h:mm A") },
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
        link: `https://www.surveygizmo.com/s3/${data.survey_id}/${data.slug}?snc=${data.session_id}&cognito_id=${store.getState().user.cognito_id}&stage=${process.env.REACT_APP_STAGE || "development"}&financePermission=true&healthPermission=true&hopetrustSuperAdminPermission=true&sg_navigate=start&_iseditlink=true`,
        show: true
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
          }
        },
        onClick: {
          async: true,
          handler: deleteSession,
          arguments: [data.id]
        },
        show: true
      }
    ]
  }
];