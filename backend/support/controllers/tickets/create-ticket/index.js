const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const sendTemplateEmail = require("../../../services/sendgrid/send-template-email");
const { uniq, difference } = require("lodash");
const createDiscountCode = require("../../../services/stripe/create-discount-code");
const { getPrefix, capitalize, WEBMAIL_PROVIDER_DOMAINS } = require("../../../utilities/helpers");
const moment = require("moment");
const { default_user_features } = require("../../../permissions/helpers");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id, cognito_id } = event.pathParameters;
  let { ticket } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    let message;
    if (!ticket.assignee) ticket.assignee = cognito_id;
    if (ticket.domain_approved && ["domain_approved", "domain_cleared"].includes(ticket.domain_approved)) ticket.domain_approved = true;
    else ticket.domain_approved = false;
    const created = await database.insert("service_requests", ticket);
    if (created) {
      const record = await database.queryOne(`SELECT DISTINCT on (sr.id)
      sr.*,
      u.first_name as creator_first,
      u.last_name as creator_last,
      NULLIF(TRIM(concat(u.first_name, ' ', u.last_name)), '') as creator_name,
      uu.first_name as account_first,
      uu.last_name as account_last,
      uu.email,
      NULLIF(TRIM(concat(uu.first_name, ' ', uu.last_name)), '') as account_name,
      uuu.first_name as assignee_first,
      uuu.last_name as assignee_last,
      uuu.email as assignee_email,
      NULLIF(TRIM(concat(uuu.first_name, ' ', uuu.last_name)), '') as assignee_name,
      up.price_id as user_price_id,
      up.name as user_plan_name,
      upp.price_id as partner_price_id,
      upp.name as partner_plan_name
      from service_requests sr
      JOIN users u on u.cognito_id = sr.cognito_id
      JOIN users uu on uu.cognito_id = sr.account_id
      LEFT JOIN users uuu on uuu.cognito_id = sr.assignee
      JOIN accounts a on a.account_id = uu.cognito_id
      LEFT JOIN partner_plans upp on upp.price_id = a.plan_id
      LEFT JOIN user_plans up on up.price_id = a.plan_id
      where u.status = 'active'
      AND uu.status = 'active'
      AND a.status = 'active' AND sr.id = $1`, created.id);
      if (record) {
        if (record.request_type === "permission") {
          if (ticket.permission_status === "approved") {
            let granted_permissions = [record.permission];
            let permission_category = record.permission.split("-");
            let action = permission_category[permission_category.length - 1];
            if (action === "edit") granted_permissions.push(`${permission_category.filter((e) => e !== "edit").join("-")}-view`);
            const currentMembership = await database.queryOne("SELECT * from account_memberships where account_id = $1 AND cognito_id = $2 AND status = 'active'", record.account_id, record.cognito_id);
            if (currentMembership) {
              let diff = difference([...granted_permissions], currentMembership.permissions);
              const new_permissions = diff.concat(currentMembership.permissions);
              await database.update("account_memberships", { permissions: uniq(new_permissions) }, { id: currentMembership.id });
            }
          }
          await sendTemplateEmail(record.email, {
            first_name: capitalize(record.creator_first),
            last_name: capitalize(record.creator_last),
            template_type: "permission_updated",
            merge_fields: {
              first_name: capitalize(record.creator_first),
              permission: capitalize(record.permission.replace(/-/g, " ")),
              status: record.permission_status,
              declined: record.permission_status === "declined",
              reason: record.permission_status === "declined" ? record.decline_reason : "Reason for decline not provided.",
              login_url: `https://${process.env.STAGE === "production" ? "app" : process.env.STAGE}.hopecareplan.com/login`,
              subject: `Permission ${capitalize(record.permission_status)}`,
              preheader: `Your requested permission has been ${record.permission_status}`
            }
          });
        }
        if (record.request_type === "domain_approval") {
          const current_partner = await database.queryOne("SELECT * from partners where cognito_id = $1 AND status = 'active'", record.cognito_id);
          const partner_membership = await database.queryOne("SELECT * from account_memberships where cognito_id = $1 AND account_id = $1 AND status = 'active'", record.cognito_id);
          if (partner_membership && !partner_membership.referral_code) {
            const user = await database.queryOne("SELECT * from users where cognito_id = $1 AND status = 'active'", record.cognito_id);
            if (current_partner) await database.updateById("partners", current_partner.id, { "domain_approved": record.domain_approved });
            let referral_code = null;
            const referral_record = await database.queryOne("SELECT * from referral_configurations where name = $1", current_partner.name);
            if (!referral_record && record.domain_approved) {
              await database.insert(
                "referral_configurations", {
                  cognito_id,
                  "name": current_partner.name,
                  "prefix": getPrefix(current_partner.name),
                  "domains": (record.domain_approved && !WEBMAIL_PROVIDER_DOMAINS.includes(record.domain)) ? [record.domain] : [],
                  "percent_off": 20,
                  "duration": "once",
                  "new_accounts": true,
                  "myto_allowed": ["ria", "accountant", "bank_trust", "insurance", "law"].includes(current_partner.partner_type),
                  "type": current_partner.partner_type,
                  "features": Object.keys(default_user_features).filter((key) => default_user_features[key]),
                  "status": (record.domain_approved && !WEBMAIL_PROVIDER_DOMAINS.includes(record.domain)) ? "active" : "inactive"
                }
              );
            } else if (referral_record && record.domain_approved && !WEBMAIL_PROVIDER_DOMAINS.includes(record.domain)) {
              let current_domains = referral_record.domains;
              if (!current_domains.includes(record.domain)) await database.updateById("referral_configurations", referral_record.id, { "domains": JSON.stringify([...current_domains, record.domain]).replace("[", "{").replace("]", "}") });
            }
            if (current_partner.approved) {
              const referral_configuration = await database.queryOne("SELECT * from referral_configurations where name = $1", current_partner.name);
              if (referral_configuration && current_partner.contract_signed && record.domain_approved) {
                let referral_body = {};
                let additional_metadata = {};
                if (referral_configuration.percent_off) referral_body.percent_off = referral_configuration.percent_off;
                if (referral_configuration.amount_off) referral_body.amount_off = (referral_configuration.amount_off * 100);
                if (referral_configuration.duration) referral_body.duration = referral_configuration.duration;
                if (referral_configuration.duration_in_months) referral_body.duration_in_months = referral_configuration.duration_in_months;
                if (referral_configuration.max_redemptions) referral_body.max_redemptions = referral_configuration.max_redemptions;
                referral_code = await createDiscountCode(user,
                  referral_configuration.prefix, referral_body, {
                    isReferral: true,
                    myto_access: referral_configuration.myto_allowed,
                    new_accounts: referral_configuration.new_accounts,
                    ...additional_metadata
                  });
                await database.updateById("account_memberships", partner_membership.id, { "referral_code": referral_code ? referral_code.id : null });
                await sendTemplateEmail(user.email, {
                  first_name: capitalize(user.first_name),
                  last_name: capitalize(user.last_name),
                  template_type: "referral_code_issued",
                  merge_fields: {
                    first_name: capitalize(user.first_name),
                    login_url: `https://${process.env.STAGE === "production" ? "app" : process.env.STAGE}.hopecareplan.com/login`,
                    referral_code: referral_code ? referral_code.id : null,
                    subject: "Your referral code was issued",
                    preheader: `${capitalize(user.first_name)} we successfully issued your referral code`
                  }
                });
              }
              message = "Successfully updated partner record";
            } else {
              message = "Partner has not been approved.";
            }
          } else {
            message = "Partner already has a referral code.";
          }
        }
        if (record.assignee) {
          const request_type = record.request_type === "other_request_type" ? "other" : record.request_type.replace(/_/g, " ");
          await sendTemplateEmail(record.assignee_email, {
            first_name: record.assignee_first,
            last_name: record.assignee_last,
            template_type: "ticket_assigned",
            merge_fields: {
              submitted: moment().format("MM/DD/YYYY [at] hh:mm A"),
              first_name: record.assignee_first,
              creator_first: record.creator_first,
              creator_last: record.creator_last,
              account_first: record.account_first,
              account_last: record.account_last,
              request_type: capitalize(request_type),
              type: request_type,
              title: record.title,
              body: record.body,
              subject: `A ${capitalize(request_type)} ticket was assigned to you.`,
              preheader: `A new ${request_type} ticket has been submitted by ${record.creator_first} ${record.creator_last} and assigned to you. Please review.`
            }
          });
        }
        return {
          statusCode: 200,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": true,
            "message": message || "Successfully created new service request.",
            "payload": record
          })
        };
      }
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not fetch created record."
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
