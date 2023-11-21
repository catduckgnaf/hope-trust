const { database } = require("../../../postgres");
const config = require("../../../config");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const { difference, uniq } = require("lodash");
const { getAccounts } = require("../../../utilities/helpers");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const { added } = JSON.parse(event.body);
  const permissionCheck = added.map((updated) => {
    if (config.environments[process.env.STAGE].allPermissions.includes(updated)) return updated;
  });
  let cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized && cognito.isRequestUser) {
    const accounts = await getAccounts(cognito.id, account_id);
    const affectedAccount = accounts.find((a) => a.account_id === account_id);
    const diff = difference(permissionCheck, affectedAccount.permissions);
    const oldMembership = await database.queryOne("SELECT * from account_memberships where account_id = $1 AND cognito_id = $2 AND version = (SELECT MAX (version) FROM account_memberships where account_id = $1 AND cognito_id = $2)", affectedAccount.account_id, cognito.id);
    const oldMembershipUpdated = await database.updateById("account_memberships", oldMembership.id, { id: oldMembership.id });
    if (oldMembershipUpdated) {
      delete oldMembership.id;
      const created = await database.insert(
        "account_memberships", {
          ...oldMembership,
          permissions: uniq(diff.concat(affectedAccount.permissions)),
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
            "message": "Successfully added user permissions",
            "payload": { ...user, verifications: cognito.verifications }
          })
        };
      }
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not add user permissions."
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
