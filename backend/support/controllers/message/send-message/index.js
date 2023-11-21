const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const { capitalize } = require("../../../utilities/helpers");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const sendTemplateEmail = require("../../../services/sendgrid/send-template-email");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id, cognito_id } = event.pathParameters;
  const { newMessage, user } = JSON.parse(event.body);
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
      const message = await database.queryOne(`SELECT
        m.*,
        u.first_name as sender_first,
        u.last_name as sender_last,
        uu.first_name as account_first,
        uu.last_name as account_last,
        uuu.first_name as recipient_user_first,
        uuu.last_name as recipient_user_last,
        NULLIF(TRIM(concat(u.first_name, ' ', u.last_name)), '') as sender_name,
        NULLIF(TRIM(concat(uu.first_name, ' ', uu.last_name)), '') as account_name,
        NULLIF(TRIM(concat(uuu.first_name, ' ', uuu.last_name)), '') as recipient_name
        from messages m
        JOIN users u on u.cognito_id = m.cognito_id AND u.version = (SELECT MAX (version) FROM users where cognito_id = u.cognito_id)
        JOIN users uu on uu.cognito_id = m.account_id AND uu.version = (SELECT MAX (version) FROM users where cognito_id = uu.cognito_id)
        LEFT JOIN users uuu on uuu.cognito_id = m.to_cognito AND uuu.version = (SELECT MAX (version) FROM users where cognito_id = uuu.cognito_id)
        where m.id = $1`, created.id);
      await sendTemplateEmail(newMessage.to_email, {
        first_name: capitalize(newMessage.to_first),
        last_name: capitalize(newMessage.to_last),
        from: { name: `${user.first_name} ${user.last_name}` },
        replyTo: { name: `${user.first_name} ${user.last_name}`, email: `${user.username || user.cognito_id}@${process.env.STAGE === "production" ? "" : `${process.env.STAGE || "development"}-`}message.hopecareplan.com` },
        template_type: "application_message",
        merge_fields: {
          first_name: capitalize(newMessage.to_first),
          sender_first: capitalize(user.first_name),
          sender_last: capitalize(user.last_name),
          sender_email: user.email,
          body: newMessage.body,
          login_url: `https://${process.env.STAGE === "production" ? "app" : process.env.STAGE}.hopecareplan.com/login`,
          environment: process.env.STAGE,
          message_id: created,
          subject: newMessage.subject,
          type: "message",
          login_text: "Login",
          preheader: `You have received a message from ${user.first_name} ${user.last_name}`
        }
      });
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully created new message.",
          "payload": message
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not create new message."
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