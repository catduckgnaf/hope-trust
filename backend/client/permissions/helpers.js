const permissions = require(".");
const { database } = require("../postgres");
const { convertArray } = require("../utilities/helpers");

const default_generic_features = {
  "documents": true,
  "create_accounts": true,
  "billing": true,
  "two_factor_authentication": true,
  "security_questions": true,
  "change_password": true,
  "org_export": false,
  "document_generation": false,
  "contact_options": false,
  "surveys": false,
  "medications": false,
  "schedule": false,
  "finances": false,
  "relationships": false,
  "providers": false,
  "permissions": true,
  "partner_conversion": false,
  "trust": false,
  "care_coordination": false,
  "in_app_purchases": false,
  "live_chat": true,
  "messaging": true,
  "bank_account_linking": true
};
const default_user_features = {
  "document_generation": true,
  "contact_options": true,
  "surveys": true,
  "documents": true,
  "medications": true,
  "schedule": true,
  "finances": true,
  "create_accounts": true,
  "relationships": true,
  "providers": true,
  "billing": true,
  "two_factor_authentication": true,
  "permissions": true,
  "security_questions": true,
  "partner_conversion": false,
  "change_password": true,
  "trust": false,
  "care_coordination": false,
  "in_app_purchases": true,
  "live_chat": true,
  "messaging": true,
  "bank_account_linking": true
};

// checks if the user making the request is the same user being requested
const isRequestUser = (requestUser, id) => {
  return requestUser && requestUser.Username === id;
};

// check if the request user has permissions to hit endpoints on a specific account
const isAuthorized = async (resource, account_id, cognito_id) => {
  const allRoutes = Object.keys(permissions);
  if (permissions[resource] && !permissions[resource].authorized.length) return true;
  const account = await database.queryOne(`SELECT DISTINCT ON (a.account_id)
      a.*,
      am.permissions
      FROM account_memberships am
      JOIN accounts a ON a.account_id = am.account_id AND a.status = 'active'
      WHERE am.account_id = $1 AND am.cognito_id = $2 AND am.status = 'active'`, account_id, cognito_id);
  if (account && allRoutes.includes(resource)) {
    if (permissions[resource]) return account.permissions.some((permission) => permissions[resource].authorized.includes(permission));
    return false;
  }
  return false;
};

// check passed in provider, username, and password to see if we have awarded authantication to this third party
const isThirdPartyCredentials = (username, password, provider) => {
  if (process.env[`${provider}_BASIC_USERNAME`] === username && process.env[`${provider}_BASIC_PASSWORD`] === password) return true;
  return false;
};

// check basic authentication credentials returns boolean to allow API access for third party
const isThirdPartyAuthorized = (event, provider) => {
  const authorizationHeader = event.headers.authorization;
  if (!authorizationHeader) return false;
  const encodedCreds = authorizationHeader.split(" ")[1];
  if (encodedCreds) {
    const plainCreds = (new Buffer.from(encodedCreds, "base64")).toString().split(":");
    const username = plainCreds[0];
    const password = plainCreds[1];
    if (isThirdPartyCredentials(username, password, provider)) return true;
    return false;
  } else {
    return false;
  }
};

// Iterate through all of an accounts users to give them new permissions
const updateAccountMembershipPlanPermissions = async (plan, account_id, action) => {
  const account = await database.queryOne("SELECT * from accounts where account_id = $1 AND status = $2", account_id, "active");
  let update_requests = [];
  const new_plan_permissions = plan.permissions;
  const memberships = await database.query("SELECT * from account_memberships where account_id = $1 AND status = $2", account_id, "active");
    for (let i = 0; i < memberships.length; i++) {
      const member = memberships[i];
      const user = await database.queryOne("SELECT * from users where cognito_id = $1 AND status = $2", member.cognito_id, "active");
      const current_permissions = member.permissions;
      if ((account.cognito_id !== user.cognito_id)) {
        if (action === "cancel") {
          let permissions_to_remove = current_permissions.filter((permission) => !new_plan_permissions.includes(permission)).concat(new_plan_permissions.filter((permission) => !current_permissions.includes(permission)));
          const new_permissions = current_permissions.filter((el) => !permissions_to_remove.includes(el));
          update_requests.push(database.updateById("account_memberships", member.id, { "permissions": convertArray(new_permissions) }));
        }
      } else {
        update_requests.push(database.updateById("account_memberships", member.id, { "permissions": convertArray(new_plan_permissions) }));
      }
    }
  return await Promise.all(update_requests);
};

module.exports = {
  isRequestUser,
  isAuthorized,
  isThirdPartyAuthorized,
  updateAccountMembershipPlanPermissions,
  default_generic_features,
  default_user_features
};
