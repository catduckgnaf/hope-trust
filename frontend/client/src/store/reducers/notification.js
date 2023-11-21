import { SHOW_NOTIFICATION, HIDE_NOTIFICATION, CLEAR_ALL } from "../actions/constants";

const defaultState = {
  show: false,
  notification_config: {
    message: "",
    timeout: 10000,
    action: "",
    button_text: "",
    hide_close: true,
    type: "", // error, success, warning, danger
    pages: [] // what pages should this display on? empty array will show on all pages
  }
};
const notificationReducer = (state = defaultState, { type, payload }) => {
  switch (type) {
    case SHOW_NOTIFICATION:
      return { show: true, notification_config: payload };
    case HIDE_NOTIFICATION:
      return defaultState;
    case CLEAR_ALL:
      return defaultState;
    default:
      return state;
  }
};

export default notificationReducer;
