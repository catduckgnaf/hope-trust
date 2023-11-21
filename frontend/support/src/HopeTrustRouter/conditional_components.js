import { isIE, isEdge } from "react-device-detect";
import MaintenanceMode from "../Components/MaintenanceMode";
import UpgradeAppNotice from "../Components/UpgradeAppNotice";
import BlockBrowser from "../Components/BlockBrowser";
import IdleModal from "../Components/IdleModal";
import InstalliOSWebAppPrompt from "../Components/InstalliOSWebAppPrompt";
import MessageCreateModal from "../Components/MessageCreateModal";
import { Backdrop } from "../global-components";
import DocumentCreateModal from "../Components/DocumentCreateModal";
import ReduxToastr from "react-redux-toastr";
import IdleTimer from "react-idle-timer";
import SecurityQuestionCreateModal from "../Components/SecurityQuestionCreateModal";
import PartnerPlanModal from "../Components/PartnerPlanModal";
import UserPlanModal from "../Components/UserPlanModal";
import AccountEditModal from "../Components/AccountEditModal";
import UserEditModal from "../Components/UserEditModal";
import WholesalerCreateModal from "../Components/WholesalerCreateModal";
import TicketCreateModal from "../Components/TicketCreateModal";
import RetailerCreateModal from "../Components/RetailerCreateModal";
import AddMembershipModal from "../Components/AddMembershipModal";
import AgentCreateModal from "../Components/AgentCreateModal";
import GroupCreateModal from "../Components/GroupCreateModal";
import GroupCreateConnectionModal from "../Components/GroupCreateConnectionModal";
import WholesaleCreateConnectionModal from "../Components/WholesaleCreateConnectionModal";
import TeamCreateModal from "../Components/TeamCreateModal";
import CECreateModal from "../Components/CECreateModal";
import PushNotificationModal from "../Components/PushNotificationModal";
import ProductCreateModal from "../Components/ProductCreateModal";
import ReferralCreateModal from "../Components/ReferralCreateModal";
import AccountCreateModal from "../Components/AccountCreateModal";
import CECourseCreateModal from "../Components/CECourseCreateModal";
import SurveyCreateModal from "../Components/SurveyCreateModal";
import SecurityQuestionResponseModal from "../Components/SecurityQuestionResponseModal";

