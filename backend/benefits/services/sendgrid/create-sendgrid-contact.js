const fetch = require("node-fetch");
const { config, contact_lists } = require(".");

const createSendgridContact = async (user, list_slug, is_production) => {
  return fetch(`${config.baseUrl}/marketing/contacts`, {
    method: "PUT",
    headers:
    {
      "Content-Type": "application/json",
      "authorization": `Bearer ${process.env.SENDGRID_API_KEY}`
    },
    body: JSON.stringify({
      list_ids: [contact_lists[`post_welcome_series_${is_production ? list_slug : "test"}`]],
      contacts: [
        {
          address_line_1: user.address,
          address_line_2: user.address2,
          city: user.city,
          country: "USA",
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          postal_code: user.zip,
          state_province_region: user.state,
          phone_number: user.home_phone,
          custom_fields: {
            e3_T: user.cognito_id,
            e2_T: list_slug
          }
        }
      ]
    })
  })
  .then((res) => res.json())
  .then((json) => json)
  .catch((error) => console.log(error));
};

module.exports = createSendgridContact;