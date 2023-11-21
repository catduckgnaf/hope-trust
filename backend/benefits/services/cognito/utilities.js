const { database } = require("../../postgres");
const { uniqBy } = require("lodash");

const mergeAccount = async (cognito_id) => {
  let userAccounts = [];
  let accountUsers = {};
  let partner;
  const current_user = await database.query("SELECT * from users where cognito_id = $1 AND status = $2", cognito_id, "active");
  const partners = await database.query("SELECT * from partners where cognito_id = $1 AND status = $2", cognito_id, "active");
  if (partners.length) partner = partners[0];

  // get current users account memberships - match where user ID and is active
  let userMemberships = await database.query("SELECT DISTINCT ON (account_id) account_memberships.account_id, account_memberships.permissions, account_memberships.type, account_memberships.linked_account, account_memberships.inherit, account_memberships.primary_contact, account_memberships.secondary_contact, account_memberships.emergency, account_memberships.id, account_memberships.approved, account_memberships.referral_code from account_memberships where cognito_id = $1 AND status = $2", cognito_id, "active");

  // for each membership, get the associated account - match where account ID and is active
  for (let i = 0; i < userMemberships.length; i++) {
    let accounts = await database.query("SELECT DISTINCT ON (account_id) accounts.account_id, accounts.cognito_id, accounts.account_name, accounts.plan_id, accounts.subscription_id, accounts.created_at from accounts where account_id = $1 AND status = $2", userMemberships[i].account_id, "active");

    // for each core account, get all membership user IDs where account ID and is active
    for (let j = 0; j < accounts.length; j++) {
      let partner_plans = [];
      const user_plans = await database.query("SELECT * from user_plans where price_id = $1", accounts[j].plan_id);
      if (partner) partner_plans = await database.query("SELECT * from partner_plans where price_id = $1 AND type = $2 AND name = $3", accounts[j].plan_id, partner.partner_type, partner.plan_type);
      const features = await database.query("SELECT * from account_features where account_id = $1", accounts[j].account_id);
      const subscriptions = await database.query("SELECT * from subscriptions where subscription_id = $1 AND status = 'active'", accounts[j].subscription_id);
      let membershipUserIds = await database.query("SELECT account_memberships.approved, account_memberships.cognito_id, account_memberships.account_id, account_memberships.permissions, account_memberships.status, account_memberships.type, account_memberships.linked_account, account_memberships.inherit, account_memberships.primary_contact, account_memberships.secondary_contact, account_memberships.referral_code, account_memberships.emergency, account_memberships.onboarded from account_memberships where account_id = $1 AND status = $2 ORDER BY created_at DESC", accounts[j].account_id, "active");
      // for each user ID, get the associated user where user ID and is active
      for (let b = 0; b < membershipUserIds.length; b++) {
        let user_partner;
        let entities = [];
        let user = await database.query("SELECT * from users where cognito_id = $1 AND status = $2", membershipUserIds[b].cognito_id, "active");
        let is_partner = await database.query("SELECT partners.name, partners.role, partners.title, partners.states, partners.licenses, partners.custodian, partners.firm_size, partners.department, partners.specialties, partners.affiliations, partners.partner_type, partners.certifications, partners.chsnc_graduate, partners.primary_network, partners.is_investment_manager, partners.broker_dealer_affiliation, partners.is_life_insurance_affiliate from partners where cognito_id = $1 AND status = $2", membershipUserIds[b].cognito_id, "active");
        let referral_account = await database.query("SELECT account_memberships.referral_code from account_memberships where account_id = $1 AND status = $2", membershipUserIds[b].cognito_id, "active");
        if (is_partner.length) {
          user_partner = is_partner[0];
          entities = await database.query("SELECT partners.logo from partners where name = $1 AND is_entity = true AND logo IS NOT null AND status = 'active'", user_partner.name);
        }

        const account_user = {
          ...user[0],
          referral_code: referral_account.length ? referral_account[0].referral_code : null,
          is_partner: !!is_partner[0],
          partner_data: { ...user_partner, logo: entities.length ? entities[0].logo : null},
          partner_title: (is_partner.length && is_partner[0]) ? `${user[0].first_name} ${user[0].last_name} - ${user_partner.name}` : null,
          permissions: membershipUserIds[b].permissions,
          status: membershipUserIds[b].status,
          type: membershipUserIds[b].type,
          approved: membershipUserIds[b].approved,
          linked_account: membershipUserIds[b].linked_account,
          emergency: membershipUserIds[b].emergency,
          primary_contact: membershipUserIds[b].primary_contact,
          secondary_contact: membershipUserIds[b].secondary_contact,
          inherit: membershipUserIds[b].inherit,
          onboarded: membershipUserIds[b].onboarded
        };
        
        // if we found a user and have already came across this user
        if (user && accountUsers[membershipUserIds[b].account_id]) {
          accountUsers[membershipUserIds[b].account_id].push(account_user);
        } else if (user) { // if we found a new user
          accountUsers[membershipUserIds[b].account_id] = [account_user];
        }
      }
      const users = uniqBy(accountUsers[userMemberships[i].account_id], "cognito_id");
      const beneficiary = users.find((u) => u.type === "beneficiary");
      // push the account for output
      userAccounts.push({
        ...accounts[j],
        user_plan: user_plans.length ? user_plans[0] : {},
        partner_plan: partner_plans.length ? partner_plans[0] : {},
        features: features.length ? features[0]: {},
        subscription: subscriptions.length ? subscriptions[0] : {},
        approved: userMemberships[i].approved,
        referral_code: (partner && partner.approved) ? userMemberships[i].referral_code : null,
        id: userMemberships[i].id,
        permissions: userMemberships[i].permissions,
        type: userMemberships[i].type,
        linked_account: userMemberships[i].linked_account,
        primary_contact: userMemberships[i].primary_contact,
        secondary_contact: userMemberships[i].secondary_contact,
        emergency: userMemberships[i].emergency,
        inherit: userMemberships[i].inherit,
        first_name: beneficiary ? beneficiary.first_name : current_user.length ? current_user[0].first_name : null,
        last_name: beneficiary ? beneficiary.last_name : current_user.length ? current_user[0].last_name : null,
        users
      });
    }
  }
  return uniqBy(userAccounts, "account_id");
};

module.exports = {
  mergeAccount
};
