const permissions = {
    "/hubspot/create-hubspot-contact": {
        description: "Create a Hubspot contact",
        authorized: []
    },
    "/hubspot/update-hubspot-contact/{hubspot_contact_id}": {
        description: "Update a Hubspot contact",
        authorized: []
    },
    "/hubspot/create-hubspot-deal": {
        description: "Create a Hubspot deal",
        authorized: []
    },
    "/hubspot/update-hubspot-deal/{hubspot_deal_id}": {
        description: "Update a Hubspot deal",
        authorized: []
    },
    "/hubspot/get-visitor-token/{account_id}/{cognito_id}": {
        description: "Get a visitor token for a user",
        authorized: [
            "basic-user"
        ]
    }
};

module.exports = permissions;
