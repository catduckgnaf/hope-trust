const { database } = require("../../../postgres");
const config = require("../../../config");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const { difference, uniq } = require("lodash");
const { getAccounts } = require("../../../utilities/helpers");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const { removed } = JSON.parse(event.body);
  const permissionCheck = removed.map((updated) => {
    if (config.environments[process.env.STAGE].allPermissions.includes(updated)) return updated;
  });
  let cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized && cognito.isRequestUser) {
    const accounts = await getAccounts(cognito.id, account_id);
    const affectedAccount = accounts.find((a) => a.account_id === account_id);
    let removed_permissions = [];
    permissionCheck.filter((e) => e).forEach((permission) => {
      let permission_category = permission.split("-");
      let action = permission_category[permission_category.length - 1];
      const cat = permission_category.filter((e) => e !== "view").join("-");
      if (action === "view") {
        let hasEdit = affectedAccount.permissions.includes(`${cat}-edit`);
        if (!hasEdit) removed_permissions.push(`${cat}-view`);
        if (permissionCheck.includes(`${cat}-view`) && !permissionCheck.includes(`${cat}-edit`)) {
      
        } else {
          removed_permissions.push(permission);
        }
      } else if (permissionCheck.includes(`${cat}-view`) && permissionCheck.includes(`${cat}-edit`)) {
        removed_permissions.push(`${cat}-view`);
        removed_permissions.push(`${cat}-edit`);
      } else if (action === "edit") {
        removed_permissions.push(permission);
      }
    });
    let diff = difference(affectedAccount.permissions, removed_permissions);
    const oldMembership = await database.queryOne("SELECT * from account_memberships where account_id = $1 AND cognito_id = $2 AND version = (SELECT MAX (version) FROM account_memberships where account_id = $1 AND cognito_id = $2)", affectedAccount.account_id, cognito.id);
    const oldMembershipUpdated = await database.updateById("account_memberships", oldMembership.id, { status: "inactive" });
    if (oldMembershipUpdated) {
      delete oldMembership.id;
      const created = await database.insert(
        "account_memberships", {
          ...oldMembership,
          permissions:  uniq(diff),
          status: "active",
          "version": oldMembership.version + 1
        }
      );
      if (created) {
        let cognito = await getCognitoUser(event, account_id);
        const user = await database.queryOne("SELECT * from users where cognito_id = $1 AND version = (SELECT MAX (version) FROM users where cognito_id = $1)", cognito.id);
        return {
          statusCode: 200,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": true,
            "message": "Successfully removed user permissions",
            "payload": { ...user, verifications: cognito.verifications }
          })
        };
      }
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not remove user permissions."
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not update user."
      })
    };
  }
  return {
    statusCode: 401,
    headers: getHeaders(),
    body: JSON.stringify({
      "success": false,
      "message": "You are not authorized to perform this action."
    })
  };
};
