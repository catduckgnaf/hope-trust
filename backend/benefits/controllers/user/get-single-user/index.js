const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const cognito = await getCognitoUser(event);
  if (cognito.isRequestUser) {
    let benefits_data = [];
    let benefits_type = "";
    const users = await database.query("SELECT * from users where cognito_id = $1 AND version = (SELECT MAX (version) FROM users where cognito_id = $1)", cognito.id);
    const member_of = await database.query("SELECT * from account_memberships where cognito_id = $1 AND type = ANY($2) AND status = 'active'", cognito.id, ["wholesale", "retail", "group", "team", "agent"]);
    const pending_accounts = await database.query("SELECT status from account_memberships where account_id = $1 AND cognito_id = $1 AND status = 'pending'", cognito.id);
    let id = cognito.id;
    if (member_of.length) id = member_of[0].account_id;
    benefits_data = await database.query(`SELECT
    w.*,
    bc.*,
    w.id as id,
    u.first_name,
    u.last_name,
    u.email
    from wholesalers w
    JOIN users u on u.cognito_id = w.cognito_id
    JOIN benefits_config bc on bc.cognito_id = w.cognito_id
    where w.cognito_id = $1
    AND u.status = 'active' AND u.version = (SELECT MAX (version) FROM users uu where uu.cognito_id = w.cognito_id)
    AND (w.status = 'active' OR w.status = 'pending')`, id);
    if (benefits_data.length) benefits_type = "wholesale";
    if (!benefits_data.length) {
      benefits_data = await database.query(`SELECT
      r.*,
      bc.*,
      r.id as id,
      u.first_name,
      u.last_name,
      u.email
      from retailers r
      JOIN users u on u.cognito_id = r.cognito_id
      JOIN benefits_config bc on bc.cognito_id = r.cognito_id
      where r.cognito_id = $1
      AND u.status = 'active' AND u.version = (SELECT MAX (version) FROM users uu where uu.cognito_id = r.cognito_id)
      AND (r.status = 'active' OR r.status = 'pending')`, id);
      benefits_type = "retail";
    }
    if (!benefits_data.length) {
      benefits_data = await database.query(`SELECT
      a.*,
      concat(u.first_name, ' ', u.last_name) as name,
      bc.*,
      a.id as id,
      u.first_name,
      u.last_name,
      u.email,
      (SELECT string_agg(bcc.account_id, ', ') from benefits_client_config bcc where bcc.owner_id = $1 AND bcc.status = 'active') as accounts,
      (SELECT COUNT(*)::int from benefits_client_config bcc where bcc.owner_id = $1 AND bcc.status = 'active') as count
      from agents a
      JOIN users u on u.cognito_id = a.cognito_id
      JOIN benefits_config bc on bc.cognito_id = a.cognito_id
      where a.cognito_id = $1
      AND u.status = 'active' AND u.version = (SELECT MAX (version) FROM users uu where uu.cognito_id = a.cognito_id)
      AND (a.status = 'active' OR a.status = 'pending')`, id);
      benefits_type = "agent";
    }
    if (!benefits_data.length) {
      benefits_data = await database.query(`SELECT
      g.*,
      bc.*,
      g.id as id,
      u.first_name,
      u.last_name,
      u.email,
      (SELECT string_agg(bcc.account_id, ', ') from benefits_client_config bcc where bcc.owner_id = $1 AND bcc.status = 'active') as accounts,
      (SELECT COUNT(*)::int from benefits_client_config bcc where bcc.owner_id = $1 AND bcc.status = 'active') as count
      from groups g
      JOIN users u on u.cognito_id = g.cognito_id
      JOIN benefits_config bc on bc.cognito_id = g.cognito_id
      where g.cognito_id = $1
      AND u.status = 'active' AND u.version = (SELECT MAX (version) FROM users uu where uu.cognito_id = g.cognito_id)
      AND (g.status = 'active' OR g.status = 'pending')`, id);
      benefits_type = "group";
    }
    if (!benefits_data.length) {
      benefits_data = await database.query(`SELECT
      t.*,
      bc.*,
      t.id as id,
      u.first_name,
      u.last_name,
      u.email,
      (SELECT string_agg(bcc.account_id, ', ') from benefits_client_config bcc where bcc.owner_id = $1 AND bcc.status = 'active') as accounts,
      (SELECT COUNT(*)::int from benefits_client_config bcc where bcc.owner_id = $1 AND bcc.status = 'active') as count
      from teams t
      JOIN users u on u.cognito_id = t.cognito_id
      JOIN benefits_config bc on bc.cognito_id = t.cognito_id
      where t.cognito_id = $1
      AND u.status = 'active' AND u.version = (SELECT MAX (version) FROM users uu where uu.cognito_id = t.cognito_id)
      AND (t.status = 'active' OR t.status = 'pending')`, id);
      benefits_type = "team";
    }
    const primary_account = cognito.accounts.find((account) => account.cognito_id === id);
    const core_account = cognito.accounts.find((account) => account.account_id === id);
    if (users.length) {
      let user = users[0];
      if (benefits_data.length && benefits_type) {
        user.benefits_data = { ...benefits_data[0], type: benefits_type };
        user.is_benefits = true;
      } else if (benefits_data.length) {
        user.benefits_data = benefits_data[0];
        user.is_benefits = true;
      } else {
        user.benefits_data = {};
        user.is_benefits = false;
      }
      return {
        statusCode: 200,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": true,
          "message": "Successfully fetched user",
          "payload": { ...user, pending_accounts, accounts: cognito.accounts, verifications: cognito.verifications, primary_account: core_account || primary_account }
        })
      };
    } else {
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not fetch user."
        })
      };
    }
  } else {
    return {
      statusCode: 401,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "You are not authorized to request this user."
      })
    };
  }
};
