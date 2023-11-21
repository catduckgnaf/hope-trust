import { store } from "./store";
import { getHubspotVisitorToken } from "./store/actions/hubspot";

export const loadHubspotDefaults = async (hubspot_visitor_token) => {
  window.hsConversationsSettings = {
    loadImmediately: true,
    enableWidgetCookieBanner: false,
    disableAttachment: false,
    identificationEmail: store.getState().user.email,
    inlineEmbedSelector: "#chat"
  };
  if (hubspot_visitor_token) {
    window.hsConversationsSettings.identificationToken = hubspot_visitor_token;
    window.HubSpotConversations.resetAndReloadWidget();
    window.HubSpotConversations.widget.load();
  } else {
    return store.dispatch(getHubspotVisitorToken())
      .then((jwt) => {
        window.hsConversationsSettings.identificationToken = jwt;
      }).then(() => {
        window.HubSpotConversations.resetAndReloadWidget();
        window.HubSpotConversations.widget.load();
      });
  }
};

export const loadHubspotGenericDefaults = async () => {
  window.hsConversationsSettings = {
    loadImmediately: true,
    enableWidgetCookieBanner: false,
    disableAttachment: true
  };
  window.HubSpotConversations.resetAndReloadWidget();
  window.HubSpotConversations.widget.load();
};