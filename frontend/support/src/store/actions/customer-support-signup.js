import { API, Auth } from "aws-amplify";
import { apiGateway } from "../../config";
import LogRocket from "logrocket";
import { store } from "..";
import { navigateTo } from "./navigation";
import moment from "moment";
import { showNotification } from "./notification";
import { formatUSPhoneNumber } from "../../utilities";
import {
	SHOW_LOADER,
	HIDE_LOADER,
  UPDATE_CUSTOMER_SUPPORT_SIGNUP_STATE,
  CLEAR_CUSTOMER_SUPPORT_SIGNUP_STATE,
  SET_SESSION_ACCOUNT,
  IS_REGISTERED
} from "./constants";
import { createAccount } from "./account";
const Gateway = apiGateway.find((gateway) => gateway.name === "support");

export const signup = (details) => async (dispatch) => {
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
      dispatch({ type: UPDATE_CUSTOMER_SUPPORT_SIGNUP_STATE, payload: { confirmationRequired: true, cognito_id: cognitoUser.userSub, email }});
      return { success: true, payload: cognitoUser };
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

export const confirmSignUp = (fields) => async (dispatch) => {
  let code = fields.code;
	let creator = fields.creatorDetails;
	let user = {
			"first_name": creator.first_name,
			"middle_name": creator.middle_name,
			"last_name": creator.last_name,
			"email": ((creator.email).toLowerCase()).replace(/\s+/g, ""),
			"address": creator.address,
			"address2": creator.address2,
			"city": creator.city,
			"state": creator.state,
			"zip": creator.zip,
			"birthday": moment(creator.birthday).format("YYYY-MM-DD"),
			"home_phone": formatUSPhoneNumber(creator.home_phone),
			"other_phone": formatUSPhoneNumber(creator.other_phone),
			"avatar": creator.avatar,
			"gender": creator.gender
	};
  if (user.email && code) {
    dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Signing Up..." } });
    return Auth.confirmSignUp(user.email, code)
    .then(async (status) => {
      if (status === "SUCCESS") {
        LogRocket.track(`Cognito user confirmed. - ${user.first_name} ${user.last_name} - ${user.email}`);
				const loggedIn = await Auth.signIn({ username: user.email, password: creator.password });
				const token = loggedIn.signInUserSession.idToken.jwtToken;
				dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Creating profile" } });
				dispatch({ type: SET_SESSION_ACCOUNT, payload: { account_id: loggedIn.username, token, user: loggedIn } });
				const newUser = await API.post(
					Gateway.name,
					`/users/${loggedIn.username}/create`,
					{
						headers: {
							Authorization: token
						},
						body: {
							"newUser": {
								...user,
								"cognito_id": store.getState().customer_support_signup.cognito_id
							},
							"account_id": loggedIn.username,
              "user_type": "customer-support",
              "list_slug": "customer_support"
						}
					});
				if (newUser.success) {
					const createdUser = newUser.payload;

					LogRocket.track(`New HopeTrust customer support user created. - ${createdUser.first_name} ${createdUser.last_name} - ${createdUser.email}`);
					dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Finalizing account" } });
					dispatch(createAccount(createdUser))
						.then(async (newAccount) => {
						if (newAccount.success) {
							LogRocket.track(`New account created. - ${newAccount.payload.account_id}`);
							const storedUser = await API.get(Gateway.name, `/users/${loggedIn.username}`, { headers: { Authorization: token } });
							if (storedUser.success) {
								dispatch({ type: UPDATE_CUSTOMER_SUPPORT_SIGNUP_STATE, payload: { confirmationRequired: false, cognito_id: "", error: "", currentStep: 0 } });
								dispatch({ type: IS_REGISTERED, payload: storedUser.payload });
								dispatch({ type: CLEAR_CUSTOMER_SUPPORT_SIGNUP_STATE });
								dispatch(navigateTo("/"));
							} else {
								dispatch(showNotification("error", "User Lookup", storedUser.message));
							}
						} else {
							dispatch(showNotification("error", "Account Creation", newAccount.message));
						}
					});
				} else {
					dispatch(showNotification("error", "User creation", newUser.message));
				}
      } else {
        dispatch(showNotification("error", "Invalid Cognito verification", "Verification failed. Please try again or request a new code."));
      }
    })
    .catch((error) => {
      dispatch(showNotification("error", "Cognito signup confirmation", error.message));
    });
  } else {
    dispatch(showNotification("error", "Required fields", "You must provide a user and verification code."));
  }
};

export const changeStep = (step, state) => async (dispatch) => {
  if (!step) {
    dispatch({ type: UPDATE_CUSTOMER_SUPPORT_SIGNUP_STATE, payload: { state } });
  } else {
    dispatch({ type: UPDATE_CUSTOMER_SUPPORT_SIGNUP_STATE, payload: { state, currentStep: step === "forward" ? store.getState().customer_support_signup.currentStep + 1 : store.getState().customer_support_signup.currentStep - 1 }}); 
  }
};

export const resendSignUp = (email) => async (dispatch) => {
	if (email) {
		return Auth.resendSignUp((email).toLowerCase())
			.then((data) => {
				LogRocket.track(`Verification code resent to ${email}`);
				return { success: true };
			})
			.catch((error) => {
				dispatch(showNotification("error", "Resend Verification Code", error.message));
			});
	} else {
		dispatch(showNotification("error", "Resend Verification Code", "You must enter an email to resend a verification code."));
	}
};

export const cancelSignup = (step, email) => async (dispatch) => {
	if (email) {
		dispatch({ type: UPDATE_CUSTOMER_SUPPORT_SIGNUP_STATE, payload: { currentStep: step, confirmationRequired: false, cognito_id: null } });
		dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Cancelling..." } });
		return API.get(Gateway.name, `/users/cancel-signup/${email}`).then((user) => {
			dispatch({ type: HIDE_LOADER });
			return user;
		}).catch((error) => {
			dispatch({ type: HIDE_LOADER });
			if (error.response) return error.response.data;
			return { success: false };
		});
	}
};

export const updateCustomerSupportSignupState = (update) => async (dispatch) => {
  dispatch({ type: UPDATE_CUSTOMER_SUPPORT_SIGNUP_STATE, payload: update });
};

export const clearSignupState = () => async (dispatch) => {
  dispatch({ type: CLEAR_CUSTOMER_SUPPORT_SIGNUP_STATE });
};

export const createCustomerSupportSignupError = (error, resource) => async (dispatch) => {
  dispatch(showNotification("error", resource, error));
};