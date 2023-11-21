const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const getPlaidAccessToken = require("../../../services/plaid/get-access-token");
const getPlaidAccounts = require("../../../services/plaid/get-plaid-accounts");
const { compact } = require("lodash");

const account_types = {
  "loan": "Loan",
  "401k": "401k",
  "ira": "IRA",
  "money market": "Money Markets",
  "credit card": "Credit Cards",
  "cd": "CDs",
  "savings": "Savings Account",
  "checking": "Checking Account",
  "student": "Student Loan"
};

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id, cognito_id } = event.pathParameters;
  const { token, metadata } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    if (token) {
      const selected = metadata.accounts.map((account) => account.id);
      const request = await getPlaidAccessToken(token);
      const foundAccounts = await database.query("SELECT * from user_bank_accounts where account_id = $1 AND plaid_item_id = $2", account_id, request.item_id);
      if (foundAccounts.length) await database.update("user_bank_accounts", { status: "inactive" }, { account_id, plaid_item_id: request.item_id });
      const accounts = await getPlaidAccounts(request.access_token);
      if (accounts) {
        await database.insert(
          "user_bank_accounts", {
            cognito_id,
            account_id,
            "plaid_item_id": request.item_id,
            "access_token": request.access_token,
            "status": "active",
            "version": foundAccounts.length ? (Math.max(...foundAccounts.map((o) => o.version)) + 1) : 1
          }
        );
        let grantorRequests = [];
        let beneficiaryRequests = [];
        let filterAccounts = accounts.filter((account) => selected.includes(account.account_id));
        let mergedAccounts = filterAccounts.map((account, index) => {
          return { ...account, ...metadata.accounts[index] };
        });
        const grantorAccounts = mergedAccounts.filter((account) => account.asset_type === "grantor");
        const beneficiaryAccounts = mergedAccounts.filter((account) => account.asset_type === "beneficiary");

        for (let i = 0; i < grantorAccounts.length; i++) {
          const account = grantorAccounts[i];
          const found = await database.query("SELECT * from account_grantor_assets where account_id = $1 AND plaid_account_id = $2", account_id, account.id);
          if (found.length) {
            await database.update("account_grantor_assets", { status: "inactive" }, { account_id, plaid_account_id: account.id });
          }
          const value = account.balances.available || account.balances.current;
          grantorRequests.push(
            database.insert(
              "account_grantor_assets", {
                cognito_id,
                account_id,
                "type": account.asset_type,
                "friendly_name": account.friendly_name || account.name,
                "description": account.official_name,
                "value": value || 0,
                "trust_assets": (((account.assigned_percent || 0) * (value || 0)) / 100),
                "plaid_account_id": account.account_id,
                "plaid_item_id": request.item_id,
                "account_type": account_types[account.subtype],
                "vesting_type": account.vesting_type,
                "institution_name": metadata.institution.name,
                "account_number": account.mask,
                "source": "Plaid",
                "assigned_percent": (account.assigned_percent || 0),
                "inflation": true,
                "status": "active",
                "version": found.length ? (Math.max(...found.map((o) => o.version)) + 1) : 1
              }
            )
          );
        }

        for (let i = 0; i < beneficiaryAccounts.length; i++) {
          const account = beneficiaryAccounts[i];
          const value = account.balances.available || account.balances.current;
          const found = await database.query("SELECT * from account_beneficiary_assets where account_id = $1 AND plaid_account_id = $2", account_id, account.id);
          if (found.length) {
            await database.update("account_beneficiary_assets", { status: "inactive" }, { account_id, plaid_account_id: account.id });
          }
          beneficiaryRequests.push(
            database.insert(
              "account_beneficiary_assets", {
                cognito_id,
                account_id,
                "type": account.asset_type,
                "friendly_name": account.friendly_name || account.name,
                "description": account.official_name,
                "value": value || 0,
                "plaid_account_id": account.account_id,
                "plaid_item_id": request.item_id,
                "account_type": account_types[account.subtype],
                "institution_name": metadata.institution.name,
                "account_number": account.mask,
                "inflation": true,
                "source": "Plaid",
                "status": "active",
                "version": found.length ? (Math.max(...found.map((o) => o.version)) + 1) : 1
              }
            )
          );
        }

        const createdGrantor = await Promise.all(grantorRequests);
        const createdBeneficiary = await Promise.all(beneficiaryRequests);
        const finalAccounts = compact([...createdGrantor, ...createdBeneficiary]);

        if (finalAccounts.length) {
          return {
            statusCode: 200,
            headers: getHeaders(),
            body: JSON.stringify({
              "success": true,
              "message": "Successfully created new accounts.",
              "payload": {
                grantor: createdGrantor,
                beneficiary: createdBeneficiary
              }
            })
          };
        }
        return {
          statusCode: 400,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": false,
            "message": "Could not create accounts."
          })
        };
      }
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not find accounts."
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Token argument is required."
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
