import { API } from "aws-amplify";
import { apiGateway } from "../../config";
import { store } from "..";
import { showNotification } from "./notification";
import { exportOrganizationExport } from "./pdf";
import { UPDATE_PARTNER_ACCOUNT_RECORD, SHOW_LOADER, HIDE_LOADER } from "./constants";
import { customerServiceGetAllAccounts, customerServiceGetAllPartners, customerServiceGetAllUsers, getAllTransactions } from "./customer-support";
import { createTicket } from "./tickets";
const Gateway = apiGateway.find((gateway) => gateway.name === "support");

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

export const createReferralCode = (account) => async (dispatch) => {
  return API.post(
    Gateway.name,
    `/partners/create-partner-referral/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        target_account: account.account_id
      }
    }).then((data) => {
      dispatch(customerServiceGetAllPartners());
      dispatch({ type: UPDATE_PARTNER_ACCOUNT_RECORD, payload: { updates: data.payload, account_id: account.account_id } });
      if (data.payload.referral_code) dispatch(showNotification("success", "Code Generated", `Referral code was successfully dispatched to ${data.payload.first_name} ${data.payload.last_name}.`));
      return data;
    }).catch((error) => {
      dispatch(showNotification("error", "Could not generate referral code", "There was a problem generating your referral code. Please try again."));
      return { success: false, message: error.response && error.response.data ? error.response.data.message : "Something went wrong." };
    });
};

export const addAccountToSubscription = (client_account_id, subscription_record_id, customer_id, current_plan, new_plan = false, cognito_id) => async (dispatch) => {
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
      if (data.success) {
        dispatch(customerServiceGetAllUsers(true));
        dispatch(customerServiceGetAllAccounts(true));
        dispatch(customerServiceGetAllPartners(true));
        dispatch(getAllTransactions(true));
        dispatch(showNotification("success", "Subscription Transferred", `${data.payload.first_name} ${data.payload.last_name}'s subscription was successfully transferred.`));
        dispatch(createTicket({
          account_id: client_account_id,
          cognito_id,
          title: "Subscription Seat Added",
          request_type: "account_update",
          priority: "normal",
          status: "new",
          body: `${store.getState().user.first_name} ${store.getState().user.last_name} has added a seat to their subscription. ${data.payload.first_name} ${data.payload.last_name}'s subscription was successfully transferred.`
        }));
      }
      dispatch({ type: HIDE_LOADER });
      return data;
    }).catch((error) => {
      dispatch(showNotification("error", "Subscription Transfer Failed", (error.response && error.response.data) ? error.response.data.message : error.message || "Something went wrong."));
      dispatch({ type: HIDE_LOADER });
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
