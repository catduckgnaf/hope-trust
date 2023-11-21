import { API, Auth } from "aws-amplify";
import { apiGateway } from "../../config";
import LogRocket from "logrocket";
import { logEvent } from "./utilities";
import { formatUSPhoneNumber } from "../../utilities";
import { showNotification } from "./notification";
import { store } from "..";
import { navigateTo } from "./navigation";
import { addContactToCompany, createHubspotCompany } from "./hubspot";
import { dispatchRequest } from "./request";
import {
  SHOW_LOADER,
  HIDE_LOADER,
  SET_SESSION_ACCOUNT,
  BULK_UPDATE_PARTNER_REGISTRATION,
  UPDATE_PARTNER_REGISTRATION,
  CLEAR_PARTNER_REGISTRATION,
  IS_REGISTERED,
  IS_SIGNING_UP,
  CLEAR_MULTI_PART_FORM
} from "./constants";
import { createPartner, updatePartner } from "./partners";
import { createUser, getCurrentUser } from "./user";
import { createStripeCustomer } from "./stripe";
const Gateway = apiGateway.find((gateway) => gateway.name === "client");

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

export const registerPartner = (details) => async (dispatch) => {
  let user = { email: (details.email).toLowerCase(), password: details.password, first: details.first_name, last: details.last_name };
  if (details.home_phone) user.phone = formatUSPhoneNumber(details.home_phone);
  const { email, password, phone, first, last } = user;
  if (email && password && first && last) {
    return Auth.signUp({
      username: ((email).toLowerCase()).replace(/\s+/g, ""),
      password,
      attributes: {
        "email": ((email).toLowerCase()).replace(/\s+/g, ""),
        "name": `${first} ${last}`,
        "phone_number": phone
      }
    })
    .then((cognitoUser) => {
      LogRocket.track(`Cognito user signed up. - ${first} ${last} - ${email}`);
      dispatch(logEvent("user creation", { first_name: first, last_name: last, email, cognito_id: cognitoUser.userSub }));
      dispatch({ type: UPDATE_PARTNER_REGISTRATION, payload: { collector: "registration_config", key: "cognito_id", value: cognitoUser.userSub } });
      dispatch({ type: UPDATE_PARTNER_REGISTRATION, payload: { collector: "registration_config", key: "is_verifying", value: true } });
      dispatch({ type: IS_SIGNING_UP, payload: true });
      return { success: true };
    })
    .catch((error) => {
      dispatch(showNotification("error", "Cognito signup", error.message));
      return { success: false };
    });
  } else {
    dispatch(showNotification("error", "Missing signup credentials", "You must enter a username and password."));
    return { success: false };
  }
};

