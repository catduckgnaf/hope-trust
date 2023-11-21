import { getHeaders } from "../../utilities/request";
import { database } from "../../postgres";
import getPlaidAccountBalance from "./get-plaid-account-balance";

export const unhandledWebhook = async (body) => {
  return {
    statusCode: 200,
    headers: getHeaders(),
    body: JSON.stringify({
      "success": true,
      "message": "Unhandled webhook acknowledged."
    })
  };
};

const updateAccountBalances = async (accountRecords, item_id) => {
  if (!accountRecords.length) return false;
  const accounts = await getPlaidAccountBalance(accountRecords[0].access_token);
  if (!accounts) return false;
  const updatedBalances = accounts.map((account) => ({ account_id: account.account_id, value: (account.balances.available || account.balances.current) }));
  let updatedAccounts = [];
  for (let i = 0; i < updatedBalances.length; i++) {
    let record = [];
    const balance = updatedBalances[i];
    const oldGrantorRecord = await database.queryOne("SELECT * from account_grantor_assets where plaid_item_id = $1 AND plaid_account_id = $2 AND status = $3", item_id, balance.account_id, "active");
    const oldBeneficiaryRecord = await database.queryOne("SELECT * from account_beneficiary_assets where plaid_item_id = $1 AND plaid_account_id = $2 AND status = $3", item_id, balance.account_id, "active");
    if (oldGrantorRecord) {
      record = oldGrantorRecord;
    } else if (oldBeneficiaryRecord) {
      record = oldBeneficiaryRecord;
    }

    if (record) {
      if (balance.value !== record.value) {
        if (record.type === "grantor") {
          const recordsUpdated = await database.updateById("account_grantor_assets", record.id, { "status": "inactive" });
          if (recordsUpdated) {
            delete record.id;
            const updated = await database.insert(
              "account_grantor_assets", {
                ...record,
                "value": balance.value,
                "trust_assets": (((record.assigned_percent || 0) * (balance.value || record.grantor_assets || 0)) / 100),
                "status": "active",
                "version": record.version + 1
              }
            );
            if (updated) updatedAccounts.push(updated);
          }
        } else {
          const recordsUpdated = await database.updateById("account_beneficiary_assets", record.id, { "status": "inactive" });
          if (recordsUpdated) {
            delete record.id;
            const updated = await database.insert(
              "account_beneficiary_assets", {
                ...record,
                "value": balance.value,
                "status": "active",
                "version": record.version + 1
              }
            );
            if (updated) updatedAccounts.push(updated);
          }
        }
      }
    }
  }
  if (updatedAccounts.length) return true;
  return false;
};

const itemErrorHandler = async (accountRecords, error) => {
  const { error_code, error_message } = error;
  switch (error_code) {
    case "ITEM_LOGIN_REQUIRED":
      if (accountRecords.length) {
        const recordUpdated = await database.updateById("user_bank_accounts", accountRecords[0].id, { "status": "LOGIN_REQUIRED" });
        if (recordUpdated) return true;
      }
      return false;
    default: unhandledWebhook();
  }
};

export const itemsHandler = async ({ account_id, cognito_id, webhook_code, item_id, consent_expiration_time, error }) => {
  const accountRecords = await database.query("SELECT * from user_bank_accounts where account_id = $1 AND cognito_id = $2 AND plaid_item_id = $3 AND status = 'active'", account_id, cognito_id, item_id);
  switch (webhook_code) {
    case "ERROR":
      const err = await itemErrorHandler(accountRecords, error);
      if (err) return true;
      return false;
    case "PENDING_EXPIRATION":
      if (accountRecords.length) {
        const recordUpdated = await database.updateById("user_bank_accounts", accountRecords[0].id, { "status": `PENDING_EXPIRATION__${consent_expiration_time ? new Date(consent_expiration_time).toISOString() : new Date().toISOString() }` });
        if (recordUpdated) return true;
      }
      return false;
    case "USER_PERMISSION_REVOKED":
      if (accountRecords.length) {
        const recordUpdated = await database.updateById("user_bank_accounts", accountRecords[0].id, { "status": "LOGIN_REQUIRED" });
        if (recordUpdated) return true;
      }
      return false;
    case "WEBHOOK_UPDATE_ACKNOWLEDGED":
    case "NEW_ACCOUNTS_AVAILABLE":
      return false;
    default: unhandledWebhook();
  }
};

export const handleTransactionsWebhook = async ({ account_id, cognito_id, webhook_code, item_id }) => {
  switch (webhook_code) {
    case "DEFAULT_UPDATE":
      const accountRecords = await database.query("SELECT * from user_bank_accounts where account_id = $1 AND cognito_id = $2 AND plaid_item_id = $3 AND status = 'active'", account_id, cognito_id, item_id);
      const updatedBalances = await updateAccountBalances(accountRecords, item_id);
      if (updatedBalances.success) return true;
      return false;
    case "SYNC_UPDATES_AVAILABLE":
    case "RECURRING_TRANSACTIONS_UPDATE":
    case "TRANSACTIONS_REMOVED":
    case "INITIAL_UPDATE":
    case "HISTORICAL_UPDATE":
      return false;
    default: unhandledWebhook();
  }
};