export const conditional_components = ({
  isIPad,
  isIPhone,
  isActive,
  isIdle,
  onAction,
  toggleMobileNavigation,
  store
}) => {
  const {
    user,
    session,
    navigation,
    documents,
    customer_support,
    message,
    ce_management,
    referral,
    security,
    account,
    plans,
    product,
    wholesale,
    retail,
    agents,
    groups,
    teams,
    tickets,
    notification,
    survey
  } = store;

  return [
    {
      Component: IdleTimer,
      props: {
        element: document,
        onActive: (e) => isActive(e),
        onIdle: (e) => isIdle(e),
        onAction: (e) => onAction(e),
        debounce: 250,
        timeout: 3600000
      },
      condition: user
    },
    {
      Component: AccountCreateModal,
      props: {
        config: account.config,
        creatingAccount: account.creating_account
      },
      condition: account.creating_account
    },
    {
      Component: ReduxToastr,
      props: {
        timeOut: 10000,
        newestOnTop: true,
        preventDuplicates: true,
        position: "top-right",
        getState: (state) => state.toastr,
        transitionIn: "bounceInDown",
        transitionOut: "bounceOutUp",
        progressBar: true,
        closeOnToastrClick: true
      },
      condition: true
    },
    {
      Component: MessageCreateModal,
      props: {
        show: message.show,
        defaults: message.defaults,
        viewing: message.viewing,
        updating: message.updating
      },
      condition: message.show
    },
    {
      Component: SurveyCreateModal,
      props: {
        is_open: survey.viewing_survey,
        defaults: survey.defaults,
        viewing: survey.viewing,
        updating: survey.updating
      },
      condition: survey.viewing_survey
    },
    {
      Component: MaintenanceMode,
      props: {},
      condition: customer_support.core_settings && customer_support.core_settings.support_maintenance_mode
    },
    {
      Component: InstalliOSWebAppPrompt,
      props: {
        isIPad,
        isIPhone
      },
      condition: session.install_prompt_open
    },
    {
      Component: DocumentCreateModal,
      props: {
        file: documents.file,
        creatingDocument: documents.creatingDocument,
        defaults: documents.defaults,
        updating: documents.updating,
        viewing: documents.viewing
      },
      condition: documents.creatingDocument
    },
    {
      Component: IdleModal,
      props: {
        seconds: session.seconds,
        idle_message: session.idle_message
      },
      condition: (user && session.idle && session.idle_should_prompt)
    },
    {
      Component: Backdrop,
      props: {
        show: navigation.show,
        onClick: () => toggleMobileNavigation()
      },
      condition: navigation.show
    },
    {
      Component: UpgradeAppNotice,
      props: {},
      condition: customer_support.requires_refresh
    },
    {
      Component: BlockBrowser,
      props: {
        title: "Unsupported Browser",
        message: "We apologize for any inconvenience. Hope Trust is built with modern technology which requires a modern browser. We currently do not support Microsoft Edge or Internet Explorer. Please switch to Google Chrome or any modern browser to ensure a streamlined experience.",
        showCloseIcon: false,
        open: [isIE, isEdge].some((e) => e)
      },
      condition: [isIE, isEdge].some((e) => e)
    },
    {
      Component: CECreateModal,
      props: {
        is_open: ce_management.viewing_ce_config,
        defaults: ce_management.defaults,
        updating: ce_management.updating,
        viewing: ce_management.viewing
      },
      condition: ce_management.viewing_ce_config
    },
    {
      Component: CECourseCreateModal,
      props: {
        is_open: ce_management.viewing_ce_course,
        defaults: ce_management.defaults,
        updating: ce_management.updating,
        viewing: ce_management.viewing
      },
      condition: ce_management.viewing_ce_course
    },
    {
      Component: UserEditModal,
      props: {
        user_defaults: customer_support.user_defaults,
        user_update_modal_open: customer_support.user_update_modal_open,
        updating: customer_support.updating
      },
      condition: customer_support.user_update_modal_open
    },
    {
      Component: ReferralCreateModal,
      props: {
        creating_referral: referral.creating_referral,
        defaults: referral.defaults,
        updating: referral.updating,
        viewing: referral.viewing
      },
      condition: referral.creating_referral
    },
    {
      Component: SecurityQuestionCreateModal,
      props: {
        creating_question: security.creating_question,
        defaults: security.defaults,
        updating: security.updating,
        viewing: security.viewing
      },
      condition: security.creating_question
    },
    {
      Component: SecurityQuestionResponseModal,
      props: {
        viewing_response: security.viewing_response,
        defaults: security.defaults,
        updating: security.updating,
        viewing: security.viewing
      },
      condition: security.viewing_response
    },
    {
      Component: AccountEditModal,
      props: {
        account_edit_show: account.account_edit_show,
        defaults: account.defaults,
        type: account.type
      },
      condition: account.account_edit_show
    },
    {
      Component: UserPlanModal,
      props: {
        viewing_user_plan: plans.viewing_user_plan,
        defaults: plans.defaults,
        updating: plans.updating,
        viewing: plans.viewing
      },
      condition: plans.viewing_user_plan
    },
    {
      Component: PartnerPlanModal,
      props: {
        viewing_partner_plan: plans.viewing_partner_plan,
        defaults: plans.defaults,
        updating: plans.updating,
        viewing: plans.viewing
      },
      condition: plans.viewing_partner_plan
    },
    {
      Component: ProductCreateModal,
      props: {
        show_product_modal: product.show_product_modal,
        defaults: product.defaults,
        updating: product.updating,
        viewing: product.viewing
      },
      condition: product.show_product_modal
    },
    {
      Component: WholesalerCreateModal,
      props: {
        is_open: wholesale.viewing_wholesaler,
        defaults: wholesale.defaults,
        updating: wholesale.updating,
        viewing: wholesale.viewing
      },
      condition: wholesale.viewing_wholesaler
    },
    {
      Component: RetailerCreateModal,
      props: {
        is_open: retail.viewing_retailer,
        defaults: retail.defaults,
        updating: retail.updating,
        viewing: retail.viewing
      },
      condition: retail.viewing_retailer
    },
    {
      Component: AgentCreateModal,
      props: {
        is_open: agents.viewing_agent,
        defaults: agents.defaults,
        updating: agents.updating,
        viewing: agents.viewing
      },
      condition: agents.viewing_agent
    },
    {
      Component: GroupCreateModal,
      props: {
        is_open: groups.viewing_group,
        defaults: groups.defaults,
        updating: groups.updating,
        viewing: groups.viewing
      },
      condition: groups.viewing_group
    },
    {
      Component: TeamCreateModal,
      props: {
        is_open: teams.viewing_team,
        defaults: teams.defaults,
        updating: teams.updating,
        viewing: teams.viewing
      },
      condition: teams.viewing_team
    },
    {
      Component: WholesaleCreateConnectionModal,
      props: {
        is_open: wholesale.viewing_wholesale_connection,
        defaults: wholesale.defaults,
        updating: wholesale.updating,
        viewing: wholesale.viewing
      },
      condition: wholesale.viewing_wholesale_connection
    },
    {
      Component: GroupCreateConnectionModal,
      props: {
        is_open: groups.viewing_group_connection,
        defaults: groups.defaults,
        updating: groups.updating,
        viewing: groups.viewing
      },
      condition: groups.viewing_group_connection
    },
    {
      Component: TicketCreateModal,
      props: {
        is_open: tickets.viewing_ticket,
        defaults: tickets.defaults,
        updating: tickets.updating,
        viewing: tickets.viewing
      },
      condition: tickets.viewing_ticket
    },
    {
      Component: AddMembershipModal,
      props: {
        is_open: customer_support.creating_new_membership,
        membership_type: customer_support.membership_type
      },
      condition: customer_support.creating_new_membership
    },
    {
      Component: PushNotificationModal,
      props: {
        is_open: notification.creating_push,
        online: notification.online
      },
      condition: notification.creating_push
    },
  ];
};