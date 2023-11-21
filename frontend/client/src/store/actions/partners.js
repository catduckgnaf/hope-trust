import { API, Auth } from "aws-amplify";
import { apiGateway } from "../../config";
import LogRocket from "logrocket";
import { store } from "..";
import { navigateTo } from "./navigation";
import { showNotification } from "./notification";
import { dispatchRequest } from "./request";
import { formatUSPhoneNumber } from "../../utilities";
import { exportOrganizationExport } from "./pdf";
import {
  SHOW_LOADER,
  UPDATE_PARTNER_CONVERSION_STATE,
  CLEAR_PARTNER_CONVERSION_STATE,
  SET_SESSION_ACCOUNT,
  IS_REGISTERED,
  OPEN_CONVERT_TO_PARTNER_MODAL,
  CLOSE_CONVERT_TO_PARTNER_MODAL,
  GET_ORGANIZATION_PARTNERS,
  IS_FETCHING_ORGANIZATION_PARTNERS,
  HAS_FETCHED_ORGANIZATION_PARTNERS,
  OPEN_PARTNER_LOGO_MODAL,
  CLOSE_PARTNER_LOGO_MODAL,
  OPEN_CERTIFICATE_MODAL,
  CLOSE_CERTIFICATE_MODAL,
  HIDE_LOADER
} from "./constants";
import { getCurrentUser, getUser, updateUser } from "./user";
import { getCustomerSubscriptions, getCustomerTransactions } from "./account";
import { getStripeExpandedCustomer } from "./stripe";
const Gateway = apiGateway.find((gateway) => gateway.name === "client");

export const createPartner = (data, account_id, cognito_id) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/partners/create/${account_id}/${cognito_id}`, {
    headers: {
      Authorization: store.getState().session.token
    },
    body: data
  })
    .then((newPartner) => {
      return newPartner;
    })
    .catch((error) => {
      return { success: false, message: error.response && error.response.data ? error.response.data.message : "Something went wrong." };
    });
};

export const getOrganizationPartners = (config, override) => async (dispatch) => {
  if ((!store.getState().partners.isFetchingOrgPartners && !store.getState().partners.requestedOrgPartners) || override) {
    dispatch({ type: IS_FETCHING_ORGANIZATION_PARTNERS, payload: true });
    try {
      const data = await API.get(
        Gateway.name,
        `/partners/get-organization-partners/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
        {
          headers: {
            "Authorization": store.getState().session.token
          },
          queryStringParameters: {
            ...config
          }
        });
      if (data.success) {
        dispatch({ type: GET_ORGANIZATION_PARTNERS, payload: data.payload });
        dispatch({ type: IS_FETCHING_ORGANIZATION_PARTNERS, payload: false });
      } else {
        dispatch({ type: GET_ORGANIZATION_PARTNERS, payload: [] });
        dispatch({ type: HAS_FETCHED_ORGANIZATION_PARTNERS, payload: true });
        dispatch({ type: IS_FETCHING_ORGANIZATION_PARTNERS, payload: false });
      }
      return data.success;
    } catch (error) {
      dispatch({ type: GET_ORGANIZATION_PARTNERS, payload: [] });
      dispatch({ type: HAS_FETCHED_ORGANIZATION_PARTNERS, payload: true });
      dispatch({ type: IS_FETCHING_ORGANIZATION_PARTNERS, payload: false });
      return false;
    }
  }
};

export const updatePartner = (updates, cognito_id, token) => async (dispatch) => {
  return API.patch(
    Gateway.name,
    `/partners/update-single-partner/${store.getState().session.account_id}/${cognito_id || store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: token || store.getState().session.token
      },
      body: {
        updates
      }
    }).then((data) => {
      dispatch({ type: IS_REGISTERED, payload: { ...store.getState().user, partner_data: data.payload } });
      return { success: true, data: data.payload };
    }).catch((error) => {
      dispatch(showNotification("error", "Partner could not be updated.", "There was a problem updating your partner account."));
      return {
        success: false,
        error
      };
    });
};

export const createPartnerReferral = () => async (dispatch) => {
  return API.patch(
    Gateway.name,
    `/partners/create-partner-referral/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      }
    }).then((data) => {
      return { success: true, data: data.payload };
    }).catch((error) => {
      dispatch(showNotification("error", "Could not create referral code", "There was a problem creating your new referral code."));
      return {
        success: false,
        error
      };
    });
};

