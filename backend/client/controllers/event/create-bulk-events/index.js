const { database } = require("../../../postgres");
const { getHeaders, warm } = require("../../../utilities/request");
const getCognitoUser = require("../../../services/cognito/get-cognito-user");
const { v1 } = require("uuid");

exports.handler = async (event) => {
  if (event.source === "serverless-plugin-warmup") return warm;
  const { account_id, cognito_id } = event.pathParameters;
  const { newEvent } = JSON.parse(event.body);
  const cognito = await getCognitoUser(event, account_id);
  if (cognito.isAuthorized) {
    let requests = [];
    const total_days = newEvent.days_of_the_week;
    delete newEvent.days_of_the_week;
    const series_id = v1();
    total_days.forEach((day) => {
      requests.push(
        database.insert(
          "events", {
            ...newEvent,
            series_id,
            day_of_the_week: day,
            cognito_id,
            account_id
          }
        )
      );
    });
    const events = await Promise.all(requests);
    if (events.length) {
      const series_events = await database.query("SELECT * from events where series_id = $1", series_id);
      if (events.length) {
        return {
          statusCode: 200,
          headers: getHeaders(),
          body: JSON.stringify({
            "success": true,
            "message": "Successfully created new events.",
            "payload": series_events
          })
        };
      }
      return {
        statusCode: 400,
        headers: getHeaders(),
        body: JSON.stringify({
          "success": false,
          "message": "Could not find created events."
        })
      };
    }
    return {
      statusCode: 400,
      headers: getHeaders(),
      body: JSON.stringify({
        "success": false,
        "message": "Could not create new events."
      })
    };
  }
  return {
    statusCode: 401,
    headers: getHeaders(),
    body: JSON.stringify({
      "success": false,
      "message": "You are not authorized to perform this action."
    })
  };
};
