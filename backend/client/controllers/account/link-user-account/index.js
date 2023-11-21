const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const { buildHubspotContactUpdateData } = require("../../../utilities/helpers");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const sendTemplateEmail = require("../../../services/sendgrid/send-template-email");
const createHubspotContact = require("../../../services/hubspot/create-hubspot-contact");
const addContactToDeal = require("../../../services/hubspot/add-contact-to-deal");
const { capitalize } = require("../../../utilities/helpers");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const { linked_account = true, link_to, user_type, email, requester, notify = true, discountCode, approved = false } = JSON.parse(event.body);
  let cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized || cognito.isRequestUser) {
    const foundUser = await database.queryOne("SELECT * from users where email = $1 AND status = $2", email, "active"); // users we found with this email whom are active
    if (foundUser) {
      const existingLink = await database.queryOne("SELECT * from account_memberships where cognito_id = $1 AND account_id = $2 AND status = $3", foundUser.cognito_id, (link_to || account_id), "active");
      if (!existingLink) {
        const account = await database.queryOne("SELECT * from accounts where account_id = $1 and status = $2", (link_to || account_id), "active");
        const plan = await database.queryOne("SELECT * from user_plans where price_id = $1", account.plan_id);
        let granted_permissions = plan ? plan.permissions : ["basic-user"];
        if (discountCode && discountCode.metadata && discountCode.metadata.isReferral === "true" && discountCode.metadata.myto_access === "true" && (plan && plan.name === "Free")) granted_permissions = granted_permissions.concat(["myto-view", "myto-edit"]);
        const membership = await database.insert(
          "account_memberships", {
            linked_account,
            approved,
            "cognito_id": foundUser.cognito_id,
            "account_id": (link_to || account_id),
            "permissions": granted_permissions,
            "status": "active",
            "type": user_type,
            "version": 1
          }
        );
        if (membership) {
          const hubspotContact = await createHubspotContact(foundUser.email, [
            ...buildHubspotContactUpdateData(foundUser, false, "account link"),
            { property: "account_role", value: user_type },
            { "property": "hs_lead_status", "value": "CUSTOMER" }
          ]);
          if (hubspotContact.success && account.hubspot_deal_id) {
            await database.updateById("users", foundUser.id, { hubspot_contact_id: hubspotContact.data.vid });
            await addContactToDeal(hubspotContact.data.vid, account.hubspot_deal_id);
          }
          if (requester && notify) {
            await sendTemplateEmail(email, {
              first_name: capitalize(foundUser.first_name),
              last_name: capitalize(foundUser.last_name),
              template_type: "account_link_request",
              merge_fields: {
                first_name: capitalize(foundUser.first_name),
                login_url: `https://${process.env.STAGE === "production" ? "app" : process.env.STAGE}.hopecareplan.com/login`,
                requester_name: `${capitalize(requester.first_name)} ${capitalize(requester.last_name)}`,
                requester_first_name: capitalize(requester.first_name),
                subject: "Account Link Request",
                preheader: `${capitalize(requester.first_name)} ${capitalize(requester.last_name)} wants to add you to their Hope Trust account.`
              }
            });
          }
          return {
            statusCode: 200,
            headers: getHeaders(),
            body: JSON.stringify({
              "success": true,
              "message": "Successfully associated user with account",
              "payload": { user: { ...foundUser, ...membership } }
            })
          };
        }
        return {
          statusCode: 400,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": false,
            "message": "Could not associate user to account."
          })
        };
        
      }
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": `Your account is already linked to ${foundUser.first_name} ${foundUser.last_name}.`
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not verify link for this account."
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