export const generateOrgExport = (organization) => async (dispatch) => {
  dispatch(showNotification("info", "Generating Report", "Please wait while we generate your organization report."));
  return API.post(
    Gateway.name,
    `/partners/organization-digest/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        organization: store.getState().user.is_partner ? store.getState().user.partner_data.name.toLowerCase() : organization.toLowerCase()
      }
    }).then((data) => {
      dispatch(exportOrganizationExport(data.payload, organization.toLowerCase()));
      return data;
    }).catch((error) => {
      dispatch(showNotification("error", "Could not generate organization export", "There was a problem generating your organization export."));
      return { success: false, message: error.response && error.response.data ? error.response.data.message : "Something went wrong." };
    });
};

export const sendEntityInvitation = (organization, first, last, email, partner_type) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/partners/send-entity-invitation/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        organization,
        first,
        last,
        email,
        partner_type,
        sender: store.getState().user
      }
    }).then((data) => {
      if (data.success) {
        dispatch(showNotification("success", "Invitation Sent", `We sent an invitation to ${first} at ${email}. Please wait until ${first} finishes their registration.`));
        return { success: true };
      }
      dispatch(showNotification("error", "Invitation Failed", `We were not able to send the invitation to ${first} at ${email}.`));
      return { success: false };
    }).catch((error) => {
      dispatch(showNotification("error", "Invitation Failed", `We were not able to send the invitation to ${first} at ${email}.`));
      return {
        success: false,
        error
      };
    });
};

export const advisor_types = [
  { name: "law", alias: "Law Firm" },
  { name: "bank_trust", alias: "Bank or Trust Company" },
  { name: "insurance", alias: "Insurance" },
  { name: "ria", alias: "Investment Advisor" },
  { name: "healthcare", alias: "Healthcare Provider" },
  { name: "accountant", alias: "Accountant" },
  { name: "advocate", alias: "Community Advocate" },
  { name: "education", alias: "Education" },
  { name: "other", alias: "Other" }
];

export const convert = (fields) => async (dispatch) => {
  dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Converting..." } });
  dispatch(updateUser({
    "first_name": fields.first_name,
    "last_name": fields.last_name,
    "home_phone": formatUSPhoneNumber(fields.home_phone),
    "email": fields.email
  }, false, false))
  .then(async (updated_user) => {
      const updatedUser = updated_user.payload;
      let core_account = store.getState().accounts.find((a) => a.is_core);
      let partner_core_account = { success: true, payload: core_account };
      if (!core_account) {
        dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Finalizing Account..." } });
        partner_core_account = await API.post(
          Gateway.name,
          `/accounts/create/${updatedUser.cognito_id}`,
          {
            headers: {
              Authorization: store.getState().session.token
            },
            body: {
              "account_name": fields.name,
              "beneficiary_id": updatedUser.cognito_id,
              "cognito_id": updatedUser.cognito_id,
              "account_id": store.getState().session.account_id,
              "status": "active",
              "user_type": "advisor"
            }
          });
      }
      if (partner_core_account.success) {
        LogRocket.track(`New account created. - ${partner_core_account.payload.account_id}`);
        dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Creating Partner..." } });
        dispatch(createPartner({
          newPartner: {
            name: fields.name,
            domain_approved: fields.domain_approved
          },
          partner_type: fields.advisor_type
        }, partner_core_account.payload.account_id, updatedUser.cognito_id))
          .then(async (newPartner) => {
            LogRocket.track(`New partner created. - ${newPartner.payload.id}`);
            dispatch(getUser(newPartner.cognito_id))
            .then(async (storedUser) => {
              dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Switching Accounts..." } });
              const cognito_user = await Auth.currentAuthenticatedUser({ bypassCache: true });
              const created_partner = storedUser.payload.partner_data;
              const partner_type = advisor_types.find((a) => a.name === created_partner.partner_type);
              dispatch({ type: SET_SESSION_ACCOUNT, payload: { account_id: partner_core_account.payload.account_id, token: store.getState().session.token, user: cognito_user, primary_account_id: partner_core_account.payload.account_id } });
              dispatch({ type: IS_REGISTERED, payload: storedUser.payload });
              dispatch(dispatchRequest({
                title: "New Partner Created",
                request_type: "new_partner",
                priority: "urgent",
                domain: storedUser.payload.email.split("@")[1],
                domain_approved: created_partner.domain_approved,
                body: `A new partner, ${storedUser.payload.first_name} ${storedUser.payload.last_name} from ${created_partner.name} has been created and needs review.\n\n${storedUser.payload.first_name} is associated with ${storedUser.payload.partner_data.name}${fields.new_org_created ? ", a new organization" : ""}. Their partner type is ${partner_type.alias}.${created_partner.domain_approved ? ` This partner signed up with an approved domain (${storedUser.payload.email.split("@")[1]}).` : ` This partner's domain (${storedUser.payload.email.split("@")[1]}) was not cleared, please review.`}`,
                tags: [partner_type, "partner"],
                organization: created_partner.name
              })
              );
              dispatch(navigateTo("/accounts"));
            })
            .catch((error) => {
              dispatch(showNotification("error", "User Lookup", error.message));
            });
          })
          .catch((error) => {
            dispatch(showNotification("error", "Partner Creation", error.message));
          });
      } else {
        dispatch(showNotification("error", "Account Creation", partner_core_account.message));
      }
    }).catch((error) => {
      dispatch(showNotification("error", "User update", error.response && error.response.data ? error.response.data.message : "Something went wrong."));
      return { success: false };
    });
};

export const addAccountToSubscription = (client_account_id, subscription_record_id, customer_id, current_plan, new_plan = false) => async (dispatch) => {
  dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Transferring..." } });
  return API.post(
    Gateway.name,
    `/partners/add-account-to-subscription/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        client_account_id,
        subscription_record_id,
        customer_id,
        current_plan,
        new_plan: new_plan ? new_plan : current_plan
      }
    }).then((data) => {
      return dispatch(getCurrentUser())
        .then(() => {
          if (data.success) {
            dispatch(getCustomerSubscriptions(true, customer_id));
            dispatch(getCustomerTransactions(true, customer_id));
            dispatch(getStripeExpandedCustomer(true, customer_id));
            dispatch(navigateTo("/accounts"));
            dispatch(showNotification("success", "Subscription Transferred", `${data.payload.first_name} ${data.payload.last_name}'s subscription was successfully transferred to your account.`));
            dispatch(dispatchRequest({
              title: "Subscription Seat Added",
              request_type: "account_update",
              priority: "normal",
              status: "new",
              body: `${store.getState().user.first_name} ${store.getState().user.last_name} has added a seat to their subscription. ${data.payload.first_name} ${data.payload.last_name}'s subscription was successfully transferred.`
            }));
          }
          dispatch({ type: HIDE_LOADER });
          return data;
        });
    }).catch((error) => {
      dispatch(showNotification("error", "Subscription Transfer Failed", (error.response && error.response.data) ? error.response.data.message : error.message || "Something went wrong."));
      dispatch({ type: HIDE_LOADER });
      return {
        success: false,
        error
      };
    });
};

