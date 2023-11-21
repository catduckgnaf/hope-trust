import { isIE, isEdge } from "react-device-detect";
import Modal from "../Components/Modal";
import MaintenanceMode from "../Components/MaintenanceMode";
import UpgradeAppNotice from "../Components/UpgradeAppNotice";
import GrantorAssetCreateModal from "../Components/GrantorAssetCreateModal";
import BeneficiaryAssetCreateModal from "../Components/BeneficiaryAssetCreateModal";
import IncomeCreateModal from "../Components/IncomeCreateModal";
import GovernmentBenefitsCreateModal from "../Components/GovernmentBenefitsCreateModal";
import BudgetCreateModal from "../Components/BudgetCreateModal";
import PlaidLinkModal from "../Components/PlaidLinkModal";
import BlockBrowser from "../Components/BlockBrowser";
import AccountCreateModal from "../Components/AccountCreateModal";
import MYTOSimulationModal from "../Components/MYTOSimulationModal";
import PDFContainerModal from "../Components/PDFContainerModal";
import EventCreateModal from "../Components/EventCreateModal";
import MedicationCreateModal from "../Components/MedicationCreateModal";
import PaymentMethodsModal from "../Components/PaymentMethodsModal";
import PartnerLogoModal from "../Components/PartnerLogoModal";
import ProfessionalPortalAssistanceModal from "../Components/ProfessionalPortalAssistanceModal";
import AddNewUserWizard from "../Components/AddNewUserWizard";
import ClassMarkerQuizModal from "../Components/ClassMarkerQuizModal";
import ConvertPartnerModal from "../Components/ConvertPartnerModal";
import IdleModal from "../Components/IdleModal";
import InstalliOSWebAppPrompt from "../Components/InstalliOSWebAppPrompt";
import MessageCreateModal from "../Components/MessageCreateModal";
import PartnerAttestationModal from "../Components/PartnerAttestationModal";
import PartnerProctorModal from "../Components/PartnerProctorModal";
import { Backdrop } from "../global-components";
import SurveyModal from "../Components/SurveyModal";
import ProviderCreateModal from "../Components/ProviderCreateModal";
import DocumentCreateModal from "../Components/DocumentCreateModal";
import TicketViewModal from "../Components/TicketViewModal";
import RelationshipCreateModal from "../Components/RelationshipCreateModal";
import ClassMarkerVideoModal from "../Components/ClassMarkerVideoModal";
import CertificateModal from "../Components/CertificateModal";
import HubspotChatWidget from "../Components/HubspotChatWidget";
import PushNotification from "../Components/PushNotification";
import ReduxToastr from "react-redux-toastr";
import IdleTimer from "react-idle-timer";
import PartnerAccountRegistration from "../Pages/PartnerAccountRegistration/RegisterPartnerAccount";

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
    request,
    navigation,
    documents,
    provider,
    relationship,
    survey,
    grantor_assets,
    beneficiary_assets,
    benefits,
    budgets,
    income,
    plaid,
    account,
    myto,
    pdf,
    schedule,
    medication,
    class_marker,
    partners,
    customer_support,
    message
  } = store;

  return [
    {
      Component: PushNotification,
      props: {},
      condition: user
    },
    {
      Component: PartnerAccountRegistration,
      props: {},
      condition: (user && user.is_partner && !user.partner_data.contract_signed)
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
      Component: MaintenanceMode,
      props: {},
      condition: customer_support.core_settings && customer_support.core_settings.client_maintenance_mode
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
      Component: TicketViewModal,
      props: {
        viewingTicket: request.viewingTicket,
        ticket: request.focus
      },
      condition: request.viewingTicket
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
      Component: ProviderCreateModal,
      props: {
        creatingProvider: provider.creatingProvider,
        defaults: provider.defaults,
        updating: provider.updating,
        viewing: provider.viewing
      },
      condition: provider.creatingProvider
    },
    {
      Component: RelationshipCreateModal,
      props: {
        creatingRelationship: relationship.creatingRelationship,
        defaults: relationship.defaults,
        updating: relationship.updating,
        viewing: relationship.viewing,
        account_id: relationship.account_id,
        target_hubspot_deal_id: relationship.target_hubspot_deal_id
      },
      condition: relationship.creatingRelationship
    },
    {
      Component: SurveyModal,
      props: {
        survey: survey.focus.survey,
        surveyUser: survey.focus.currentUser,
        beneficiary: survey.focus.beneficiary
      },
      condition: survey.focus
    },
    {
      Component: GrantorAssetCreateModal,
      props: {
        simulation: grantor_assets.simulation,
        creatingGrantorAsset: grantor_assets.creating_asset,
        type: grantor_assets.type,
        source: grantor_assets.source,
        defaults: grantor_assets.defaults,
        financeType: grantor_assets.finance_type,
        updating: grantor_assets.updating,
        viewing: grantor_assets.viewing
      },
      condition: grantor_assets.creating_asset
    },
    {
      Component: BeneficiaryAssetCreateModal,
      props: {
        creatingBeneficiaryAsset: beneficiary_assets.creating_asset,
        type: beneficiary_assets.type,
        source: beneficiary_assets.source,
        defaults: beneficiary_assets.defaults,
        financeType: beneficiary_assets.finance_type,
        updating: beneficiary_assets.updating,
        viewing: beneficiary_assets.viewing
      },
      condition: beneficiary_assets.creating_asset
    },
    {
      Component: IncomeCreateModal,
      props: {
        simulation: income.simulation,
        creatingIncome: income.creating_income,
        defaults: income.defaults,
        updating: income.updating,
        viewing: income.viewing
      },
      condition: income.creating_income
    },
    {
      Component: GovernmentBenefitsCreateModal,
      props: {
        simulation: benefits.simulation,
        creatingBenefit: benefits.creating_benefit,
        defaults: benefits.defaults,
        updating: benefits.updating,
        viewing: benefits.viewing
      },
      condition: benefits.creating_benefit
    },
    {
      Component: BudgetCreateModal,
      props: {
        simulation: budgets.simulation,
        creatingBudget: budgets.creating_budget,
        defaults: budgets.defaults,
        updating: budgets.updating,
        viewing: budgets.viewing
      },
      condition: budgets.creating_budget
    },
    {
      Component: PlaidLinkModal,
      props: {
        linkingAssets: plaid.linking_assets,
        metadata: plaid.metadata,
        token: plaid.token
      },
      condition: plaid.linking_assets
    },
    {
      Component: AccountCreateModal,
      props: {
        is_partner_creation: account.is_partner_creation,
        is_user_creation: account.is_user_creation,
        creatingAccount: account.creating_account
      },
      condition: account.creating_account
    },
    {
      Component: ConvertPartnerModal,
      props: {
        convertingAccount: partners.convert_to_partner_show
      },
      condition: partners.convert_to_partner_show
    },
    {
      Component: MYTOSimulationModal,
      props: {
        viewingMYTOSimulation: myto.viewing_simulation,
        simulation: myto.focused_simulation
      },
      condition: myto.viewing_simulation
    },
    {
      Component: PDFContainerModal,
      props: {
        viewingPDF: pdf.viewing_pdf,
        title: pdf.title,
        id: "pdf_container",
        source: pdf.source
      },
      condition: pdf.viewing_pdf
    },
    {
      Component: EventCreateModal,
      props: {
        creatingEvent: schedule.viewing_event,
        defaults: schedule.defaults,
        updating: schedule.updating,
        viewing: schedule.viewing
      },
      condition: schedule.viewing_event
    },
    {
      Component: MedicationCreateModal,
      props: {
        creatingMedication: medication.viewing_medication,
        defaults: medication.defaults,
        updating: medication.updating,
        viewing: medication.viewing
      },
      condition: medication.viewing_medication
    },
    {
      Component: ProfessionalPortalAssistanceModal,
      props: {
        viewing_portal_assistance: account.portal_assistance_show
      },
      condition: account.portal_assistance_show
    },
    {
      Component: AddNewUserWizard,
      props: {
        adding_new_user: account.add_new_user_show
      },
      condition: account.add_new_user_show
    },
    {
      Component: PaymentMethodsModal,
      props: {
        payment_methods_show: account.payment_methods_show,
        standalone: account.standalone_payment_methods,
        show_payment_method_messaging: account.show_payment_method_messaging
      },
      condition: account.payment_methods_show
    },
    {
      Component: ClassMarkerQuizModal,
      props: {
        viewing_class_marker_quiz: class_marker.show,
        quiz: class_marker.focus
      },
      condition: class_marker.show
    },
    {
      Component: ClassMarkerVideoModal,
      props: {
        show_video: class_marker.show_video,
        active_video_id: class_marker.active_video_id,
        active_video_title: class_marker.active_video_title,
        quiz: class_marker.focus
      },
      condition: class_marker.show_video
    },
    {
      Component: PartnerLogoModal,
      props: {
        is_uploading_logo: partners.is_uploading_logo
      },
      condition: partners.is_uploading_logo
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
      Component: Modal,
      props: {
        show: request.show,
        type: request.type,
        title: request.title,
        callback: request.callback
      },
      condition: request.show
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
      Component: PartnerAttestationModal,
      props: {
        show: class_marker.show_student_attestation,
        defaults: class_marker.focus
      },
      condition: class_marker.show_student_attestation
    },
    {
      Component: PartnerProctorModal,
      props: {
        show: class_marker.show_proctor_form,
        defaults: class_marker.focus
      },
      condition: class_marker.show_proctor_form
    },
    {
      Component: CertificateModal,
      props: {
        is_viewing_certificate: partners.is_viewing_certificate,
        config: partners.certificate_config
      },
      condition: partners.is_viewing_certificate
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
    }
  ];
};