const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const sendTemplateEmail = require("../../../services/sendgrid/send-template-email");
const addContactToDeal = require("../../../services/hubspot/add-contact-to-deal");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  let { target_account_id, cognito_id, data = {} } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const oldMembership = await database.queryOne("SELECT * from account_memberships where cognito_id = $1 AND account_id = $2 AND status = $3", cognito_id, target_account_id, "active");
    if (!oldMembership) {
      if (!data.permissions || !data.permissions.length) data.permissions = ["basic-user"];
      const created = await database.insert(
        "account_memberships", {
          ...data,
          account_id: target_account_id,
          cognito_id,
          "status": "active",
          "linked_account": true,
          "onboarded": true,
          "approved": false,
          "version": 1
        }
      );
      if (created) {
        const target_account = await database.queryOne("SELECT * from accounts where account_id = $1 AND status = 'active'", target_account_id);
        const approver = await database.queryOne("SELECT * from users where cognito_id = $1 AND status = 'active'", target_account_id);
        const requester = await database.queryOne("SELECT * from users where cognito_id = $1 AND status = 'active'", cognito_id);
        if (target_account && requester) await addContactToDeal(requester.hubspot_contact_id, target_account.hubspot_deal_id);

        if (["wholesale", "retail", "agent", "group", "team"].includes(data.type)) {
          await sendTemplateEmail(approver.email, {
            first_name: approver.first_name,
            last_name: approver.last_name,
            template_type: "account_approval_request",
            merge_fields: {
              first_name: approver.first_name,
              requester_name: requester ? `${requester.first_name} ${requester.last_name}` : null,
              type: data.type,
              login_url: `https://${process.env.STAGE === "production" ? "benefits-" : `${process.env.STAGE}-benefits`}.hopecareplan.com/login`,
              subject: "Approval Required",
              preheader: `${requester ? `${requester.first_name} ${requester.last_name}` : "A new user"} has requested to join your account on the Hope Trust Benefits Network.`
            }
          });
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
        "message": "This user is already a member of this account."
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
