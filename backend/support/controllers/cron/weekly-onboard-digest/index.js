const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const sendTemplateEmail = require("../../../services/sendgrid/send-template-email");
const moment = require("moment");

const advisor_types = [
  { name: "law", alias: "Law Firm" },
  { name: "bank_trust", alias: "Bank or Trust Company" },
  { name: "insurance", alias: "Insurance" },
  { name: "ria", alias: "Investment Advisor" },
  { name: "healthcare", alias: "Healthcare Provider" },
  { name: "accountant", alias: "Accountant" },
  { name: "advocate", alias: "Community Advocate" },
  { name: "education", alias: "Education" },
  { name: "other", alias: "Other" }
];

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  let final_accounts = {
    partners: [],
    customer_support: []
  };
  const user_plans = await database.query("SELECT * from user_plans where status = 'active'");
  user_plans.forEach((plan_item) => {
    if (!final_accounts[plan_item.name]) final_accounts[plan_item.name] = [];
  });
  const accounts = await database.query("SELECT * from accounts where status = $1 AND created_at > $2 ORDER BY created_at DESC LIMIT $3", "active", moment().subtract(7, "day").format("YYYY-MM-DD"), 100);
  
  for (let i = 0; i < accounts.length; i++) {
    const account = accounts[i];
    const partner = await database.queryOne("SELECT * from partners where cognito_id = $1 AND status = $2", account.cognito_id, "active");
    if (!partner) {
      const plan = user_plans.find((p) => p.price_id === account.plan_id);

      const beneficiary = await database.queryOne("SELECT * from users where cognito_id = $1 AND status = $2", account.account_id, "active");
      const creator = await database.queryOne("SELECT * from users where cognito_id = $1 AND status = $2", account.cognito_id, "active");
      let the_account = {
        name: `${beneficiary.first_name} ${beneficiary.last_name}`,
        created: moment(account.created_at).format("MM/DD/YYYY [at] h:mm A"),
        creator: "Self",
        contact_email: beneficiary.email.includes("hopeportalusers") ? "No email" : beneficiary.email || creator.email,
        contact_number: beneficiary.home_phone ? beneficiary.home_phone : "No phone",
        tier: plan ? plan.name : "N/A"
      };
      if (beneficiary.cognito_id !== creator.cognito_id) {
        the_account.creator = `${creator.first_name} ${creator.last_name}`;
        the_account.contact_email = creator.email;
        the_account.contact_number = creator.home_phone;
      }
      if (plan) final_accounts[plan.name].push(the_account);
    } else {
      const user = await database.queryOne("SELECT * from users where cognito_id = $1 AND status = $2", account.cognito_id, "active");
      if (partner) {
        let the_account = {
          name: `${user.first_name} ${user.last_name}`,
          created: moment(account.created_at).format("MM/DD/YYYY [at] h:mm A"),
          contact_email: user.email,
          contact_number: user.home_phone ? user.home_phone : "No phone",
          organization: partner.name,
          partner_type: advisor_types.find((p) => p.name === partner.partner_type).alias,
          plan_type: partner.plan_type || "N/A",
          contract_signed: partner.contract_signed
        };
        final_accounts["partners"].push(the_account);
      } else {
        let the_account = {
          name: `${user.first_name} ${user.last_name}`,
          created: moment(account.created_at).format("MM/DD/YYYY [at] h:mm A"),
          contact_email: user.email,
          contact_number: user.home_phone ? user.home_phone : "No phone"
        };
        final_accounts["customer_support"].push(the_account);
      }
    }
  }
  const haveOnboarded = [].concat.apply([], Object.values(final_accounts));
  if (haveOnboarded.length) {
    await sendTemplateEmail(process.env.STAGE === "production" ? "WeeklyRegistrationUpdates@hopetrust.com" : "zachary@hopetrust.com", {
      first_name: "HopeTrust",
      last_name: "Staff",
      template_type: "weekly_onboard_digest",
      merge_fields: {
        week_of: moment().subtract(7, "day").format("MM/DD/YYYY"),
        environment: process.env.STAGE,
        final_accounts,
        subject: "Weekly Registration Updates",
        preheader: `The following accounts were created for the week of ${moment().subtract(7, "day").format("MM/DD/YYYY")}`
      }
    });
    return {
      statusCode: 200,
      headers: getHeaders()
    };
  }
  return {
    statusCode: 400,
    headers: getHeaders()
  };
};