export const changeStep = (step, state) => async (dispatch) => {
  if (!step) {
    dispatch({ type: UPDATE_PARTNER_CONVERSION_STATE, payload: { state } });
  } else {
    dispatch({ type: UPDATE_PARTNER_CONVERSION_STATE, payload: { state, currentStep: step === "forward" ? store.getState().partners.currentStep + 1 : store.getState().partners.currentStep - 1 }}); 
  }
};

export const openPartnerLogoModal = () => async (dispatch) => {
  dispatch({ type: OPEN_PARTNER_LOGO_MODAL });
};

export const closePartnerLogoModal = () => async (dispatch) => {
  dispatch({ type: CLOSE_PARTNER_LOGO_MODAL });
};

export const updatePartnerConversionState = (update) => async (dispatch) => {
  dispatch({ type: UPDATE_PARTNER_CONVERSION_STATE, payload: update });
};

export const clearPartnerConversionState = () => async (dispatch) => {
  dispatch({ type: CLEAR_PARTNER_CONVERSION_STATE });
};

export const openConvertToPartnerModal = () => async (dispatch) => {
  dispatch({ type: OPEN_CONVERT_TO_PARTNER_MODAL });
};

export const closeConvertToPartnerModal = () => async (dispatch) => {
  dispatch({ type: CLOSE_CONVERT_TO_PARTNER_MODAL });
};

