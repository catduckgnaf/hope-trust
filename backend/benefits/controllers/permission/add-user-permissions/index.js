const { database } = require("../../../postgres");
const config = require("../../../config");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const _ = require("lodash");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const { added } = JSON.parse(event.body);
  const permissionCheck = added.map((updated) => {
    if (config.environments[process.env.STAGE].allPermissions.includes(updated)) return updated;
  });
  let cognito = await getCognitoUser(event, account_id);
  if (cognito.isRequestUser) {
    let affectedAccount = cognito.accounts.find((account) => account.account_id === account_id);
    let difference = _.difference(permissionCheck, affectedAccount.permissions);
    const oldMemberships = await database.query("SELECT * from account_memberships where account_id = $1 AND cognito_id = $2 AND version = (SELECT MAX (version) FROM account_memberships where account_id = $1 AND cognito_id = $2)", affectedAccount.account_id, cognito.id);
    const oldMembershipUpdated = await database.updateById("account_memberships", oldMemberships[0].id, { id: oldMemberships[0].id });
    if (oldMembershipUpdated) {
      delete oldMemberships[0].id;
      const created = await database.insert(
        "account_memberships",
        {
          ...oldMemberships[0],
          permissions: _.uniq(difference.concat(affectedAccount.permissions)),
          "version": oldMemberships[0].version + 1
        }
      );
      if (created) {
        let cognito = await getCognitoUser(event, account_id);
        const user = await database.query("SELECT * from users where cognito_id = $1 AND version = (SELECT MAX (version) FROM users where cognito_id = $1)", cognito.id);
        return {
          statusCode: 200,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": true,
            "message": "Successfully added user permissions",
            "payload": { ...user[0], accounts: cognito.accounts, verifications: cognito.verifications }
          })
        };
      } else {
        return {
          statusCode: 400,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": false,
            "message": "Could not add user permissions."
          })
        };
      }
    } else {
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not update user."
        })
      };
    }
  } else {
    return {
      statusCode: 401,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "You are not authorized to perform this action."
      })
    };
  }
};
