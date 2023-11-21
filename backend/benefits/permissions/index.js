const userPermissions = require("../controllers/user/permissions");
const accountPermissions = require("../controllers/account/permissions");
const documentPermissions = require("../controllers/document/permissions");
const hellosignPermissions = require("../controllers/hello-sign/permissions");
const hubspotPermissions = require("../controllers/hubspot/permissions");
const wholesalePermissions = require("../controllers/wholesale/permissions");
const retailPermissions = require("../controllers/retail/permissions");
const agentPermissions = require("../controllers/agents/permissions");
const groupPermissions = require("../controllers/groups/permissions");
const teamPermissions = require("../controllers/teams/permissions");
const clientPermissions = require("../controllers/clients/permissions");
const membershipPermissions = require("../controllers/membership/permissions");
const zendeskPermissions = require("../controllers/zendesk/permissions");
const messagePermissions = require("../controllers/message/permissions");
const permissionPermissions = require("../controllers/permission/permissions");
const securityQuestionsPermissions = require("../controllers/security-question/permissions");
const planPermissions = require("../controllers/plan/permissions");
const stripePermissions = require("../controllers/stripe/permissions");

module.exports = {
  ...userPermissions,
  ...accountPermissions,
  ...documentPermissions,
  ...hellosignPermissions,
  ...hubspotPermissions,
  ...wholesalePermissions,
  ...retailPermissions,
  ...agentPermissions,
  ...groupPermissions,
  ...teamPermissions,
  ...clientPermissions,
  ...membershipPermissions,
  ...zendeskPermissions,
  ...messagePermissions,
  ...permissionPermissions,
  ...securityQuestionsPermissions,
  ...planPermissions,
  ...stripePermissions
};
