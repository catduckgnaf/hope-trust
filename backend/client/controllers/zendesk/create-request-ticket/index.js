const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const sendTemplateEmail = require("../../../services/sendgrid/send-template-email");
const { capitalize } = require("../../../utilities/helpers");
const moment = require("moment");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id, cognito_id } = event.pathParameters;
  const { ticket } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized || cognito.isRequestUser) {
    const created = await database.insert("service_requests", {
      cognito_id,
      account_id,
      ...ticket,
      status: "new"
    });
    if (created) {
      const request = await database.queryOne(`SELECT
        sr.*,
        uuu.first_name as account_first,
        uuu.last_name as account_last,
        u.first_name as creator_first,
        u.last_name as creator_last,
        uu.first_name as assignee_first,
        uu.last_name as assignee_last
        from service_requests sr
        JOIN users u on u.cognito_id = sr.cognito_id
        LEFT JOIN users uu on uu.cognito_id = sr.assignee
        JOIN users uuu on uuu.cognito_id = sr.account_id
        where sr.id = $1
        AND u.status = 'active'
        AND uuu.status = 'active'`, created.id);
      const system = await database.queryOne("SELECT u.first_name, u.last_name, u.email from system_settings ss JOIN users u on u.cognito_id = ss.customer_support where ss.id = 'system_settings' AND u.status = 'active'");
      const request_type = ticket.request_type === "other_request_type" ? "other" : ticket.request_type.replace(/_/g, " ");
      await sendTemplateEmail(system.email, {
        first_name: system.first_name,
        last_name: system.last_name,
        template_type: "new_ticket",
        merge_fields: {
          submitted: moment().format("MM/DD/YYYY [at] hh:mm A"),
          first_name: system.first_name,
          creator_first: request.creator_first,
          creator_last: request.creator_last,
          account_first: request.account_first,
          account_last: request.account_last,
          request_type: capitalize(request_type),
          type: request_type,
          title: request.title,
          body: request.body,
          subject: `New ${capitalize(request_type)} Ticket`,
          preheader: `A new ${request_type} ticket has been submitted by ${request.creator_first} ${request.creator_last}. Please review.`
        }
      });
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully created new service request.",
          "payload": request
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not create service request ticket."
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
