const { database } = require("../postgres");
const permissions = require(".");

const default_generic_features = {
  "document_generation": true,
  "create_accounts": true,
  "billing": true,
  "two_factor_authentication": true,
  "security_questions": true,
  "change_password": true,
  "org_export": false,
  "live_chat": true,
  "messaging": true
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
  "bank_account_linking": false
};

// checks if the user making the request is the same user being requested
const isRequestUser = (requestUser, id) => {
  return requestUser && requestUser.Username === id;
};

// check if the request user has permissions to hit endpoints on a specific account
const isAuthorized = (resource, userAccounts, account_id) => {
  const allRoutes = Object.keys(permissions);
  if (permissions[resource] && !permissions[resource].authorized.length) return true;
  if (userAccounts.length) {
    const account = userAccounts.find((account) => account.account_id === account_id);
    // if at least one queried account belongs to you, AND you're trying to hit a route that actually exists
    if (account && allRoutes.includes(resource)) {
      if (permissions[resource]) return account.permissions.some((permission) => permissions[resource].authorized.includes(permission));
      return false;
    }
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
  const account = await database.query("SELECT * from accounts where account_id = $1 AND status = $2", account_id, "active");
  let update_requests = [];
  const new_plan_permissions = plan.permissions;
  const memberships = await database.query("SELECT * from account_memberships where account_id = $1 AND status = $2", account_id, "active");
    for (let i = 0; i < memberships.length; i++) {
      const member = memberships[i];
      const user = await database.query("SELECT * from users where cognito_id = $1 AND status = $2", member.cognito_id, "active");
      const current_permissions = member.permissions;
      if ((account[0].cognito_id !== user[0].cognito_id) && !current_permissions.includes("hopetrust-super-admin")) {
        if (action === "cancel") {
          let permissions_to_remove = current_permissions.filter((permission) => !new_plan_permissions.includes(permission)).concat(new_plan_permissions.filter((permission) => !current_permissions.includes(permission)));
          const new_permissions = current_permissions.filter((el) => !permissions_to_remove.includes(el));
          update_requests.push(database.updateById("account_memberships", member.id, { "permissions": JSON.stringify(new_permissions).replace("[", "{").replace("]", "}") }));
        }
      } else {
        if (current_permissions.includes("hopetrust-super-admin")) {
          update_requests.push(database.updateById("account_memberships", member.id, { "permissions": JSON.stringify([...new_plan_permissions, "hopetrust-super-admin"]).replace("[", "{").replace("]", "}") }));
        } else {
          update_requests.push(database.updateById("account_memberships", member.id, { "permissions": JSON.stringify(new_plan_permissions).replace("[", "{").replace("]", "}") }));
        }
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
