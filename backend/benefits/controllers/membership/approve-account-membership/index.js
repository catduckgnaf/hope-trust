const { database } = require("../../../postgres");
const { WEBMAIL_PROVIDER_DOMAINS } = require("../../../utilities/helpers");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const sendTemplateEmail = require("../../../services/sendgrid/send-template-email");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const { cognito_id } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const oldMembership = await database.query("SELECT * from account_memberships where cognito_id = $1 AND account_id = $2 AND status = 'active'", cognito_id, account_id);
    const oldMembershipUpdated = await database.updateById("account_memberships", oldMembership[0].id, { "approved": true });
    if (oldMembershipUpdated) {
      const approvers = await database.query("SELECT * from users where cognito_id = $1 AND status = 'active'", cognito.id);
      const approved = await database.query("SELECT * from users where cognito_id = $1 AND status = 'active'", cognito_id);
      let benefits_data = await database.query("SELECT * from wholesalers where cognito_id = $1 AND status = 'active'", approvers[0].cognito_id);
      let benefits_type = "wholesalers";
      if (!benefits_data.length) {
        benefits_data = await database.query("SELECT * from retailers where cognito_id = $1 AND status = 'active'", approvers[0].cognito_id);
        benefits_type = "retailers";
      }
      if (!benefits_data.length) {
        benefits_data = await database.query("SELECT * from groups where cognito_id = $1 AND status = 'active'", approvers[0].cognito_id);
        benefits_type = "groups";
      }
      if (!benefits_data.length) {
        benefits_data = await database.query("SELECT * from teams where cognito_id = $1 AND status = 'active'", approvers[0].cognito_id);
        benefits_type = "teams";
      }
      if (benefits_data.length && approved.length) {
        let domains = benefits_data[0].domains;
        const domain = approved[0].email.split("@")[1];
        if (!WEBMAIL_PROVIDER_DOMAINS.includes(domain)) {
          domains.push(domain);
          await database.updateById(benefits_type, benefits_data[0].id, { domains: JSON.stringify(domains).replace("[", "{").replace("]", "}") });
        }
      }
      await sendTemplateEmail(approved[0].email, {
        first_name: approved[0].first_name,
        last_name: approved[0].last_name,
        template_type: "account_user_approved",
        merge_fields: {
          first_name: approved[0].first_name,
          approver_name: approvers.length ? `${approvers[0].first_name} ${approvers[0].last_name}` : null,
          login_url: `https://${process.env.STAGE === "production" ? "benefits-" : `${process.env.STAGE}-benefits`}.hopecareplan.com/login`,
          subject: "Request Approved",
          preheader: `Your request was approved${approvers.length ? ` by ${approvers[0].first_name} ${approvers[0].last_name}!` : "!"}`
        }
      });
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully approved membership."
        })
      };
    } else {
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not approve membership."
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