export const confirmPartnerRegistration = (code, details) => async (dispatch) => {
	let user = {
			"first_name": details.first_name,
			"last_name": details.last_name,
			"email": ((details.email).toLowerCase()).replace(/\s+/g, ""),
			"home_phone": formatUSPhoneNumber(details.home_phone),
			"other_phone": formatUSPhoneNumber(details.other_phone),
      "address": details.address,
      "address2": details.address2,
      "city": details.city,
      "state": details.state,
      "zip": details.zip,
      "avatar": details.avatar
	};
  if (user.email && code) {
    dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Signing Up..." } });
    return Auth.confirmSignUp(user.email, code, { forceAliasCreation: true })
    .then(async (status) => {
      if (status === "SUCCESS") {
        LogRocket.track(`Cognito user confirmed. - ${user.first_name} ${user.last_name} - ${user.email}`);
				const loggedIn = await Auth.signIn({ username: user.email, password: details.password });
				const token = loggedIn.signInUserSession.idToken.jwtToken;
				dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Creating profile" } });
        dispatch({ type: SET_SESSION_ACCOUNT, payload: { account_id: loggedIn.username, primary_account_id: loggedIn.username, token, user: loggedIn } });
        return dispatch(createUser({
          "newUser": {
            ...user,
            "hubspot_contact_id": details.hubspot_contact_id,
            "cognito_id": details.cognito_id
          },
          "account_id": loggedIn.username,
          "user_type": details.partner_type,
          "account_type": "advisor",
          "list_slug": "partner",
        }, loggedIn.username, token))
        .then(async (newUser) => {
            const createdUser = newUser.payload;
            LogRocket.track(`New HopeTrust user created. - ${details.first_name} ${details.last_name} - ${details.email}`);
            dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Finalizing account" } });
            const newAccount = await API.post(
              Gateway.name,
              `/accounts/create/${loggedIn.username}`,
              {
                headers: {
                  Authorization: token
                },
                body: {
                  "account_name": details.name,
                  "beneficiary_id": createdUser.cognito_id,
                  "cognito_id": createdUser.cognito_id,
                  "account_id": store.getState().session.account_id,
                  "user_type": "advisor"
                }
              });
            if (newAccount.success) {
              LogRocket.track(`New account created. - ${newAccount.payload.account_id}`);
              dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Creating Partner..." } });
              return dispatch(createPartner({
                newPartner: {
                  name: details.name,
                  primary_network: details.primary_network,
                  is_life_insurance_affiliate: details.is_life_insurance_affiliate,
                  domain_approved: details.domain_approved
                },
                partner_type: details.partner_type
              }, newAccount.payload.account_id, loggedIn.username))
              .then((newPartner) => {
                if (!details.domain_approved) {
                  const domain = createdUser.email.split("@")[1];
                  dispatch(dispatchRequest({
                    title: "Domain Approval Required",
                    request_type: "domain_approval",
                    priority: "high",
                    body: `${createdUser.first_name} ${createdUser.last_name} has registered as a partner with an unapproved domain (${domain}).`,
                    status: "new",
                    domain,
                    tags: ["domain approval", "partner", domain],
                    organization: newPartner.payload.name,
                    cognito_id: createdUser.cognito_id
                  }));
                }
                dispatch({ type: CLEAR_MULTI_PART_FORM });
                LogRocket.track(`New partner created. - ${newPartner.payload.id}`);
                if (details.hubspot_company_id) {
                  dispatch(addContactToCompany(details.hubspot_contact_id, details.hubspot_company_id));
                } else if (details.is_creating_new_org) {
                  dispatch(createHubspotCompany(details.name, details.partner_type, details.domain_approved, details.email, createdUser.cognito_id))
                    .then((company) => {
                      if (company.success) {
                        dispatch(addContactToCompany(details.hubspot_contact_id, company.payload.companyId));
                        if (company.payload.type && company.payload.type !== details.partner_type) dispatch(updatePartner({ partner_type: company.payload.type }, createdUser.cognito_id, token));
                      }
                    });
                }
                return dispatch(createStripeCustomer({
                  phone: user.home_phone,
                  name: `${user.first_name} ${user.last_name}`,
                  email: user.email
                }))
                  .then(async (newCustomer) => {
                    return dispatch(getCurrentUser())
                      .then((storedUser) => {
                        dispatch({ type: IS_REGISTERED, payload: storedUser.payload });
                        dispatch({ type: CLEAR_PARTNER_REGISTRATION });
                        window.HubSpotConversations.widget.remove();
                        dispatch(logEvent("partner signup", storedUser.payload));
                        dispatch(navigateTo("/account-registration"));
                      })
                      .catch((error) => {
                        dispatch(showNotification("error", "User Lookup", error.message));
                      });
                  })
                  .catch((error) => {
                    dispatch(showNotification("error", "Customer Creation", error.message));
                  });
              })
              .catch((error) => {
                dispatch(showNotification("error", "Partner Creation", error.message));
              });
            } else {
              dispatch(showNotification("error", "Account Creation", newAccount.message));
            }
        })
        .catch((error) => {
          dispatch(showNotification("error", "User creation", error.message));
        });
      } else {
        dispatch(showNotification("error", "Invalid Cognito verification", "Verification failed. Please try again or request a new code."));
      }
    })
    .catch((error) => {
      dispatch(showNotification("error", "Cognito signup confirmation", error.message));
      dispatch({ type: HIDE_LOADER });
    });
  } else {
    dispatch(showNotification("error", "Required details", "You must provide a user and verification code."));
  }
};

export const updatePartnerRegistrationState = (collector, key, value) => async (dispatch) => {
  dispatch({ type: UPDATE_PARTNER_REGISTRATION, payload: { collector, key, value } });
};
export const bulkUpdatePartnerRegistrationState = (collector, data) => async (dispatch) => {
  dispatch({ type: BULK_UPDATE_PARTNER_REGISTRATION, payload: { collector, data } });
};
export const clearPartnerRegistration = () => async (dispatch) => {
  dispatch({ type: CLEAR_PARTNER_REGISTRATION });
};