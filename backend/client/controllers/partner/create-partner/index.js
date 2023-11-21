const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const sendTemplateEmail = require("../../../services/sendgrid/send-template-email");
const { from } = require("../../../services/sendgrid");
const { capitalize } = require("../../../utilities/helpers");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id, cognito_id } = event.pathParameters;
  const { newPartner, partner_type } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isRequestUser) {
    const user = await database.queryOne("SELECT * from users where cognito_id = $1 AND status = $2", cognito_id, "active");
    if (user) {
      const created = await database.insert(
        "partners", {
          ...newPartner,
          cognito_id,
          partner_type,
          "status": "active",
          "approved": false,
          "version": 1
        }
      );
      if (created) {
        if (created.domain_approved) {
          const domain = user.email.split("@")[1];
          await sendTemplateEmail("domainapproval@hopetrust.com", {
            first_name: "Hope Trust",
            last_name: "Administration",
            template_type: "domain_approval_required",
            merge_fields: {
              first_name: capitalize(user.first_name),
              last_name: capitalize(user.last_name),
              email: user.email,
              organization: created.name,
              login_url: `https://${process.env.STAGE === "production" ? "" : `${process.env.STAGE}-`}customer-support.hopecareplan.com/login`,
              domain,
              subject: "Domain Approval Required",
              preheader: `${user.first_name} ${user.last_name} has registered as a partner with an unapproved domain (${domain}).`
            }
          });
        }
        return {
          statusCode: 200,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": true,
            "message": "Successfully created new partner.",
            "payload": { ...created, ...user }
          })
        };
      }
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not create new partner."
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not find an associated user."
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
