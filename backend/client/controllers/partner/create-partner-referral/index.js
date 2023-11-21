const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const createDiscountCode = require("../../../services/stripe/create-discount-code");
const deleteDiscountCode = require("../../../services/stripe/delete-discount-code");
const sendTemplateEmail = require("../../../services/sendgrid/send-template-email");
const { capitalize } = require("../../../utilities/helpers");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id } = event.pathParameters;
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized && cognito.isRequestUser) {
    const user = await database.queryOne("SELECT * from users where cognito_id = $1 AND status = $2", cognito.id, "active");
    const partner = await database.queryOne("SELECT * from partners where cognito_id = $1 AND status = $2", cognito.id, "active");
    const referral = await database.queryOne("SELECT * from referral_configurations where name = $1", partner.name);
    const oldMembership = await database.queryOne("SELECT * from account_memberships where cognito_id = $1 AND account_id = $2 AND status = $3", cognito.id, account_id, "active");
    const oldMembershipUpdated = await database.updateById("account_memberships", oldMembership.id, { "status": "inactive" });
    if (oldMembershipUpdated) {
      let referral_code = false;
      if (referral) {
        let referral_body = {};
        if (referral.percent_off) referral_body.percent_off = referral.percent_off;
        if (referral.amount_off) referral_body.amount_off = (referral.amount_off * 100);
        if (referral.duration) referral_body.duration = referral.duration;
        if (referral.duration_in_months) referral_body.duration_in_months = referral.duration_in_months;
        if (referral.max_redemptions) referral_body.max_redemptions = referral.max_redemptions;
        referral_code = await createDiscountCode(user,
          referral.prefix, referral_body, {
            isReferral: true,
            myto_access: referral.myto_allowed,
            new_accounts: referral.new_accounts
          });
        if ((referral_code && referral_code.valid) && oldMembership.referral_code) await deleteDiscountCode(oldMembership.referral_code);
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
      delete oldMembership.id;
      const created = await database.insert(
        "account_memberships", {
          ...oldMembership,
          "referral_code": referral_code ? referral_code.id : null,
          "version": oldMembership.version + 1
        }
      );
      if (created) {
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
        "message": "Could not update membership."
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
