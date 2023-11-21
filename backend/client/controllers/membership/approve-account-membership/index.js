const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const sendTemplateEmail = require("../../../services/sendgrid/send-template-email");
const { uniq } = require("lodash");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const { updates, approval_id, referral } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized || cognito.isRequestUser) {
    const oldMembership = await database.queryOne("SELECT * from account_memberships where cognito_id = $1 AND account_id = $2 AND status = $3", cognito.id, approval_id, "active");
    const oldMembershipUpdated = await database.updateById("account_memberships", oldMembership.id, { "status": "inactive" });
    if (oldMembershipUpdated) {
      delete oldMembership.id;
      const created = await database.insert(
        "account_memberships", {
          ...oldMembership,
          ...updates,
          "version": oldMembership.version + 1
        }
      );
      if (referral && referral.metadata && referral.metadata.isReferral === "true" && referral.metadata.myto_access === "true") { // if the referral code grants myto permissions
          let requests = [];
          let additional_permissions = ["myto-view", "myto-edit"]; // permissions to be added if success
          const account_memberships = await database.query("SELECT * from account_memberships where account_id = $1 AND status = $2", approval_id, "active");
          for (let i = 0; i < account_memberships.length; i++) { // for each member of this account
            const oldAccountMembership = await database.queryOne("SELECT * from account_memberships where cognito_id = $1 AND account_id = $2 AND status = $3", account_memberships[i].cognito_id, approval_id, "active");
            if (!oldAccountMembership.length) continue; // if we didn't find a member, skip
            if (oldAccountMembership.linked_account) continue; // if the member is a linked account, skip -  ie: linked by email or a partner
            if (additional_permissions.every((p) => oldAccountMembership.permissions.includes(p))) continue; // if the member already has myto permissions, skip
            if (["finance-view", "finance-edit"].every((p) => !oldAccountMembership.permissions.includes(p))) continue; // if the member does not have finance permissions, skip
            await database.updateById("account_memberships", oldAccountMembership.id, { "status": "inactive" });
            delete oldAccountMembership.id;
            requests.push(database.insert(
              "account_memberships", {
                ...oldAccountMembership,
                "permissions": uniq([...oldAccountMembership.permissions, ...additional_permissions]),
                "status": "active",
                "version": oldAccountMembership.version + 1
              }
            ));
          }
          await Promise.all(requests);
        }
      if (created) {
        // Send approved email to account admins
        const approver = await database.queryOne("SELECT * from users where cognito_id = $1 AND status = $2", cognito.id, "active");
        const memberships = await database.query("SELECT * from account_memberships where account_id = $1 AND status = $2", approval_id, "active");
        let sent_emails = [];
        for (let i = 0; i < memberships.length; i++) {
          const member = memberships[i];
          const isAdmin = member.permissions.includes("account-admin-edit");
          if (member.cognito_id === cognito.id) continue;
          if (member.linked_account) continue;
          if (!isAdmin) continue;
          const user = await database.queryOne("SELECT * from users where cognito_id = $1 AND status = $2", member.cognito_id, "active");
          if (!user) continue;
          if (sent_emails.includes(user.email)) continue;
          await sendTemplateEmail(user.email, {
            first_name: user.first_name,
            last_name: user.last_name,
            template_type: "link_approved",
            merge_fields: {
              first_name: user.first_name,
              approver_name: approver ? `${approver.first_name} ${approver.last_name}` : null,
              subject: "Account Link Approved",
              preheader: `Your account link was approved${approver ? ` by ${approver.first_name} ${approver.last_name}!` : "!"}`
            }
          });
          sent_emails.push(user.email);
        }
        return {
          statusCode: 200,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": true,
            "message": "Successfully created new membership record",
            "payload": created
          })
        };
      }
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not create new membership record."
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not update membership."
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
