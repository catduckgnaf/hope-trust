const { database } = require("../../postgres");
const sendTemplateEmail = require("../../../../services/sendgrid/send-template-email");
const { s3 } = require("../../../../services/s3");
const simpleParser = require("mailparser").simpleParser;
const replyParser = require("node-email-reply-parser");
const { capitalize } = require("../../../../utilities/helpers");
const asterisk_lines = /(^\*{1,}[^*]*\*?$|^[^*]*\*$)/gm;
const empty_lines = /^\s*$/gm;
const link_regex = /(<https?:\/\/(?:www\.)?([-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b)*(\/[\/\d\w\.-]*)*(?:[\?])*(.+)*)?(Virus-free.www.avast.com<#([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})>)?/gi;
const bracket_enclosures = /\[[a-zA-Z0-9]{1,}:.*?\]/ig;
 
exports.handler = async (event) => {
  const record = event.Records[0];

  const request = {
    Bucket: `${process.env.CORE_SERVICE}-${process.env.STAGE}-email-bucket`,
    Key: `${process.env.CORE_SERVICE}-${process.env.STAGE}-emails/${record.ses.mail.messageId}`
  };

  try {
    const data = await s3.getObject(request).promise();
    const email = await simpleParser(data.Body);
    const spam_verdict = email.headers.get("x-ses-spam-verdict");
    const virus_verdict = email.headers.get("x-ses-virus-verdict");
    const system_settings = await database.queryOne("SELECT * from system_settings");
    const signature_identifiers = system_settings.email_signature_identifiers.map((s) => s.term);
    const regex_items = [asterisk_lines, bracket_enclosures, link_regex];

    if (spam_verdict === "PASS" && virus_verdict === "PASS") {
      let attachments = email.attachments || [];
      if (attachments.length) attachments = attachments.filter((a) => a.type === "attachment" && a.contentDisposition === "attachment");
      let final_text_body = "";
      let text_body = email.text;
      text_body = replyParser(text_body, true);
      text_body = text_body.split("\n");
      for (let i = 0; i < text_body.length; i++) {
        let line = text_body[i];
        let next_line = (text_body[i + 1] || "").trim();
        if (!line.trim() && next_line && signature_identifiers.some((s) => s === next_line)) break;
        for (let x = 0; x < regex_items.length; x++) {
          const regex = regex_items[x];
          if (line.length) {
            line = line.replace(regex, "").trim();
            if (next_line) line += "\n";
          }
          else final_text_body += "\n";
        }
        final_text_body += line;
      }
      const record_body = final_text_body.replace(empty_lines, "").trim();
      const email_body = final_text_body.trim().replace(empty_lines, "<br/>");
      const from = email.from.value[0].address;
      const domain = email.from.value[0].address.split("@")[1];
      const to = email.to.value[0].address;
      const subject = email.subject;
      const username = to.split("@")[0];

      const to_user = await database.queryOne("SELECT * from users where username = $1 OR cognito_id = $1 AND version = (SELECT MAX (version) FROM users where username = $1 OR cognito_id = $1)", username);
      if (to_user) {
        let from_user = [];
        let can_upload = false;
        const primary_account = await database.queryOne("SELECT * from accounts where account_id = $1 AND cognito_id = $1 AND status = 'active'", to_user.cognito_id);
        if (!primary_account) {
          from_user = await database.queryOne("SELECT * from users where email = $1 AND version = (SELECT MAX (version) FROM users where email = $1)", from);
        } else {
          let vault_permission = primary_account.vault_permission || [];
          from_user = await database.queryOne(`SELECT DISTINCT on (u.cognito_id, am.account_id)
          u.*,
          am.permissions,
          am.status as member_status
          from users u
          LEFT JOIN account_memberships am on am.account_id = $2 AND am.cognito_id = u.cognito_id AND am.status = 'active'
          where email = $1
          AND u.status = 'active'
          AND u.version = (SELECT MAX (version) FROM users where email = $1 AND status = 'active')`, from, primary_account.account_id);

          if (vault_permission.includes(domain)) can_upload = true;
          if (vault_permission.includes("anyone")) can_upload = true;
          if (from === to_user.email) can_upload = true;
          if (from_user && vault_permission.includes("account-users") && from_user.member_status === "active") can_upload = true;
          if (from_user && vault_permission.includes("account-admin-edit") && from_user.member_status === "active" && from_user.permissions.includes("account-admin-edit")) can_upload = true;
          if (from_user && vault_permission.includes("finance-edit") && from_user.member_status === "active" && from_user.permissions.includes("finance-edit")) can_upload = true;
          if (from_user && vault_permission.includes("health-and-life-edit") && from_user.member_status === "active" && from_user.permissions.includes("health-and-life-edit")) can_upload = true;
        }

        let message = {
          subject,
          from_email: from,
          to_cognito: to_user.cognito_id,
          to_email: to_user.email,
          to_first: to_user.first_name,
          to_last: to_user.last_name,
          body: record_body,
          attachments: [],
          account_id: to_user.cognito_id
        };
        if (from_user) message.cognito_id = from_user.cognito_id;

        if (attachments.length && can_upload) {
          for(let i = 0; i < attachments.length; i++) {
            const attachment = attachments[i];
            await s3.putObject({
              Bucket: `${process.env.STAGE}-uploads-bucket`,
              Key: `${message.account_id}/Uploads/${attachment.filename}`,
              Body: attachment.content
            }).promise().then(async (resp) => {
              await database.insert(
                "documents", {
                  filename: `Uploads/${attachment.filename}`,
                  friendly_name: attachment.filename,
                  size: attachment.size,
                  cognito_id: from_user ? from_user.cognito_id : to_user.cognito_id,
                  account_id: message.account_id,
                  permissions: ["account-admin"],
                  document_type: "Email Upload"
                }
              );
              message.attachments.push(`Uploads/${attachment.filename}`);
            })
            .catch((error) => {
              console.log(error);
              return {
                success: false,
                message: error.message
              };
            });
          }
        }

        const new_message = await database.insert("messages", message);
        if (new_message) {
          await sendTemplateEmail(new_message.to_email, {
            first_name: capitalize(new_message.to_first),
            last_name: capitalize(new_message.to_last),
            from: from_user ? { name: `${from_user.first_name} ${from_user.last_name}` } : null,
            replyTo: from_user ? { name: `${from_user.first_name} ${from_user.last_name}`, email: from_user.username ? `${from_user.username || from_user.cognito_id}@${process.env.STAGE === "production" ? "" : `${process.env.STAGE || "development"}-`}message.hopecareplan.com` : from_user.email } : { email: from },
            template_type: "application_message",
            merge_fields: {
              first_name: capitalize(new_message.to_first),
              sender_first: from_user ? capitalize(from_user.first_name) : null,
              sender_last: from_user ? capitalize(from_user.last_name) : null,
              sender_email: from,
              body: email_body,
              login_url: `https://${process.env.STAGE === "production" ? "app" : process.env.STAGE}.hopecareplan.com/login`,
              environment: process.env.STAGE,
              message_id: new_message.id,
              subject: new_message.subject,
              login_text: "Login",
              type: subject.includes("RE:") ? "reply" : "message",
              preheader: `You have received a new ${subject.includes("RE:") ? "reply" : "message"}${from_user ? ` from ${from_user.first_name} ${from_user.last_name}.` : ` from ${from}.` }`
            }
          });
        }
      }
      return { success: true };
    } else {
      console.log("Mail failed spam or virus check. Discarding.");
      return { success: false };
    }
  } catch (Error) {
    console.log(Error, Error.stack);
    return Error;
  }
};