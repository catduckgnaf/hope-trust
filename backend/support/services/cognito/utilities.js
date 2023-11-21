const { database } = require("../../postgres");
const { uniqBy } = require("lodash");

const mergeAccount = async (cognito_id) => {
  let userAccounts = [];
  let accountUsers = {};
  const current_user = await database.queryOne("SELECT * from users where cognito_id = $1 AND status = $2", cognito_id, "active");
  const partner = await database.queryOne("SELECT * from partners where cognito_id = $1 AND status = $2", cognito_id, "active");

  // get current users account memberships - match where user ID and is active
  let userMemberships = await database.query("SELECT DISTINCT ON (account_id) account_memberships.account_id, account_memberships.permissions, account_memberships.type, account_memberships.linked_account, account_memberships.inherit, account_memberships.primary_contact, account_memberships.secondary_contact, account_memberships.emergency, account_memberships.id, account_memberships.approved, account_memberships.referral_code from account_memberships where cognito_id = $1 AND status = $2", cognito_id, "active");

  // for each membership, get the associated account - match where account ID and is active
  for (let i = 0; i < userMemberships.length; i++) {
    let accounts = await database.query("SELECT DISTINCT ON (account_id) accounts.account_id, accounts.cognito_id, accounts.account_name, accounts.plan_id, accounts.subscription_id, accounts.created_at from accounts where account_id = $1 AND status = $2", userMemberships[i].account_id, "active");

    // for each core account, get all membership user IDs where account ID and is active
    for (let j = 0; j < accounts.length; j++) {
      let partner_plan;
      const user_plan = await database.queryOne("SELECT * from user_plans where price_id = $1", accounts[j].plan_id);
      if (partner) partner_plan = await database.queryOne("SELECT * from partner_plans where price_id = $1 AND type = $2 AND name = $3", accounts[j].plan_id, partner.partner_type, partner.plan_type);
      const features = await database.queryOne("SELECT * from account_features where account_id = $1", accounts[j].account_id);
      const subscription = await database.queryOne("SELECT * from subscriptions where subscription_id = $1 AND status = 'active'", accounts[j].subscription_id);
      let membershipUserIds = await database.query("SELECT account_memberships.cognito_id, account_memberships.account_id, account_memberships.permissions, account_memberships.status, account_memberships.type, account_memberships.linked_account, account_memberships.inherit, account_memberships.primary_contact, account_memberships.secondary_contact, account_memberships.referral_code, account_memberships.emergency, account_memberships.onboarded from account_memberships where account_id = $1 AND status = $2 ORDER BY created_at DESC", accounts[j].account_id, "active");
      // for each user ID, get the associated user where user ID and is active
      for (let b = 0; b < membershipUserIds.length; b++) {
        let entity;
        let user = await database.queryOne("SELECT * from users where cognito_id = $1 AND status = $2", membershipUserIds[b].cognito_id, "active");
        let is_partner = await database.queryOne("SELECT partners.name, partners.role, partners.title, partners.states, partners.licenses, partners.custodian, partners.firm_size, partners.department, partners.specialties, partners.affiliations, partners.partner_type, partners.certifications, partners.chsnc_graduate, partners.primary_network, partners.is_investment_manager, partners.broker_dealer_affiliation, partners.is_life_insurance_affiliate from partners where cognito_id = $1 AND status = $2", membershipUserIds[b].cognito_id, "active");
        let referral_account = await database.queryOne("SELECT account_memberships.referral_code from account_memberships where account_id = $1 AND status = $2", membershipUserIds[b].cognito_id, "active");
        if (is_partner) entity = await database.queryOne("SELECT partners.logo from partners where name = $1 AND is_entity = true AND logo IS NOT null AND status = 'active'", is_partner.name);

        const account_user = {
          ...user,
          referral_code: referral_account ? referral_account.referral_code : null,
          is_partner: !!is_partner,
          partner_data: { ...is_partner, logo: entity ? entity.logo : null},
          partner_title: is_partner ? `${user.first_name} ${user.last_name} - ${is_partner.name}` : null,
          permissions: membershipUserIds[b].permissions,
          status: membershipUserIds[b].status,
          type: membershipUserIds[b].type,
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
        user_plan: user_plan ? user_plan : {},
        partner_plan: partner_plan ? partner_plan : {},
        features: features ? features : {},
        subscription: subscription ? subscription : {},
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
        first_name: beneficiary ? beneficiary.first_name : current_user.length ? current_user.first_name : null,
        last_name: beneficiary ? beneficiary.last_name : current_user.length ? current_user.last_name : null,
        users
      });
    }
  }
  return uniqBy(userAccounts, "account_id");
};

module.exports = {
  mergeAccount
};
