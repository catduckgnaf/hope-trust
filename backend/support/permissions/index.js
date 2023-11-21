const userPermissions = require("../controllers/user/permissions");
const accountPermissions = require("../controllers/account/controllers/permissions");
const referralPermissions = require("../controllers/referral/permissions");
const membershipPermissions = require("../controllers/membership/permissions");
const planPermissions = require("../controllers/plan/permissions");
const stripePermissions = require("../controllers/stripe/permissions");
const securityQuestionPermissions = require("../controllers/security-question/permissions");
const documentPermissions = require("../controllers/document/permissions");
const partnerPermissions = require("../controllers/partner/permissions");
const hubspotPermissions = require("../controllers/hubspot/permissions");
const wholesalePermissions = require("../controllers/wholesale/permissions");
const retailPermissions = require("../controllers/retail/permissions");
const agentPermissions = require("../controllers/agents/permissions");
const groupPermissions = require("../controllers/groups/permissions");
const teamPermissions = require("../controllers/teams/permissions");
const ticketPermissions = require("../controllers/tickets/permissions");
const messagePermissions = require("../controllers/message/permissions");
const cePermissions = require("../controllers/ce/permissions");
const helloSignPermissions = require("../controllers/hello-sign/permissions");
const surveyPermissions = require("../controllers/survey/permissions");

module.exports = {
  ...userPermissions,
  ...accountPermissions,
  ...membershipPermissions,
  ...referralPermissions,
  ...planPermissions,
  ...stripePermissions,
  ...securityQuestionPermissions,
  ...documentPermissions,
  ...partnerPermissions,
  ...hubspotPermissions,
  ...wholesalePermissions,
  ...retailPermissions,
  ...agentPermissions,
  ...groupPermissions,
  ...teamPermissions,
  ...ticketPermissions,
  ...messagePermissions,
  ...cePermissions,
  ...helloSignPermissions,
  ...surveyPermissions
};
