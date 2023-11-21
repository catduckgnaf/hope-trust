const accountPermissions = require("../controllers/account/permissions");
const accountMembershipPermissions = require("../controllers/membership/permissions");
const userPermissions = require("../controllers/user/controllers/permissions");
const financialPermissions = require("../controllers/finance/permissions");
const documentPermissions = require("../controllers/document/permissions");
const permissionPermissions = require("../controllers/permission/permissions");
const securityQuestionPermissions = require("../controllers/security-question/permissions");
const stripePermissions = require("../controllers/stripe/permissions");
const providerPermissions = require("../controllers/provider/permissions");
const AXSemanticsPermissions = require("../controllers/ax-semantics/permissions");
const surveyGizmoPermissions = require("../controllers/survey-gizmo/permissions");
const plaidPermissions = require("../controllers/plaid/permissions");
const eventPermissions = require("../controllers/event/permissions");
const medicationPermissions = require("../controllers/medication/permissions");
const partnerPermissions = require("../controllers/partner/permissions");
const helloSignPermissions = require("../controllers/hello-sign/permissions");
const referralPermissions = require("../controllers/referral/permissions");
const planPermissions = require("../controllers/plan/permissions");
const hubspotPermissions = require("../controllers/hubspot/permissions");
const messagePermissions = require("../controllers/message/permissions");
const cePermissions = require("../controllers/ce/permissions");
const zendeskPermissions = require("../controllers/zendesk/permissions");

module.exports = {
  ...accountPermissions,
  ...accountMembershipPermissions,
  ...userPermissions,
  ...financialPermissions,
  ...documentPermissions,
  ...permissionPermissions,
  ...securityQuestionPermissions,
  ...stripePermissions,
  ...providerPermissions,
  ...AXSemanticsPermissions,
  ...surveyGizmoPermissions,
  ...plaidPermissions,
  ...eventPermissions,
  ...medicationPermissions,
  ...partnerPermissions,
  ...helloSignPermissions,
  ...referralPermissions,
  ...planPermissions,
  ...messagePermissions,
  ...hubspotPermissions,
  ...cePermissions,
  ...zendeskPermissions
};
