const Hubspot = require("hubspot");
const hubspot_client = require("@hubspot/api-client");
const hubspotClient = new hubspot_client.Client({ accessToken: process.env.HUBSPOT_ACCESS_TOKEN });
const hubspot = new Hubspot({ accessToken: process.env.HUBSPOT_ACCESS_TOKEN });
module.exports = { hubspot, hubspotClient };