const { database } = require("../postgres");
const { generateCodeDigits } = require("../services/stripe/utilities");

const verifyEmailFormat = (email) => {
  const patt = new RegExp(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g);
  return patt.test(email);
};

const removeFalsyFromObject = (obj) => {
  let newObj = {};
  Object.keys(obj).forEach((prop) => {
    if (obj[prop]) newObj[prop] = obj[prop];
  });
  return newObj;
};

const capitalize = (str, lower = false) =>
  ((lower ? str.toLowerCase() : str) || "").replace(/(?:^|\s|["'(/[{])+\S/g, (match) => match.toUpperCase());

const convertArray = (array) => {
  if (array && array.length) array = JSON.stringify(array).replace("[", "{").replace("]", "}");
  else if (array && !array.length) array = "{}";
  return array;
};
    
const getPrefix = (name) => {
  name = capitalize(name);
  if (name.length > 35) name = name.match(/[A-Z]/g).join("").toUpperCase();
  if (name) name = name.replace(/[^a-zA-Z ]/g, "").replace(/ /g, "_").toUpperCase();
  if (name) return name;
  let random_string = generateCodeDigits();
  return `HOPE_${random_string}`;
};

const WEBMAIL_PROVIDER_DOMAINS = [
  /* Global/Major ESP domains */
  "aol.com", "att.net", "comcast.net", "email.com", "facebook.com", "fastmail.fm",
  "gmail.com", "gmx.com", "gmx.net", "googlemail.com", "google.com", "hotmail.com",
  "icloud.com", "iname.com", "inbox.com", "live.com", "mac.com", "mail.com", "me.com",
  "msn.com", "outlook.com", "protonmail.com", "verizon.net", "yandex.com", "yahoo.com",

  /* North American ESP domains */
  "bellsouth.net", "charter.net", "cox.net", "earthlink.net", "juno.com", "shaw.ca",
  "yahoo.ca", "sympatico.ca", "live.ca", "yahoo.com.mx", "live.com.mx", "hotmail.es",
  "hotmail.com.mx", "prodigy.net.mx", "optimum.net", "optonline.net", "centurytel.net",

  /* Asian ESP domains */
  "sina.com", "sina.cn", "qq.com", "naver.com", "hanmail.net", "daum.net",
  "nate.com", "yahoo.co.jp", "yahoo.co.kr", "yahoo.co.id", "yahoo.co.in", "yahoo.in",
  "yahoo.com.sg", "yahoo.com.ph", "163.com", "126.com", "aliyun.com", "foxmail.com",

  /* European ESP domains */
  "yahoo.co.uk", "hotmail.co.uk", "btinternet.com", "virginmedia.com", "blueyonder.co.uk", "freeserve.co.uk",
  "live.co.uk", "ntlworld.com", "o2.co.uk", "orange.net", "sky.com", "talktalk.co.uk",
  "tiscali.co.uk", "virgin.net", "wanadoo.co.uk", "bt.com", "fmail.co.uk", "thexyz.co.uk", "postmaster.co.uk",
  "hotmail.fr", "live.fr", "laposte.net", "yahoo.fr", "wanadoo.fr", "orange.fr",
  "gmx.fr", "sfr.fr", "neuf.fr", "free.fr", "aliceadsl.fr", "voila.fr", "club-internet.fr",
  "gmx.de", "hotmail.de", "live.de", "online.de", "t-online.de" /* T-Mobile */, "web.de", "yahoo.de", "freenet.de", "arcor.de",
  "libero.it", "virgilio.it", "hotmail.it", "aol.it", "tiscali.it", "alice.it",
  "live.it", "yahoo.it", "email.it", "tin.it", "poste.it", "teletu.it",
  "mail.ru", "rambler.ru", "yandex.ru", "ya.ru", "list.ru",
  "hotmail.be", "live.be", "skynet.be", "voo.be", "tvcablenet.be", "telenet.be",
  "hetnet.nl", "home.nl", "live.nl", "planet.nl", "zonnet.nl", "chello.nl",

  /* South American ESP domains */
  "hotmail.com.ar", "live.com.ar", "yahoo.com.ar", "fibertel.com.ar", "speedy.com.ar", "arnet.com.ar",
  "yahoo.com.br", "hotmail.com.br", "outlook.com.br", "uol.com.br", "bol.com.br",
  "terra.com.br", "ig.com.br", "itelefonica.com.br", "r7.com", "zipmail.com.br",
  "globo.com", "globomail.com", "oi.com.br",

  /* Australian ESP domains */
  "yahoo.com.au", "live.com.au", "optusnet.com.au", "aapt.net.au", "adam.com.au", "bigpond.com.au",
  "bigpond.net.au", "dodo.com.au", "exemail.com.au", "fastmail.com.au", "iinet.net.au",

  /* Other International domains */
  "yahoo.es", "frontiernet.net", "bluewin.ch", "windstream.net",

  /* Minor ESPs/Long tail */
  "123mail.org", "2-mail.com", "4email.net", "50mail.com", "9mail.org", "airpost.net",
  "allmail.net", "anonymous.to", "asia.com", "berlin.com", "bestmail.us", "bigpond.com",
  "comic.com", "consultant.com", "contractor.net", "doglover.com", "doramail.com",
  "dr.com", "dublin.com", "dutchmail.com", "elitemail.org", "elvisfan.com", "emailaccount.com",
  "emailcorner.net", "emailengine.net", "emailengine.org", "emailgroups.net", "emailplus.org",
  "emailsrvr.org", "emailuser.net", "eml.cc", "everymail.net", "everyone.net", "excite.com",
  "execs.com", "f-m.fm", "fast-email.com", "fast-mail.org", "fastem.com", "fastemail.us",
  "fastemailer.com", "fastest.cc", "fastimap.com", "fastmail.cn", "fastmail.co.uk",
  "fastmail.es", "fastmail.im", "fastmail.in", "fastmail.jp", "fastmail.mx", "fastmail.net",
  "fastmail.nl", "fastmail.se", "fastmail.to", "fastmail.tw", "fastmail.us", "fastmailbox.net",
  "fastmessaging.com", "fastservice.com", "fea.st", "financier.com", "fireman.net",
  "flashmail.com", "fmailbox.com", "fmgirl.com", "fmguy.com", "ftml.net", "galaxyhit.com",
  "hailmail.net", "hush.com", "hushmail.com", "icqmail.com", "imap-mail.com", "imap.cc", "imapmail.org", "innocent.com",
  "inorbit.com", "inoutbox.com", "internet-e-mail.com", "internet-mail.org", "lavabit.com", "lycos.com",
  "mybox.xyz", "netzero.net", "pobox.com", "reddif.com", "rediffmail.com", "runbox.com", "sbcglobal.net", "sync.xyz",
  "thexyz.ca", "thexyz.com", "thexyz.eu", "thexyz.in", "thexyz.mobi", "thexyz.net",
  "vfemail.net", "webmail.wiki", "xyz.am", "yopmail.com", "z9mail.com", "zilladog.com",
  "zooglemail.com", "telus.net", "zoho.com", "rocketmail.com" /* Yahoo */, "safe-mail.net", "games.com" /* AOL */,
  "love.com" /* AOL */, "wow.com" /* AOL */, "ygm.com" /* AOL */, "ymail.com" /* Yahoo */, "aim.com" /* AOL */,
];

const buildHubspotContactUpdateData = (object_data, partner, source = "legacy") => {
  const hubspot_fields = ["firstname", "lastname", "email", "phone", "address", "address2", "city", "state", "zip", "gender", "birthday", "pronouns"];
  const data = Object.keys(object_data).map((key) => {
    let hubspot_key = key.replace(/_/g, "");
    if (hubspot_key === "homephone") hubspot_key = "phone";
    if (hubspot_fields.includes(hubspot_key)) return { property: hubspot_key, value: object_data[key] };
    return false;
  }).filter((e) => e);
  let additional_data = [
    { "property": "environment", "value": (process.env.STAGE || "development") },
    { "property": "tag", "value": partner ? "B2B" : "B2C" },
    { "property": "hubspot_owner_id", "value": "111461965" },
  ];
  if (source) additional_data.push({ "property": "form_lead_source", "value": source });
  return [
    ...data,
    ...additional_data
  ].filter((e) => e.value );
};

const getAccounts = async (cognito_id, account_id) => {
  const accounts = await database.query(`SELECT DISTINCT ON (a.account_id)
      a.*,
      am.id,
      am.permissions,
      am.status,
      am.type,
      am.linked_account,
      am.emergency,
      am.primary_contact,
      am.secondary_contact,
      am.inherit,
      am.approved,
      COALESCE(pp.name, up.name) as plan_name,
      CASE
        WHEN a.cognito_id = $1 THEN true
        ELSE false
      END AS is_primary,
      CASE
        WHEN a.account_id = $1 THEN true
        ELSE false
      END AS is_core,
      CASE
        WHEN a.account_id = $2 THEN true
        ELSE false
      END AS is_current,
      u.first_name,
      u.last_name,
      concat(u.first_name, ' ', u.last_name) as name,
      am.referral_code,
      (SELECT
        row_to_json(_)
        FROM (SELECT * from user_plans where price_id = a.plan_id LIMIT 1) as _)
        as user_plan,
      (SELECT
        row_to_json(_)
        FROM (SELECT * from partner_plans where price_id = a.plan_id AND type = p.partner_type AND name = p.plan_type LIMIT 1) as _)
        as partner_plan,
      (SELECT
        row_to_json(_)
        FROM (SELECT * from account_features where account_id = a.account_id LIMIT 1) as _)
        as features,
      (SELECT
        row_to_json(_)
        FROM (SELECT * from subscriptions where subscription_id = a.subscription_id AND status = 'active' LIMIT 1) as _)
        as subscription,
      (SELECT
        row_to_json(_)
        FROM (SELECT bcc.*, g.name, bc.logo from benefits_client_config bcc JOIN groups g on g.id = bcc.group_id JOIN benefits_config bc on bc.id = g.config_id where bcc.account_id IS NOT NULL AND bcc.account_id = a.account_id AND bcc.status = 'active' LIMIT 1) as _)
        as benefits_config,
      COALESCE((SELECT array_agg(aum.cognito_id) from account_memberships aum where aum.account_id = a.account_id AND aum.status = 'active'), '{}') as users
      FROM account_memberships am
      JOIN accounts a ON a.account_id = am.account_id AND a.status = 'active'
      LEFT JOIN user_plans up ON up.price_id = a.plan_id AND up.status = 'active'
      LEFT JOIN partners p ON p.cognito_id = a.account_id AND p.status = 'active' AND p.version = (SELECT MAX (version) FROM partners WHERE cognito_id = a.account_id AND status = 'active')
      LEFT JOIN partner_plans pp ON pp.price_id = a.plan_id AND pp.status = 'active' AND pp.type = p.partner_type
      JOIN users u on u.cognito_id = a.account_id AND u.version = (SELECT MAX (version) FROM users WHERE cognito_id = a.account_id AND status = 'active') AND u.status = 'active'
      JOIN users uu on uu.cognito_id = $1 AND uu.version = (SELECT MAX (version) FROM users WHERE cognito_id = $1 AND status = 'active') AND uu.status = 'active'
      WHERE am.cognito_id = $1 AND am.status = 'active'`, cognito_id, account_id);
      return accounts;
};

const getAccount = async (cognito_id, account_id) => {
  const accounts = await database.query(`SELECT DISTINCT ON (a.account_id)
      a.*,
      am.id,
      am.permissions,
      am.status,
      am.type,
      am.linked_account,
      am.emergency,
      am.primary_contact,
      am.secondary_contact,
      am.inherit,
      am.approved,
      COALESCE(pp.name, up.name) as plan_name,
      CASE
        WHEN a.cognito_id = $1 THEN true
        ELSE false
      END AS is_primary,
      CASE
        WHEN a.account_id = $1 THEN true
        ELSE false
      END AS is_core,
      CASE
        WHEN a.account_id = $2 THEN true
        ELSE false
      END AS is_current,
      u.first_name,
      u.last_name,
      concat(u.first_name, ' ', u.last_name) as name,
      (SELECT amm.referral_code FROM account_memberships amm WHERE amm.account_id = a.account_id AND amm.status = 'active' AND referral_code IS NOT NULL) as referral_code,
      (SELECT
        row_to_json(_)
        FROM (SELECT * from user_plans where price_id = a.plan_id LIMIT 1) as _)
        as user_plan,
      (SELECT
        row_to_json(_)
        FROM (SELECT * from partner_plans where price_id = a.plan_id AND type = p.partner_type AND name = p.plan_type LIMIT 1) as _)
        as partner_plan,
      (SELECT
        row_to_json(_)
        FROM (SELECT * from account_features where account_id = a.account_id LIMIT 1) as _)
        as features,
      (SELECT
        row_to_json(_)
        FROM (SELECT * from subscriptions where subscription_id = a.subscription_id AND status = 'active' LIMIT 1) as _)
        as subscription,
      (SELECT
        row_to_json(_)
        FROM (SELECT bcc.*, g.name, bc.logo from benefits_client_config bcc JOIN groups g on g.id = bcc.group_id JOIN benefits_config bc on bc.id = g.config_id where bcc.account_id IS NOT NULL AND bcc.account_id = a.account_id AND bcc.status = 'active' LIMIT 1) as _)
        as benefits_config,
      COALESCE((SELECT array_agg(aum.cognito_id) from account_memberships aum where aum.account_id = a.account_id AND aum.status = 'active'), '{}') as users
      FROM account_memberships am
      JOIN accounts a ON a.account_id = am.account_id AND a.status = 'active'
      LEFT JOIN user_plans up ON up.price_id = a.plan_id AND up.status = 'active'
      LEFT JOIN partners p ON p.cognito_id = a.account_id AND p.status = 'active' AND p.version = (SELECT MAX (version) FROM partners WHERE cognito_id = a.account_id AND status = 'active')
      LEFT JOIN partner_plans pp ON pp.price_id = a.plan_id AND pp.status = 'active' AND pp.type = p.partner_type
      JOIN users u on u.cognito_id = a.account_id AND u.version = (SELECT MAX (version) FROM users WHERE cognito_id = a.account_id AND status = 'active') AND u.status = 'active'
      JOIN users uu on uu.cognito_id = $1 AND uu.version = (SELECT MAX (version) FROM users WHERE cognito_id = $1 AND status = 'active') AND uu.status = 'active'
      WHERE am.cognito_id = $1 AND am.account_id = $2 AND am.status = 'active'`, cognito_id, account_id);
  return accounts;
};

const getAccountUsers = async (account_id) => {
  const users = await database.query(`SELECT DISTINCT ON (am.cognito_id, am.account_id)
      u.*,
      null as avatar,
      am.referral_code,
      am.permissions,
      am.status,
      COALESCE(am.type, p.partner_type, p.title, p.role) as type,
      am.linked_account,
      am.emergency,
      am.primary_contact,
      am.secondary_contact,
      am.inherit,
      am.onboarded,
      CASE
        WHEN u.customer_id IS NOT NULL AND am.linked_account = false THEN true
        ELSE false
      END AS is_customer,
      concat(u.first_name, ' ', u.last_name) as name,
      (SELECT concat(u.first_name, ' ', u.last_name, ' - ', name) FROM partners WHERE cognito_id = u.cognito_id AND status = 'active') as partner_title,
      (SELECT
        row_to_json(_)
        FROM (SELECT
          p.*,
          pe.logo
          FROM partners p
          LEFT JOIN partners pe ON pe.name = p.name AND pe.status = 'active' AND pe.is_entity = true AND pe.logo IS NOT NULL
          WHERE p.cognito_id = u.cognito_id
          AND p.status = 'active'
          LIMIT 1) as _)
        as partner_data,
      CASE
        WHEN EXISTS(SELECT * FROM partners WHERE cognito_id = u.cognito_id AND status = 'active') THEN true
        ELSE false
      END AS is_partner
      FROM account_memberships am
      JOIN users u ON u.cognito_id = am.cognito_id AND u.version = (SELECT MAX (version) FROM users WHERE cognito_id = am.cognito_id AND status = 'active') AND u.status = 'active'
      LEFT JOIN partners p ON p.cognito_id = u.cognito_id AND p.status = 'active' AND p.version = (SELECT MAX (version) FROM partners WHERE cognito_id = u.cognito_id AND status = 'active')
      WHERE am.account_id = $1 AND am.status = 'active'`, account_id);
      return users;
};

const getAccountUser = async (cognito_id, account_id) => {
  const users = await database.queryOne(`SELECT DISTINCT ON (u.cognito_id)
      u.*,
      null as avatar,
      am.referral_code,
      am.permissions,
      am.status,
      COALESCE(am.type, p.partner_type, p.title, p.role) as type,
      am.linked_account,
      am.emergency,
      am.primary_contact,
      am.secondary_contact,
      am.inherit,
      am.onboarded,
      CASE
        WHEN u.customer_id IS NOT NULL AND am.linked_account = false THEN true
        ELSE false
      END AS is_customer,
      concat(u.first_name, ' ', u.last_name) as name,
      (SELECT concat(u.first_name, ' ', u.last_name, ' - ', name) FROM partners WHERE cognito_id = u.cognito_id AND status = 'active') as partner_title,
      (SELECT
        row_to_json(_)
        FROM (SELECT
          p.*,
          pe.logo
          FROM partners p
          LEFT JOIN partners pe ON pe.name = p.name AND pe.status = 'active' AND pe.is_entity = true AND pe.logo IS NOT NULL
          WHERE p.cognito_id = u.cognito_id
          AND p.status = 'active'
          LIMIT 1) as _)
        as partner_data,
      CASE
        WHEN EXISTS(SELECT * FROM partners WHERE cognito_id = u.cognito_id AND status = 'active') THEN true
        ELSE false
      END AS is_partner
      FROM account_memberships am
      JOIN users u ON u.cognito_id = am.cognito_id AND u.version = (SELECT MAX (version) FROM users WHERE cognito_id = am.cognito_id AND status = 'active') AND u.status = 'active'
      LEFT JOIN partners p ON p.cognito_id = u.cognito_id AND p.status = 'active' AND p.version = (SELECT MAX (version) FROM partners WHERE cognito_id = u.cognito_id AND status = 'active')
      WHERE am.account_id = $1 AND am.cognito_id = $2 AND am.status = 'active'`, account_id, cognito_id);
  return users;
};

module.exports = {
  verifyEmailFormat,
  removeFalsyFromObject,
  getPrefix,
  capitalize,
  convertArray,
  WEBMAIL_PROVIDER_DOMAINS,
  buildHubspotContactUpdateData,
  getAccounts,
  getAccount,
  getAccountUsers,
  getAccountUser
};