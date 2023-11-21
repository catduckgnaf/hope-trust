const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const { capitalize } = require("../../../utilities/helpers");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const sendTemplateEmail = require("../../../services/sendgrid/send-template-email");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id, cognito_id } = event.pathParameters;
  let { newMessage, user, url_parameters = false, type = "login" } = JSON.parse(event.body);
  if (url_parameters) {
    url_parameters = new URLSearchParams(url_parameters);
    if (newMessage.to_first) url_parameters.append("firstname", capitalize(newMessage.to_first));
    if (newMessage.to_last) url_parameters.append("lastname", capitalize(newMessage.to_last));
    if (newMessage.to_email) url_parameters.append("email", newMessage.to_email);
  }
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    const created = await database.insert(
      "messages", {
        ...newMessage,
        cognito_id,
        account_id
      }
    );
    if (created) {
      const messages = await database.query(`SELECT
      m.*,
      u.first_name as sender_first,
      u.last_name as sender_last,
      uu.first_name as account_first,
      uu.last_name as account_last,
      uuu.first_name as recipient_user_first,
      uuu.last_name as recipient_user_last
      from messages m
      JOIN users u on u.cognito_id = m.cognito_id AND u.version = (SELECT MAX (version) FROM users where cognito_id = u.cognito_id)
      JOIN users uu on uu.cognito_id = m.account_id AND uu.version = (SELECT MAX (version) FROM users where cognito_id = uu.cognito_id)
      LEFT JOIN users uuu on uuu.cognito_id = m.to_cognito AND uuu.version = (SELECT MAX (version) FROM users where cognito_id = uuu.cognito_id)
      where m.id = $1`, created);
      if (!messages.length) {
        return {
          statusCode: 400,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": false,
            "message": "Could not find created message."
          })
        };
      }
      await sendTemplateEmail(newMessage.to_email, {
        first_name: capitalize(newMessage.to_first),
        last_name: capitalize(newMessage.to_last),
        from: { name: `${user.first_name} ${user.last_name}` },
        replyTo: { name: `${user.first_name} ${user.last_name}`, email: `${user.username || user.cognito_id}@${process.env.STAGE === "production" ? "" : `${process.env.STAGE || "development"}-`}message.hopecareplan.com`},
        template_type: "application_message",
        merge_fields: {
          first_name: capitalize(newMessage.to_first),
          sender_first: capitalize(user.first_name),
          sender_last: capitalize(user.last_name),
          sender_email: user.email,
          body: newMessage.body,
          environment: process.env.STAGE,
          message_id: created,
          login_text: (type === "registration" && url_parameters) ? "Register" : "Login",
          login_url: (type === "registration" && url_parameters) ? `https://${process.env.STAGE === "production" ? "app" : process.env.STAGE}.hopecareplan.com/client-registration?${url_parameters.toString()}` : `https://${process.env.STAGE === "production" ? "app" : process.env.STAGE}.hopecareplan.com/login`,
          subject: newMessage.subject,
          type: "message",
          preheader: `You have received a message from ${user.first_name} ${user.last_name}`
        }
      });
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully created new message.",
          "payload": messages[0]
        })
      };
    } else {
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not create new message."
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