export const createPartnerConversionError = (error, resource) => async (dispatch) => {
  dispatch(showNotification("error", resource, error));
};

export const openCertificateModal = (config) => async (dispatch) => {
  dispatch({ type: OPEN_CERTIFICATE_MODAL, payload: config });
};

export const closeCertificateModal = () => async (dispatch) => {
  dispatch({ type: CLOSE_CERTIFICATE_MODAL });
};

export const law_specialties = [
  { value: "Special Needs", label: "Special Needs" },
  { value: "Elder Law", label: "Elder Law" },
  { value: "Trust and Estate", label: "Trust and Estate" },
  { value: "Personal Injury", label: "Personal Injury" },
  { value: "Tax", label: "Tax" }
];
export const firm_sizes = [
  { value: "1-2", label: "1-2" },
  { value: "3-10", label: "3-10" },
  { value: "11-50", label: "11-50" },
  { value: "51-100", label: "51-100" },
  { value: "100+", label: "100+" }
];
export const bank_trust_roles = [
  { value: "Relationship Manager", label: "Relationship Manager" },
  { value: "Investment Manager", label: "Investment Manager" },
  { value: "Trust Officer", label: "Trust Officer" }
];
export const law_affiliations = [
  { value: "Special Needs Alliance", label: "Special Needs Alliance" },
  { value: "Academy of Special Needs Planners", label: "Academy of Special Needs Planners" }
];
export const ria_certifications = [
  { value: "Certified Financial Planner", label: "Certified Financial Planner (CFP)" },
  { value: "Chartered Financial Analyst", label: "Chartered Financial Analyst (CFA)" },
  { value: "Chartered Investment Counselor", label: "Chartered Investment Counselor (CIC)" },
  { value: "Chartered Financial Consultant", label: "Chartered Financial Consultant (ChFC)" },
  { value: "Personal Financial Specialist", label: "Personal Financial Specialist (PFS)" }
];
export const insurance_certifications = [
  { value: "Chartered Property Casualty Underwriter", label: "Chartered Property Casualty Underwriter (CPCU)" },
  { value: "Certified Insurance Counselor", label: "Certified Insurance Counselor (CIC)" },
  { value: "Certified Risk Manager", label: "Certified Risk Manager (CRM)" },
  { value: "Associate in Risk Management", label: "Associate in Risk Management (ARM)" },
  { value: "Associate in General Insurance", label: "Associate in General Insurance (AINS)" }
];

