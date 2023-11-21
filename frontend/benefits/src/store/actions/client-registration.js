import { API, Auth } from "aws-amplify";
import { apiGateway } from "../../config";
import LogRocket from "logrocket";
import { logEvent } from "./utilities";
import { formatUSPhoneNumber, sleep } from "../../utilities";
import { showNotification } from "./notification";
import moment from "moment";
import { navigateTo } from "./navigation";
import {
  SHOW_LOADER,
  HIDE_LOADER,
  SET_SESSION_ACCOUNT,
  UPDATE_CLIENT_REGISTRATION,
  BULK_UPDATE_CLIENT_REGISTRATION,
  CLEAR_CLIENT_REGISTRATION,
  IS_REGISTERED,
  IS_SIGNING_UP,
  CLEAR_MULTI_PART_FORM
} from "./constants";

export const registerClient = (details) => async (dispatch) => {
  let user = { email: (details.email).toLowerCase(), password: details.password, first: details.first_name, last: details.last_name };
  const { email, password, first, last } = user;
  if (email && password && first && last) {
    let attributes = {
      "email": ((email).toLowerCase()).replace(/\s+/g, ""),
      "name": `${first} ${last}`
    };
    if (details.home_phone) attributes.phone_number = formatUSPhoneNumber(details.home_phone);
    return Auth.signUp({
      username: ((email).toLowerCase()).replace(/\s+/g, ""),
      password,
      attributes
    })
    .then((cognitoUser) => {
      LogRocket.track(`Cognito user signed up. - ${first} ${last} - ${email}`);
      dispatch(logEvent("user creation", { first_name: first, last_name: last, email, cognito_id: cognitoUser.userSub }));
      dispatch({ type: UPDATE_CLIENT_REGISTRATION, payload: { collector: "registration_config", key: "cognito_id", value: cognitoUser.userSub } });
      dispatch({ type: UPDATE_CLIENT_REGISTRATION, payload: { collector: "registration_config", key: "is_verifying", value: true } });
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

export const confirmClientRegistration = (code, client_details, registration_details) => async (dispatch) => {
	let user = {
			"first_name": client_details.first_name,
			"last_name": client_details.last_name,
			"email": ((client_details.email).toLowerCase()).replace(/\s+/g, ""),
			"home_phone": formatUSPhoneNumber(client_details.home_phone),
      "middle_name": client_details.middle_name,
      "address": client_details.address,
      "address2": client_details.address2,
      "city": client_details.city,
      "state": client_details.state,
      "zip": client_details.zip,
      "birthday": moment(client_details.birthday).format("YYYY-MM-DD"),
      "gender": client_details.gender,
      "pronouns": client_details.pronouns,
      "hubspot_contact_id": client_details.hubspot_contact_id
	};
  if (user.email && code) {
    dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Signing Up..." } });
    return Auth.confirmSignUp(user.email, code)
    .then(async (status) => {
      if (status === "SUCCESS") {
        LogRocket.track(`Cognito user confirmed. - ${user.first_name} ${user.last_name} - ${user.email}`);
				const loggedIn = await Auth.signIn({ username: user.email, password: client_details.password });
				const token = loggedIn.signInUserSession.idToken.jwtToken;
				dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Creating profile" } });
        dispatch({ type: SET_SESSION_ACCOUNT, payload: { account_id: loggedIn.username, primary_account_id: loggedIn.username, token, user: loggedIn } });
				const newUser = await API.post(
					apiGateway.NAME,
					`/users/${loggedIn.username}/create`,
					{
						headers: {
							Authorization: token
						},
						body: {
							"newUser": {
								...user,
                "cognito_id": registration_details.cognito_id
							},
              "account_id": loggedIn.username,
              "notify": true,
              "list_slug": "registrations"
						}
					});
				if (newUser.success) {
          dispatch({ type: CLEAR_MULTI_PART_FORM });
          dispatch({ type: CLEAR_CLIENT_REGISTRATION });
          const storedUser = await API.get(apiGateway.NAME, `/users/${newUser.payload.cognito_id}`, { headers: { Authorization: token } });
          LogRocket.track(`New HopeTrust user created. - ${storedUser.payload.first_name} ${storedUser.payload.last_name} - ${storedUser.payload.email}`);
					dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Finalizing user" } });
          if (storedUser.success) {
            dispatch(logEvent("client signup", storedUser.payload));
            dispatch({ type: IS_REGISTERED, payload: storedUser.payload });
            sleep(3000);
            dispatch(navigateTo("/account-registration"));
          } else {
            dispatch(showNotification("error", "User Lookup", storedUser.message));
          }
				} else {
          dispatch(showNotification("error", "User creation", newUser.message));
				}
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

export const updateClientRegistrationState = (collector, key, value) => async (dispatch) => {
  dispatch({ type: UPDATE_CLIENT_REGISTRATION, payload: { collector, key, value } });
};

export const bulkUpdateClientRegistrationState = (collector, data) => async (dispatch) => {
  dispatch({ type: BULK_UPDATE_CLIENT_REGISTRATION, payload: { collector, data } });
};

export const clearClientRegistration = () => async (dispatch) => {
  dispatch({ type: CLEAR_CLIENT_REGISTRATION });
};

