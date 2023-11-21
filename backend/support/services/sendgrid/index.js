const SendGrid = require("@sendgrid/mail");
const from = { name: "Hope Trust", email: "info@hopetrust.com" };
const replyTo = { name: "Hope Trust", email: "info@hopetrust.com" };
const config = { baseUrl: "https://api.sendgrid.com/v3" };
const templates = {
  cs_client_welcome: "d-387cb9f84fc248eeb758d02a21d9ce29",
  default_welcome: "d-7ea2fd096c624442805dfd1413d818d6",
  beneficiary_welcome: "d-227518cf4e9f486687794a941caa0c80",
  self_welcome: "d-2c3ac617affb41cf9369f3036d823939",
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
  ticket_assigned: "d-80515836abe943969cd1a9f77d091296",
  account_approval_request: "d-8a71a06a985f4d3e8ea75ece70bcad7b",
  subscription_transferred_user: "d-340113f856d34c8787b9c1075d2e505c",
  subscription_transferred_partner: "d-5835dc202ea04a98af6cdd34fb9f3a81",
  wholesale_connection_request: "d-f335489054bb4ffca061e5196cea04a7",
  wholesale_connection_request_approved: "d-8a9b2700cc4247ee95e7762723002f7f",
  wholesale_connection_request_declined: "d-7a3986729b3a4556941a8a0235e5db02",
  group_connection_request: "d-849718bad94f4641a16cf008e3567981",
  group_connection_request_approved: "d-faec73a70c8a41bc84b9e8ff5f297247",
  group_connection_request_declined: "d-4680c1234f1745aca93f6075738ec905",
  benefits_client_invitation: "d-e9bb26fcf30d44d7a826181453d12227",
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
