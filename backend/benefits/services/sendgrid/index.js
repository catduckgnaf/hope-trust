const SendGrid = require("@sendgrid/mail");
const from = { name: "Hope Trust", email: "info@hopetrust.com" };
const config = { baseUrl: "https://api.sendgrid.com/v3" };
const templates = {
  cs_client_welcome: "d-387cb9f84fc248eeb758d02a21d9ce29",
  new_entity_welcome: "d-40d444b5bd6c4f00baeb045705ee7f7b",
  default_welcome: "d-7ea2fd096c624442805dfd1413d818d6",
  new_user: "d-381dccb945ad4e288db98dffeca1c1cf",
  account_link_request: "d-b3d945ed39814db78a13806977cc58b1",
  reset_password: "d-6456968103624840b0eb5c06ac8504ac",
  mfa_off: "d-7578803fc54a4262876b3a265f995606",
  weekly_onboard_digest: "d-4b4005d755a84fe19201c571fea7f991",
  membership_removed: "d-a41cddf0cbc54ac8af7cfc646f723714",
  application_message: "d-be6f69da4cfc415b9933b5f61b1c91bf",
  permission_updated: "d-debc3e95e1cd40bc85e80f14aedb5e27",
  account_user_approved: "d-9f0106f1aef54039856d0189d5e87ab4",
  account_approval_request: "d-8a71a06a985f4d3e8ea75ece70bcad7b",
  new_ticket: "d-92e00e614bcd4a33ba469779c3116d49",
  benefits_client_invitation: "d-e9bb26fcf30d44d7a826181453d12227",
  benefits_entity_invitation: "d-8c9d9f2c49f64278b833c2d5c2ca3ae3",
  wholesale_connection_request: "d-f335489054bb4ffca061e5196cea04a7",
  wholesale_connection_request_approved: "d-8a9b2700cc4247ee95e7762723002f7f",
  wholesale_connection_request_declined: "d-7a3986729b3a4556941a8a0235e5db02",
  group_connection_request: "d-849718bad94f4641a16cf008e3567981",
  group_connection_request_approved: "d-faec73a70c8a41bc84b9e8ff5f297247",
  group_connection_request_declined: "d-4680c1234f1745aca93f6075738ec905",
};
const contact_lists = {
  post_welcome_series_registrations: "a6e5677b-c089-49ee-8074-d2ad24da5ba9",
  post_welcome_series_free: "b9f0ec39-163c-41f6-b4f2-b2fc948cffe8",
  post_welcome_series_plan: "b8ae4415-86d2-4b64-bcfe-8325d622df54",
  post_welcome_series_partner: "75a4aa49-4a06-47ae-b545-db6d042c3acf",
  post_welcome_series_test: "c4129b16-5a84-42cf-a93f-9f859c629909"
};
SendGrid.setApiKey(process.env.SENDGRID_API_KEY);
module.exports = { SendGrid, templates, contact_lists, config, from };
