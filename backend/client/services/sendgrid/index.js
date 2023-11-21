const SendGrid = require("@sendgrid/mail");
const from = { name: "Hope Trust", email: "info@hopetrust.com" };
const replyTo = { name: "Hope Trust", email: "info@hopetrust.com" };
const config = { baseUrl: "https://api.sendgrid.com/v3" };
const templates = {
  beneficiary_welcome: "d-227518cf4e9f486687794a941caa0c80",
  partner_welcome: "d-ba55919c0ab7499d9e04dbc8b22841c9",
  customer_support_welcome: "d-3dc8d810bd7445a0940c2be213d63ca8",
  new_user: "d-381dccb945ad4e288db98dffeca1c1cf",
  account_link_request: "d-b3d945ed39814db78a13806977cc58b1",
  link_approved: "d-2e84e42162bf48dd8c21775728b87cb6",
  account_update: "d-af0cce13964a43d89d308fb24a1429f6",
  account_cancel: "d-b93be56608414adcab5693e703de2c8e",
  subscription_started: "d-fe578b80d2024c19ba3f71bb1e946181",
  reset_password: "d-6456968103624840b0eb5c06ac8504ac",
  mfa_off: "d-7578803fc54a4262876b3a265f995606",
  referral_code_issued: "d-777a80635f8e41218f74714fb53c3c1f",
  weekly_onboard_digest: "d-4b4005d755a84fe19201c571fea7f991",
  partner_entity_invitation: "d-6cbd9d107f034f5d86312735e72542c4",
  add_on_service_notification: "d-4a46ac28e4334921943f8bf3f807b1fc",
  client_add_on_service_notification: "d-0fc354e329f14b94aa76d109ae762763",
  membership_removed: "d-a41cddf0cbc54ac8af7cfc646f723714",
  application_message: "d-be6f69da4cfc415b9933b5f61b1c91bf",
  permission_updated: "d-debc3e95e1cd40bc85e80f14aedb5e27",
  response_processed: "d-b56ea288966042e6a7bb22d04fe99763",
  subscription_transferred: "d-5b928047c4064976ae3945d3c7ab33ba",
  domain_approval_required: "d-a8ef860e083e4383afd0632913cfde26",
  subscription_transferred_user: "d-340113f856d34c8787b9c1075d2e505c",
  subscription_transferred_partner: "d-5835dc202ea04a98af6cdd34fb9f3a81",
  new_ticket: "d-92e00e614bcd4a33ba469779c3116d49",
  money_request: "",
  transportation_request: "",
  medical_request: "",
  food_request: "",
  other_request: ""
};
const contact_lists = {
  post_welcome_series_registrations: "a6e5677b-c089-49ee-8074-d2ad24da5ba9",
  post_welcome_series_free: "b9f0ec39-163c-41f6-b4f2-b2fc948cffe8",
  post_welcome_series_plan: "b8ae4415-86d2-4b64-bcfe-8325d622df54",
  post_welcome_series_partner: "75a4aa49-4a06-47ae-b545-db6d042c3acf",
  post_welcome_series_test: "c4129b16-5a84-42cf-a93f-9f859c629909"
};
SendGrid.setApiKey(process.env.SENDGRID_API_KEY);
module.exports = { SendGrid, templates, contact_lists, config, from, replyTo };
