const { database } = require("../../../../postgres");
const { getHeaders, warm } = require("../../../../utilities/request");
const sendTemplateEmail = require("../../../../services/sendgrid/send-template-email");
const createDiscountCode = require("../../../../services/stripe/create-discount-code");
const deleteDiscountCode = require("../../../../services/stripe/delete-discount-code");
const moment = require("moment");
const { capitalize } = require("../../../../utilities/helpers");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { link, result } = JSON.parse(event.body);
  const { link_id, link_url_id } = link; // link_url_id is our constant
  const { link_result_id, email, percentage, percentage_passmark, passed, certificate_url, certificate_serial, view_results_url, cm_user_id } = result;
  const user_id = cm_user_id.split("__");
  const cognito_id = user_id[0];
  const account_id = user_id[1];
  const course = await database.queryOne("SELECT * from ce_courses where quiz_id = $1 AND status = 'active'", link_url_id);
  if (course) {
    const user = await database.queryOne(`SELECT
      ce.credits_value,
      ce.course_name,
      ce.course_product,
      u.*
      from users u
      LEFT JOIN ce_configurations ce ON ce.state = u.state AND ce.status = 'active'
      where u.cognito_id = $1
      AND u.status = 'active'`, cognito_id);
    let body = `${capitalize(user.first_name)} ${capitalize(user.last_name)} has ${(passed ? "passed" : "failed")} a course${course.requires_confirmation ? `, ${user.course_name} - ${course.title}, ` : `, ${course.title}, `}with a score of ${percentage}%.\r\r${(passed && course.requires_confirmation) ? `${user.first_name} will receive ${user.credits_value} credits for ${user.course_product}. ` : ""}You can view their individual results here ${view_results_url}.${passed ? `\r\rYou can view their Classmarker certificate here ${certificate_url}.` : ""}`;
    if (cognito_id && (course && course.requires_confirmation) && passed) {
      const partner = await database.queryOne("SELECT * from partners where cognito_id = $1 AND status = $2", cognito_id, "active");
      const referral = await database.queryOne("SELECT * from referral_configurations where name = $1", partner.name);
      await database.updateById("partners", partner.id, { "approved": true, "domain_approved": true });
      const oldMembership = await database.queryOne("SELECT * from account_memberships where cognito_id = $1 AND account_id = $2 AND status = $3", cognito_id, account_id, "active");
      if (referral && !oldMembership.referral_code) {
        const oldMembershipUpdated = await database.updateById("account_memberships", oldMembership.id, { "status": "inactive" });
        if (oldMembershipUpdated) {
          let referral_body = {};
          if (referral.percent_off) referral_body.percent_off = referral.percent_off;
          if (referral.amount_off) referral_body.amount_off = (referral.amount_off * 100);
          if (referral.duration) referral_body.duration = referral.duration;
          if (referral.duration_in_months) referral_body.duration_in_months = referral.duration_in_months;
          if (referral.max_redemptions) referral_body.max_redemptions = referral.max_redemptions;
          const referral_code = await createDiscountCode(user,
            referral.prefix, referral_body, {
            isReferral: true,
            myto_access: referral.myto_allowed,
            new_accounts: referral.new_accounts
          });
          if ((referral_code && referral_code.valid) && oldMembership.referral_code) await deleteDiscountCode(oldMembership.referral_code);
          delete oldMembership.id;
          const created_membership = await database.insert(
            "account_memberships", {
            ...oldMembership,
            "referral_code": referral_code ? referral_code.id : null,
            "version": oldMembership.version + 1
          }
          );
          if (created_membership) {
            body += `\r\r${capitalize(user.first_name)}'s referral code (${referral_code.id}) has been dispatched, they may now create client accounts.\r\rPlease reach out to ${capitalize(user.first_name)} if required at ${email}.`;
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
        }
      }
    }
    const oldResponse = await database.queryOne("SELECT * from quiz_responses where account_id = $1 AND cognito_id = $2 AND quiz_id = $3 AND status = $4", account_id, cognito_id, link_url_id, "active");
    if (oldResponse) {
      const oldResponseUpdated = await database.updateById("quiz_responses", oldResponse.id, { status: "inactive" });
      if (oldResponseUpdated) {
        delete oldResponse.id;
        const created = await database.insert(
          "quiz_responses", {
            ...oldResponse,
            link_id,
            access_time: new Date(),
            percentage,
            percentage_passmark,
            email,
            passed,
            link_result_id,
            certificate_url,
            certificate_serial,
            view_results_url,
            status: "active"
          }
        );
        if (created) {
          await database.insert("service_requests", {
            cognito_id,
            account_id,
            request_type: "course",
            title: `Course ${(passed ? "Passed" : "Failed")}`,
            tags: ["course", (passed ? "passed" : "failed"), "partner", user.course_name, user.course_product],
            status: "new",
            priority: "normal",
            body
          });
          const system = await database.queryOne("SELECT u.first_name, u.last_name, u.email from system_settings ss JOIN users u on u.cognito_id = ss.customer_support where ss.id = 'system_settings' AND u.status = 'active'");
          await sendTemplateEmail(system.email, {
            first_name: system.first_name,
            last_name: system.last_name,
            template_type: "new_ticket",
            merge_fields: {
              submitted: moment().format("MM/DD/YYYY [at] hh:mm A"),
              first_name: system.first_name,
              creator_first: capitalize(user.first_name),
              creator_last: capitalize(user.last_name),
              account_first: capitalize(user.first_name),
              account_last: capitalize(user.last_name),
              request_type: "Course",
              type: "course",
              title: "Course",
              body,
              subject: "New Course Ticket",
              preheader: `A new course ticket has been submitted by ${user.first_name} ${user.last_name}. Please review.`
            }
          });
          return {
            statusCode: 200,
            headers: getHeaders(),
            body: JSON.stringify({
              "success": true,
              "message": "Successfully created new quiz response."
            })
          };
        }
        return {
          statusCode: 400,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": false,
            "message": "Could not create new quiz response."
          })
        };
      }
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not update quiz response record."
        })
      };
    }
    const created = await database.insert(
      "quiz_responses", {
        cognito_id,
        account_id,
        quiz_id: link_url_id,
        link_id,
        access_time: new Date(),
        percentage,
        percentage_passmark,
        email,
        passed,
        link_result_id,
        certificate_url,
        certificate_serial,
        view_results_url,
        status: "active"
      }
    );
    if (created) {
      await database.insert("service_requests", {
        cognito_id,
        account_id,
        request_type: "course",
        title: `Course ${(passed ? "Passed" : "Failed")}`,
        tags: ["course", (passed ? "passed" : "failed"), "partner", user.course_name, user.course_product],
        status: "new",
        priority: "normal",
        body
      });
      const system = await database.queryOne("SELECT u.first_name, u.last_name, u.email from system_settings ss JOIN users u on u.cognito_id = ss.customer_support where ss.id = 'system_settings' AND u.status = 'active'");
      await sendTemplateEmail(system.email, {
        first_name: system.first_name,
        last_name: system.last_name,
        template_type: "new_ticket",
        merge_fields: {
          submitted: moment().format("MM/DD/YYYY [at] hh:mm A"),
          first_name: system.first_name,
          creator_first: capitalize(user.first_name),
          creator_last: capitalize(user.last_name),
          account_first: capitalize(user.first_name),
          account_last: capitalize(user.last_name),
          request_type: "Course",
          type: "course",
          title: "Course",
          body,
          subject: "New Course Ticket",
          preheader: `A new course ticket has been submitted by ${user.first_name} ${user.last_name}. Please review.`
        }
      });
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully created new quiz response."
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not create new quiz response."
      })
    };
  }
  return {
    statusCode: 400,
    headers: getHeaders(),
    body: JSON.stringify({
      "success": false,
      "message": "This course is not valid."
    })
  };
};
