import MaintenanceMode from "../Components/MaintenanceMode";
import UpgradeAppNotice from "../Components/UpgradeAppNotice";
import IdleModal from "../Components/IdleModal";
import InstalliOSWebAppPrompt from "../Components/InstalliOSWebAppPrompt";
import { Backdrop } from "../global-components";
import DocumentCreateModal from "../Components/DocumentCreateModal";
import RelationshipCreateModal from "../Components/RelationshipCreateModal";
import HubspotChatWidget from "../Components/HubspotChatWidget";
import ReduxToastr from "react-redux-toastr";
import IdleTimer from "react-idle-timer";
import PushNotification from "../Components/PushNotification";
import MessageCreateModal from "../Components/MessageCreateModal";
import AccountCreateModal from "../Components/AccountCreateModal";
import GroupCreateModal from "../Components/GroupCreateModal";
import TeamCreateModal from "../Components/TeamCreateModal";
import PartnerLogoModal from "../Components/PartnerLogoModal";

export const conditional_components = ({
  isIPad,
  isIPhone,
  isActive,
  isIdle,
  onAction,
  store
}) => {
  const {
    user,
    session,
    navigation,
    toggleMobileNavigation,
    documents,
    relationship,
    customer_support,
    message,
    account,
    groups,
    teams
  } = store;

  return [
    {
      Component: PushNotification,
      props: {},
      condition: user
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
      Component: PartnerLogoModal,
      props: {
        is_uploading_logo: session.is_uploading_logo
      },
      condition: session.is_uploading_logo
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
      Component: AccountCreateModal,
      props: {
        config: account.config,
        creatingAccount: account.creating_account
      },
      condition: account.creating_account
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
        Component: HubspotChatWidget,
        props: {
          id: "chat"
        },
        condition: session.zendesk.chat_open
      },
      {
        Component: MaintenanceMode,
        props: {},
        condition: customer_support.core_settings && customer_support.core_settings.benefits_maintenance_mode
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
        Component: RelationshipCreateModal,
        props: {
          creatingRelationship: relationship.creatingRelationship,
          defaults: relationship.defaults,
          updating: relationship.updating,
          viewing: relationship.viewing
        },
        condition: relationship.creatingRelationship
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
  ];
};