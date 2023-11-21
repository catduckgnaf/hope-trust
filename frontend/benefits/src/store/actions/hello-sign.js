import { Auth, API } from "aws-amplify";
import {
  UPDATE_DOWNLOAD_LINK,
  SHOW_LOADER,
  UPDATE_REQUEST_ID,
  UPDATE_SIGNATURE_REQUEST_ID,
  UPDATE_CONTRACT_STATE,
  SET_SESSION_ACCOUNT,
  IS_LOGGED_IN,
  UPDATE_CLIENT_REGISTRATION,
  CLEAR_ALL
} from "../actions/constants";
import HelloSign from "hellosign-embedded";
import { showNotification } from "../actions/notification";
import { apiGateway, hellosign } from "../../config";
import { store } from "..";
import { sleep } from "../../utilities";

export const getEmbeddableHelloSignURL = (signature_id, subject, message, signers, templates, config, allowCancel = true, stateSetter, callback, type) => async (dispatch) => {
  dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Building Contract..." } });
  const account_id = store.getState().session.account_id || store.getState().user.cognito_id;
  let hellosign_config = { clientId: hellosign.HELLOSIGN_CLIENT_ID, skipDomainVerification: !!process.env.REACT_APP_LOCAL, allowCancel, debug: process.env.REACT_APP_STAGE !== "production" };
  const client = new HelloSign(hellosign_config);
  return API.post(
    apiGateway.NAME,
    `/hello-sign/get-signature-url/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        subject,
        message,
        signers,
        signature_id,
        templates,
        config,
        type
      }
    }).then(async (data) => {
      if (data.success) {
        dispatch({ type: UPDATE_REQUEST_ID, payload: data.payload.request_id });
        dispatch({ type: UPDATE_SIGNATURE_REQUEST_ID, payload: data.payload.signature_id });

        client.open(data.payload.embed_link);

        client.on("ready", () => {
          dispatch({ type: SHOW_LOADER, payload: { show: false } });
          dispatch({ type: UPDATE_CONTRACT_STATE, payload: { contract_open: true } });
        });

        client.once("cancel", async () => client.close());

        client.on("error", (data) => {
          dispatch(showNotification("error", "Something went wrong", `Please try again. Error code: ${data.code}`));
          client.close();
        });

        client.once("sign", async (data) => {
          dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Submitting Contracts..." } });
          await sleep(2000);
          client.close();
        });

        client.on("close", async (data) => {
          dispatch({ type: SHOW_LOADER, payload: { show: true, message: "Closing Contract..." } });
          client.off("sign");
          client.off("ready");
          setTimeout(() => {
            Auth.currentAuthenticatedUser({ bypassCache: true })
              .then(async (user) => {
                const token = user.signInUserSession.idToken.jwtToken;
                const storedUser = await API.get(apiGateway.NAME, `/users/${user.username}`, { headers: { Authorization: token } });
                if (storedUser.success) {
                  if (storedUser.payload.benefits_data.contract_signed) await callback();
                  window.HubSpotConversations.widget.remove();
                  if (!stateSetter || storedUser.payload.benefits_data.contract_signed) dispatch({ type: CLEAR_ALL });
                  dispatch({ type: SET_SESSION_ACCOUNT, payload: { account_id, token, user } });
                  dispatch({ type: IS_LOGGED_IN, payload: storedUser.payload });
                  dispatch({ type: SHOW_LOADER, payload: { show: false } });
                }
              })
              .catch((error) => {
                dispatch({ type: SHOW_LOADER, payload: { show: false } });
              });
          }, 5000);
        });
        if (stateSetter) stateSetter("contracts_closed", true, "registration_config");
        dispatch({ type: UPDATE_CLIENT_REGISTRATION, payload: { collector: "registration_config", key: "loading_contracts", value: false } });
        return { success: true };
      } else {
        if (stateSetter) stateSetter("contracts_closed", true, "registration_config");
        return { success: false };
      }
    }).catch((error) => {
      if (error.response && error.response.data) {
        if (error.response.data.message === "This request has already been signed") {
          dispatch(showNotification("error", "Already Signed", error.response.data.message));
        } else {
          dispatch(showNotification("error", "Contract Error", error.response.data.message));
        }
      } else {
        dispatch(showNotification("error", "Something went wrong", "An unknown error occurred."));
      }
      setTimeout(() => {
        Auth.currentAuthenticatedUser({ bypassCache: true })
          .then(async (user) => {
            const token = user.signInUserSession.idToken.jwtToken;
            const storedUser = await API.get(apiGateway.NAME, `/users/${user.username}`, { headers: { Authorization: token } });
            if (storedUser.success) {
              dispatch({ type: SET_SESSION_ACCOUNT, payload: { account_id, token, user } });
              dispatch({ type: IS_LOGGED_IN, payload: storedUser.payload });
              dispatch({ type: SHOW_LOADER, payload: { show: false } });
            }
          })
          .catch(() => {
            dispatch({ type: SHOW_LOADER, payload: { show: false } });
          });
      }, 2000);
      if (stateSetter) stateSetter("contracts_closed", true, "registration_config");
      dispatch({ type: UPDATE_CLIENT_REGISTRATION, payload: { collector: "registration_config", key: "loading_contracts", value: false } });
      return { success: false };
    });
};

export const getHelloSignDownloadLink = (request_id) => async (dispatch) => {
  return API.post(
    apiGateway.NAME,
    `/hello-sign/get-download-link/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        request_id
      }
    }).then(async (data) => {
      if (data.success) {
        dispatch({ type: UPDATE_DOWNLOAD_LINK, payload: data.payload });
        return { success: true };
      } else {
        return { success: false };
      }
    }).catch((error) => {
      dispatch(showNotification("error", "Download Failed", error.response && error.response.data ? error.response.data.message : "Something went wrong."));
      return { success: false, message: error.response && error.response.data ? error.response.data.message : "Something went wrong." };
    });
};

export const sendEntityInvitation = (organization, first, last, email, type) => async (dispatch) => {
  return API.post(
    apiGateway.NAME,
    `/hello-sign/send-entity-invitation/${store.getState().session.account_id}/${store.getState().user.cognito_id}`,
    {
      headers: {
        Authorization: store.getState().session.token
      },
      body: {
        organization,
        first,
        last,
        email,
        type,
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