export const insurance_networks = ["Other", "Independent", ...[
  "Aflac",
  "Allianz Life",
  "Allstate",
  "American Family Insurance",
  "American Fidelity Assurance",
  "American Income Life Insurance Company",
  "Ameritas Life Insurance Company",
  "Amica Mutual Insurance",
  "Assurity Life Insurance Company",
  "Equitable",
  "Bankers Life and Casualty",
  "Banner Life Insurance Company",
  "Colonial Life & Accident Insurance Company",
  "Colonial Penn",
  "Conseco",
  "Farmers Insurance Group",
  "Federal Life Insurance Company",
  "Garden State Life",
  "Genworth Financial",
  "The Great - West Life Assurance Company",
  "Gerber Life Insurance Company",
  "Globe Life And Accident Insurance Company",
  "The Guardian Life Insurance Company of America",
  "Horace Mann Educators Corporation",
  "ING Group",
  "Jackson National Life",
  "John Hancock Life Insurance",
  "Kansas City Life Insurance Company",
  "Lincoln National Corporation",
  "Manhattan Life Insurance Company",
  "MEGA Life and Health Insurance",
  "MetLife",
  "Mutual of Omaha",
  "National Life Group",
  "National Western Life Insurance Company",
  "Nationwide Mutual Insurance Company",
  "New York Life Insurance Company",
  "Ohio National Financial Services Company",
  "Pacific Life",
  "Primerica",
  "Protective Life",
  "Prudential Financial",
  "Securian Financial Group",
  "Standard Insurance Company",
  "State Farm Insurance",
  "Thrivent Financial for Lutherans",
  "TIAA - CREF",
  "Transamerica Corporation",
  "UNIFI Companies",
  "United of Omaha",
  "Veterans Life Insurance",
  "Western & Southern Financial Group"
].sort()];

export const broker_dealers = [
  "Fidelity Investments",
  "Charles Schwab",
  "Wells Fargo Advisors",
  "TD Ameritrade",
  "Edward Jones",
  "Raymond James",
  "Equitable",
  "LPL Financial",
  "Ameriprise Financial",
  "Voya",
  "Commonwealth Financial Network",
  "Northwest Mutual Inv.Services",
  "Cambridge Investment Research",
  "Securities America",
  "Waddell & Reed"
].sort();

export const custodian_banks = [
  "Associated Bank",
  "Attijariwafa Bank",
  "BNY Mellon",
  "Banco de Oro Unibank",
  "Bank of America",
  "Bank of China (Hong Kong) Limited",
  "Bank of Ireland Securities Services",
  "Bank of New York Mellon",
  "Barclays",
  "BBVA Compass",
  "BNP Paribas Securities Services",
  "Brown Brothers Harriman",
  "CACEIS",
  "CIBC Mellon",
  "Citigroup",
  "Charles Schwab Bank",
  "Clearstream",
  "Comerica Bank",
  "Credit Suisse",
  "Deutsche Bank",
  "Danske Bank",
  "Estrategia Investimentos",
  "E.SUN Commercial Bank",
  "Euroclear",
  "Fidelity",
  "Fifth Third Bank",
  "Goldman Sachs",
  "HDFC Bank",
  "Huntington National Bank",
  "HSBC",
  "ICBC",
  "ICICI Bank",
  "Japan Trustee Services Bank",
  "JPMorgan Chase",
  "Kasbank N.V.",
  "KeyBank",
  "LBBW",
  "LPL",
  "Pershing",
  "Maybank",
  "Mega International Commercial Bank",
  "Mitsubishi UFJ Trust and Banking Corporation",
  "Morgan Stanley Smith Barney",
  "NAB", "National Bank of Abu Dhabi",
  "Northern Trust",
  "PT. Bank Central Asia, Tbk.",
  "Qatar National Bank",
  "RBC Investor Services",
  "Société Générale Securities Services",
  "Standard Bank",
  "Standard Chartered Bank",
  "State Bank of India",
  "State Street Bank & Trust",
  "Stock Holding Corporation Of India Limited",
  "The Master Trust Bank of Japan",
  "Trust & Custody Services Bank",
  "Toronto-Dominion Bank (TD)",
  "Mauritius Commercial Bank",
  "U.S. Bank",
  "UBS",
  "UMB Bank",
  "UniCredit",
  "Union Bank N.A.",
  "Vontobel",
  "Wells Fargo Bank"
].sort();

