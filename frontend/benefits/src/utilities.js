import { routes } from "./HopeTrustRouter/routing";
import phoneFormatter from "phone-formatter";
import _ from "lodash";
import moment from "moment";

export const compare = (state, payload) => {
  const current = state;
  const newData = payload;
  let isEqual = _.isEqual(newData, current);
  if (Array.isArray(current)) {
    if (!isEqual) { // if anything has changed on the new data
      return newData;
    } else {
      return current;
    }
  } else {
    if (!isEqual) { // if anything has changed on the new data
      return { ...current, ...newData };
    } else {
      return { ...current };
    }
  }
};

export const search = (fields, target, term) => {
  const lowSearch = term.toLowerCase();
  return target.filter(function (item) {
    return fields.some((key) => {
      let string = item[key];
      if (key.includes(".")) {
        let nested_key = key.split(".");
        if (nested_key[0]) string = item[`${nested_key[0]}`][`${nested_key[1]}`];
      }
      return String(string).toLowerCase().includes(lowSearch);
    });
  });
};

export const capitalize = (str, lower = false) =>
  ((lower ? str.toLowerCase() : str) || "").replace(/(?:^|\s|["'(/[{])+\S/g, (match) => match.toUpperCase());

export const isPublicRoute = (path) => {
  const currentRoute = routes.find((route) => route.path === path);
  if (currentRoute) return currentRoute.defaultRoute;
  return false;
};

export const isGlobalRoute = (path) => {
  const currentRoute = routes.find((route) => route.path === path);
  if (currentRoute) return currentRoute.is_global;
  return false;
};

export const formatUSPhoneNumber = (number) => {
  if (number) return phoneFormatter.format(number, "+1NNNNNNNNNN");
  return number;
};

export const formatUSPhoneNumberPretty = (number) => {
  if (number) {
    number = number.replace("+1", "");
    if (number.length === 10) return phoneFormatter.format(number, "(NNN) NNN-NNNN");
    return number;
  }
  return "";
};

export const hasWhiteSpace = (s) => {
  return s.indexOf(" ") >= 0;
};

export const getReadableFileSizeString = (fileSizeInBytes, granular) => {
  let i = -1;
  const byteUnits = ["KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  do {
    fileSizeInBytes = fileSizeInBytes / 1024;
    i++;
  } while (fileSizeInBytes > 1024);
  return Math.max(fileSizeInBytes, 0.1).toFixed(granular ? 2 : 0) + byteUnits[i];
};

export const numbersLettersUnderscoresHyphens = (event) => {
  var regex = new RegExp("^[A-Za-z0-9 .?_-]+$");
  var key = String.fromCharCode(event.charCode ? event.which : event.charCode);
  if (!regex.test(key)) {
    event.preventDefault();
    return false;
  }
};

export const formatCash = (num, fixed) => {
  if (num === null) { return null; } // terminate early
  if (num === 0) { return "0"; } // terminate early
  fixed = (!fixed || fixed < 0) ? 0 : fixed; // number of decimal places to show
  var b = (num).toPrecision(2).split("e"), // get power
    k = b.length === 1 ? 0 : Math.floor(Math.min(b[1].slice(1), 14) / 3), // floor at decimals, ceiling at trillions
    c = k < 1 ? num.toFixed(0 + fixed) : (num / Math.pow(10, k * 3)).toFixed(1 + fixed), // divide by power
    d = c < 0 ? c : Math.abs(c), // enforce -0 is 0
    e = d + ["", "K", "M", "B", "T"][k]; // append power
  return e;
};

export const verifyEmailFormat = (email) => {
  const patt = new RegExp(/[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?/g);
  return patt.test(email);
};

export const verifyPhoneFormat = (phone) => {
  const patt = new RegExp(/(?:\d{1}\s)?\(?(\d{3})\)?-?\s?(\d{3})-?\s?(\d{4})/g);
  return patt.test(phone);
};

export const isValidURL = (url) => {
  const patt = new RegExp(/^((ftp|http|https):\/\/)?(www.)?(?!.*(ftp|http|https|www.))[a-zA-Z0-9_-]+(\.[a-zA-Z]+)+((\/)[\w#]+)*(\/\w+\?[a-zA-Z0-9_]+=\w+(&[a-zA-Z0-9_]+=\w+)*)?$/gm);
  return patt.test(url);
};

export const isValidDomain = (domain) => {
  const patt = new RegExp(/^[a-zA-Z0-9]?[a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/);
  return patt.test(domain);
};

export const search_letters = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z"
];

export const US_STATES = [
  {
    "name": "Alabama",
    "abbreviation": "AL"
  },
  {
    "name": "Alaska",
    "abbreviation": "AK"
  },
  {
    "name": "Arizona",
    "abbreviation": "AZ"
  },
  {
    "name": "Arkansas",
    "abbreviation": "AR"
  },
  {
    "name": "California",
    "abbreviation": "CA"
  },
  {
    "name": "Colorado",
    "abbreviation": "CO"
  },
  {
    "name": "Connecticut",
    "abbreviation": "CT"
  },
  {
    "name": "Delaware",
    "abbreviation": "DE"
  },
  {
    "name": "District Of Columbia",
    "abbreviation": "DC"
  },
  {
    "name": "Florida",
    "abbreviation": "FL"
  },
  {
    "name": "Georgia",
    "abbreviation": "GA"
  },
  {
    "name": "Hawaii",
    "abbreviation": "HI"
  },
  {
    "name": "Idaho",
    "abbreviation": "ID"
  },
  {
    "name": "Illinois",
    "abbreviation": "IL"
  },
  {
    "name": "Indiana",
    "abbreviation": "IN"
  },
  {
    "name": "Iowa",
    "abbreviation": "IA"
  },
  {
    "name": "Kansas",
    "abbreviation": "KS"
  },
  {
    "name": "Kentucky",
    "abbreviation": "KY"
  },
  {
    "name": "Louisiana",
    "abbreviation": "LA"
  },
  {
    "name": "Maine",
    "abbreviation": "ME"
  },
  {
    "name": "Maryland",
    "abbreviation": "MD"
  },
  {
    "name": "Massachusetts",
    "abbreviation": "MA"
  },
  {
    "name": "Michigan",
    "abbreviation": "MI"
  },
  {
    "name": "Minnesota",
    "abbreviation": "MN"
  },
  {
    "name": "Mississippi",
    "abbreviation": "MS"
  },
  {
    "name": "Missouri",
    "abbreviation": "MO"
  },
  {
    "name": "Montana",
    "abbreviation": "MT"
  },
  {
    "name": "Nebraska",
    "abbreviation": "NE"
  },
  {
    "name": "Nevada",
    "abbreviation": "NV"
  },
  {
    "name": "New Hampshire",
    "abbreviation": "NH"
  },
  {
    "name": "New Jersey",
    "abbreviation": "NJ"
  },
  {
    "name": "New Mexico",
    "abbreviation": "NM"
  },
  {
    "name": "New York",
    "abbreviation": "NY"
  },
  {
    "name": "North Carolina",
    "abbreviation": "NC"
  },
  {
    "name": "North Dakota",
    "abbreviation": "ND"
  },
  {
    "name": "Ohio",
    "abbreviation": "OH"
  },
  {
    "name": "Oklahoma",
    "abbreviation": "OK"
  },
  {
    "name": "Oregon",
    "abbreviation": "OR"
  },
  {
    "name": "Pennsylvania",
    "abbreviation": "PA"
  },
  {
    "name": "Puerto Rico",
    "abbreviation": "PR"
  },
  {
    "name": "Rhode Island",
    "abbreviation": "RI"
  },
  {
    "name": "South Carolina",
    "abbreviation": "SC"
  },
  {
    "name": "South Dakota",
    "abbreviation": "SD"
  },
  {
    "name": "Tennessee",
    "abbreviation": "TN"
  },
  {
    "name": "Texas",
    "abbreviation": "TX"
  },
  {
    "name": "Utah",
    "abbreviation": "UT"
  },
  {
    "name": "Vermont",
    "abbreviation": "VT"
  },
  {
    "name": "Virginia",
    "abbreviation": "VA"
  },
  {
    "name": "Washington",
    "abbreviation": "WA"
  },
  {
    "name": "West Virginia",
    "abbreviation": "WV"
  },
  {
    "name": "Wisconsin",
    "abbreviation": "WI"
  },
  {
    "name": "Wyoming",
    "abbreviation": "WY"
  }
];

export const getUserAge = (birthday) => {
  const ageDifMs = Date.now() - new Date(birthday).getTime();
  const ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

export const allowNumbersOnly = (e) => {
  const code = (e.which) ? e.which : e.keyCode;
  if (code > 31 && (code < 48 || code > 57)) e.preventDefault();
};

export const allowNumbersAndDecimalsOnly = (e) => {
  const code = (e.which) ? e.which : e.keyCode;
  if (e.target.value.includes(".") && code === 46) e.preventDefault();
  if ((code !== 46) && (code > 31 && (code < 48 || code > 57))) e.preventDefault();
};

export const limitNumberRange = (e, min, max) => {
  if (e.target.value < min) e.target.value = min;
  if (e.target.value > max) e.target.value = max;
};

export const limitInput = (event, limit) => {
  if (event.target.value.length > limit) event.preventDefault();
};

export const isUserType = (type, store) => {
  const account = store.user.accounts.find((account) => account.account_id === store.session.account_id);
  if (account) return account.type === type;
  return false;
};

export const uniqueID = () => {
  return "_" + Math.random().toString(36).substr(2, 9);
};

export const isSelfAccount = (user, account) => {
  return user.cognito_id === account.account_id;
};

export const generatePassword = (length = 8) => {
  let charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let retVal = "";
  for (var i = 0, n = charset.length; i < length; ++i) retVal += charset.charAt(Math.floor(Math.random() * n));
  return retVal;
};

export const checkForIOS = () => {
  if (navigator.standalone) return false;
  const today = moment(new Date()).format("YYYY-MM-DD");
  const lastPrompt = moment(localStorage.getItem(`installPrompt_${process.env.REACT_APP_STAGE || "local"}`));
  const days = moment(today).diff(lastPrompt, "days");
  const ua = window.navigator.userAgent;
  const webkit = !!ua.match(/WebKit/i);
  const isIPad = !!ua.match(/iPad/i);
  const isIPhone = !!ua.match(/iPhone/i);
  const isIOS = isIPad || isIPhone;
  const isSafari = isIOS && webkit && !ua.match(/CriOS/i);
  const prompt = (isNaN(days) || days > 30) && isIOS && isSafari;
  if (prompt && "localStorage" in window) localStorage.setItem(`installPrompt_${process.env.REACT_APP_STAGE || "local"}`, today);
  return { isIPad, isIPhone, isIOS, isSafari, prompt };
};

export const applyCustomOrder = (arr, desiredOrder, param) => {
  const orderForIndexVals = desiredOrder.slice(0).reverse();
  arr.sort((a, b) => {
    const aIndex = -orderForIndexVals.indexOf(a[param]);
    const bIndex = -orderForIndexVals.indexOf(b[param]);
    return aIndex - bIndex;
  });
  return arr;
};

export const getReadableUserAddress = (user) => {
  let user_address = [];
  if (user.address) user_address.push(user.address);
  if (user.address2) user_address.push(user.address2);
  if (user.city) user_address.push(user.city);
  if (user.state) user_address.push(user.state);
  if (user.zip) user_address.push(user.zip);
  if (user_address.length) return user_address.join(", ");
  return false;
};

export const checkPasswordConditions = (required_length, password, confirm, old_password) => {
  if (password.length < required_length) {
    return { pass: false, message: `Password must be at least ${required_length} characters long` };
  } else if (!password.replace(/[^A-Z]/g, "").length) {
    return { pass: false, message: "Password must contain at least one uppercase letter." };
  } else if (!/\d/.test(password)) {
    return { pass: false, message: "Password must contain at least one number." };
  } else if (password !== confirm) {
    return { pass: false, message: "Passwords do not match" };
  } else if (old_password && (password === old_password)) {
    return { pass: false, message: "New password must be different than your current password." };
  } else {
    return { pass: true, message: "Looks good!" };
  }
};

export const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const buildHubspotContactData = (object_data, stage, status) => {
  let flat = {};
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
    "pronouns",
    "utmsource",
    "utmmedium",
    "utmcontent",
    "utmcampaign", 
    "hsaad",
    "ctaorigin"
  ];
  let merged = Object.assign(flat, ...Object.keys(object_data).map((reg_key) => object_data[reg_key]));
  const data = Object.keys(merged).map((key) => {
    let hubspot_key = key.replace(/_/g, "");
    if (hubspot_key === "homephone") hubspot_key = "phone";
    if (hubspot_fields.includes(hubspot_key)) return { property: hubspot_key, value: merged[key] };
    return false;
  }).filter((e) => e);
  let secondary_data = [
    { "property": "signup_stage", "value": (stage + 2) },
    { "property": "sign_up_status", "value": status },
    { "property": "form_lead_source", "value": "in_app_signup_form_benefits" },
    { "property": "tag", "value": "B2C" },
    { "property": "hubspot_owner_id", "value": "111461965" },
    { "property": "hs_lead_status", "value": (status === "In Progress" ? "IN_PROGRESS" : (status === "Done") ? "CUSTOMER" : "UNQUALIFIED") },
    { "property": "environment", "value": (process.env.REACT_APP_STAGE || "development") }
  ];
  return [
    ...data,
    ...secondary_data
  ];
};

export const buildHubspotDealData = (object_data, user) => {
  let flat = {};
  let merged = Object.assign(flat, ...Object.keys(object_data).map((reg_key) => object_data[reg_key]));
  let associatedVids = [];
  if (merged.user_type === "beneficiary") associatedVids.push(user.hubspot_contact_id);
  else associatedVids.push(user.hubspot_contact_id, merged.hubspot_contact_id);
  return {
    associations: {
      associatedVids
    },
    properties: [
      { "value": merged.user_type === "beneficiary" ? `${user.first_name} ${user.last_name}` : `${merged.first_name} ${merged.last_name}`, "name": "dealname" },
      { "value": "5652981", "name": "dealstage" },
      { "value": 0, "name": "end_stage" },
      { "value": 0, "name": "potential_value" },
      { "value": merged.referral_code || "", "name": "referral_code" },
      { "value": "default", "name": "pipeline" },
      { "value": "111461965", "name": "hubspot_owner_id" },
      { "value": "0", "name": "amount" },
      { "value": "newbusiness", "name": "dealtype" },
      { "value": (process.env.REACT_APP_STAGE || "development"), "name": "environment" }
    ]
  };
};

export const buildHubspotPartnerCreatedDealData = (object_data, benefit_partner = false) => {
  let associatedCompanyIds = [];
  let associatedVids = [object_data.hubspot_contact_id];
  if (benefit_partner) {
    if (benefit_partner.hubspot_company_id) associatedCompanyIds.push(benefit_partner.hubspot_company_id);
    if (benefit_partner.hubspot_contact_id) associatedVids.push(benefit_partner.hubspot_contact_id);
  }
  return {
    associations: {
      associatedVids,
      associatedCompanyIds
    },
    properties: [
      { "value": `${object_data.first_name} ${object_data.last_name}`, "name": "dealname" },
      { "value": "5652981", "name": "dealstage" },
      { "value": 0, "name": "end_stage" },
      { "value": 0, "name": "potential_value" },
      { "value": (object_data.referral_code || ""), "name": "referral_code" },
      { "value": "default", "name": "pipeline" },
      { "value": "111461965", "name": "hubspot_owner_id" },
      { "value": "0", "name": "amount" },
      { "value": "newbusiness", "name": "dealtype" },
      { "value": (process.env.REACT_APP_STAGE || "development"), "name": "environment" }
    ]
  };
};

export const getCardIcon = (type) => {
  switch (type) {
    case "amex":
      return { icon: "cc-amex", icon_type: "fab", color: "#336cae" };
    case "cartes bancaires":
      return { icon: "credit-card", icon_type: "fad", color: "#309469" };
    case "diners":
      return { icon: "cc-diners-club", icon_type: "fab", color: "#2d6aa6" };
    case "discover":
      return { icon: "cc-discover", icon_type: "fab", color: "#E55C20" };
    case "jcb":
      return { icon: "cc-jcb", icon_type: "fab", color: "#F9B101" };
    case "mastercard":
      return { icon: "cc-mastercard", icon_type: "fab", color: "#eb001b" };
    case "visa":
      return { icon: "cc-visa", icon_type: "fab", color: "#172274" };
    case "unionpay":
      return { icon: "credit-card-front", icon_type: "fad", color: "#327982" };
    default:
      return { icon: "credit-card", icon_type: "fad", color: null };
  }
};

export const getUA = () => {
  let device = "Unknown";
  const ua = {
    "Generic Linux": /Linux/i,
    "Android": /Android/i,
    "BlackBerry": /BlackBerry/i,
    "Bluebird": /EF500/i,
    "Chrome OS": /CrOS/i,
    "Datalogic": /DL-AXIS/i,
    "Honeywell": /CT50/i,
    "iPad": /iPad/i,
    "iPhone": /iPhone/i,
    "iPod": /iPod/i,
    "macOS": /Macintosh/i,
    "Windows": /IEMobile|Windows/i,
    "Zebra": /TC70|TC55/i,
  };
  Object.keys(ua).map((v) => navigator.userAgent.match(ua[v]) && (device = v));
  return device;
};

export const WEBMAIL_PROVIDER_DOMAINS = [
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