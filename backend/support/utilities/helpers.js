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

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

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

const buildHubspotContactData = (object_data, partner) => {
  const hubspot_fields = [
    "firstname",
    "lastname",
    "email",
    "phone",
    "address",
    "address2",
    "city",
    "state",
    "zip",
    "gender",
    "birthday",
    "pronouns"
  ];
  const data = Object.keys(object_data).map((key) => {
    let hubspot_key = key.replace(/_/g, "");
    if (hubspot_key === "homephone") hubspot_key = "phone";
    if (hubspot_fields.includes(hubspot_key)) return { property: hubspot_key, value: object_data[key] };
    return false;
  }).filter((e) => e);
  let secondary_data = [
    { "property": "signup_stage", "value": 0 },
    { "property": "sign_up_status", "value": "Done" },
    { "property": "hubspot_owner_id", "value": "111461965" },
    { "property": "hs_lead_status", "value": "CUSTOMER" },
    { "property": "environment", "value": (process.env.STAGE || "development") },
    { "property": "tag", "value": partner ? "B2B" : "B2C" },
    { "property": "form_lead_source", "value": "legacy" }
  ];
  return [
    ...data,
    ...secondary_data
  ].filter((e) => e.value );
};

module.exports = {
  verifyEmailFormat,
  removeFalsyFromObject,
  getPrefix,
  capitalize,
  sleep,
  convertArray,
  WEBMAIL_PROVIDER_DOMAINS,
  buildHubspotContactData,
  buildHubspotContactUpdateData
};