export const insurance_licensing = [
  { value: "Series 6", label: "Series 6" },
  { value: "Series 7", label: "Series 7" },
  { value: "Series 63", label: "Series 63" },
  { value: "Series 65", label: "Series 65" },
  { value: "Series 66", label: "Series 66" }
];

export const organizations = {
  law: [
    { value: "Begley Law Group", label: "Begley Law Group" },
    { value: "Chesapeake Legal Counsel", label: "Chesapeake Legal Counsel" },
    { value: "Handler and Levine LLC", label: "Handler and Levine LLC" },
    { value: "Hinkle, Prior & Fischer", label: "Hinkle, Prior & Fischer" },
    { value: "HWK Law Group", label: "HWK Law Group" },
    { value: "KMC Law", label: "KMC Law" },
    { value: "Manes & Weinberg", label: "Manes & Weinberg" },
    { value: "McCandlish Lillard", label: "McCandlish Lillard" },
    { value: "Saul Ewing Arnstein & Lehr LLP", label: "Saul Ewing Arnstein & Lehr LLP" },
    { value: "Schenck, Price, Smith & King, LLP", label: "Schenck, Price, Smith & King, LLP" },
    { value: "Special Needs Alliance", label: "Special Needs Alliance" },
    { value: "RCCB Law", label: "RCCB Law" },
    { value: "Kearns and Kearns", label: "Kearns and Kearns" },
    { value: "Law Office of Joseph D. Castellucci, Jr.", label: "Law Office of Joseph D. Castellucci, Jr." },
    { value: "Lawrence Law", label: "Lawrence Law" },
    { value: "Mayerson & Associates", label: "Mayerson & Associates" },
    { value: "Norris McLaughlin", label: "Norris McLaughlin" },
    { value: "Winston Law Group", label: "Winston Law Group" }
  ],
  bank_trust: [
    { value: "Bank OZK", label: "Bank OZK" },
    { value: "BBVA", label: "BBVA" },
    { value: "BMO Harris", label: "BMO Harris" },
    { value: "Bryn Mawr Trust", label: "Bryn Mawr Trust" },
    { value: "Equity Trust", label: "Equity Trust" },
    { value: "Fulton Bank", label: "Fulton Bank" },
    { value: "Glenmede", label: "Glenmede" },
    { value: "M&T Bank", label: "M&T Bank" },
    { value: "Mariner Trust", label: "Mariner Trust" },
    { value: "Merrill Lynch", label: "Merrill Lynch" },
    { value: "NYPT", label: "NYPT" },
    { value: "Raymond James", label: "Raymond James" },
    { value: "RBC", label: "RBC" },
    { value: "TD Bank", label: "TD Bank" },
    { value: "Truist", label: "Truist" },
    { value: "UBS", label: "UBS" },
    { value: "US Bank", label: "US Bank" },
    { value: "Wells Fargo", label: "Wells Fargo" },
    { value: "Wilmington Trust", label: "Wilmington Trust" },
    { value: "Continental Trust", label: "Continental Trust" },
    { value: "Haverford Trust Company", label: "Haverford Trust Company" },
    { value: "Morgan Stanley", label: "Morgan Stanley" },
    { value: "Orange Bank & Trust", label: "Orange Bank & Trust" }
  ],
  insurance: [
    { value: "Crump Life Insurance Services", label: "Crump Life Insurance Services" },
    { value: "Equitable", label: "Equitable" },
    { value: "Guardian Life", label: "Guardian Life" },
    { value: "Integrated Financial Concepts", label: "Integrated Financial Concepts" },
    { value: "Laffie Financial Group", label: "Laffie Financial Group" },
    { value: "Lenox Advisors", label: "Lenox Advisors" },
    { value: "M Financial", label: "M Financial" },
    { value: "Mass Mutual", label: "Mass Mutual" },
    { value: "BKA Private Wealth Consultants", label: "BKA Private Wealth Consultants" },
    { value: "National Life", label: "National Life" },
    { value: "The Meltzer Group", label: "The Meltzer Group" },
    { value: "Northwestern Mutual", label: "Northwestern Mutual" },
    { value: "NY Life", label: "NY Life" },
    { value: "Penn Mutual", label: "Penn Mutual" },
    { value: "Reilly Financial Group", label: "Reilly Financial Group" },
    { value: "Simplicity Elite Producer Group", label: "Simplicity Elite Producer Group" },
    { value: "Special Considerations", label: "Special Considerations" },
    { value: "The Wildstein Group", label: "The Wildstein Group" },
    { value: "Underwriters Brokerage Services", label: "Underwriters Brokerage Services" },
    { value: "NFP", label: "NFP" },
    { value: "Highland Capital Brokerage", label: "Highland Capital Brokerage" },
    { value: "New Jersey Life and Casualty", label: "New Jersey Life and Casualty" },
    { value: "Underwriters Brokerage Services", label: "Underwriters Brokerage Services" }
  ],
  ria: [
    { value: "Affinia", label: "Affinia" },
    { value: "Ameriprise", label: "Ameriprise" },
    { value: "Apex Financial Advisors, Inc.", label: "Apex Financial Advisors, Inc." },
    { value: "Beacon Pointe", label: "Beacon Pointe" },
    { value: "Simon Quick", label: "Simon Quick" },
    { value: "Synthesis Wealth Planning, LLC", label: "Synthesis Wealth Planning, LLC" },
    { value: "Transcend Wealth Collective", label: "Transcend Wealth Collective" },
    { value: "BPP Wealth Solution, LLP", label: "BPP Wealth Solution, LLP" },
    { value: "Created Wealth Advisory", label: "Created Wealth Advisory" },
    { value: "Kestra", label: "Kestra" },
    { value: "Maryland Financial Advocates", label: "Maryland Financial Advocates" },
    { value: "Planning Across the Spectrum", label: "Planning Across the Spectrum" },
    { value: "Private Client Group, AM", label: "Private Client Group, AM" },
    { value: "Regent Atlantic", label: "Regent Atlantic" },
    { value: "Sequoia", label: "Sequoia" },
    { value: "Ameriprise", label: "Ameriprise" },
    { value: "ARS Investments", label: "ARS Investments" },
    { value: "Black Coral", label: "Black Coral" },
    { value: "Family Wealth Planning", label: "Family Wealth Planning" },
    { value: "Harty Financial", label: "Harty Financial" },
    { value: "Strategies for Wealth", label: "Strategies for Wealth" }
  ],
  healthcare: [
    { value: "Silver Hill", label: "Silver Hill" },
    { value: "Bayada", label: "Bayada" },
    { value: "Visiting Nurses Association", label: "Visiting Nurses Association" }
  ],
  accountant: [
    { value: "Manish Shah, CPA", label: "Manish Shah, CPA" },
    { value: "WilkinGuttenplan", label: "WilkinGuttenplan" },
    { value: "Mott Tax Advisory Services", label: "Mott Tax Advisory Services" }
  ],
  advocate: [
    { value: "Association for Betterment of Citizens with Disabilities (ABCD)", label: "Association for Betterment of Citizens with Disabilities (ABCD)" },
    { value: "Brain Injury Alliance of NJ", label: "Brain Injury Alliance of NJ" }
  ],
  education: [
    { value: "Woods Services", label: "Woods Services" },
    { value: "Matheny", label: "Matheny" },
    { value: "Newmark Education", label: "Newmark Education" },
    { value: "REED Foundation for Autism", label: "REED Foundation for Autism" }
  ],
  other: [
    { value: "APEG	Other", label: "APEG	Other" },
    { value: "Joshin", label: "Joshin" },
    { value: "National Care Advisors", label: "National Care Advisors" },
    { value: "Broadridge Financial Solutions", label: "Broadridge Financial Solutions" },
    { value: "Ringler Associates", label: "Ringler Associates" },
    { value: "Smile Farms", label: "Smile Farms" }
  ]
};

export const referral_sources = [
  { value: "Hope Trust Employee", label: "Hope Trust Employee" },
];
