// Netlify Serverless Application
// Author: Jorge Monge
// Date: 2019 March 04

// Hiding away sensitive values inside environment variables,
// which will be provided while deploying the Netlify serverless app.
let MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;

// This will be the response from the server
var response = {};

// The function can be tested locally (with Postman), by GETting
// from http://localhost:8888/.netlify/functions/get_mapbox_token:

exports.handler = async function (event, context, callback) {
  // This function will answer to GET requests.
  // It will respond with the Mapbox public access token,
  // in an effort to hide it somehow from the front-end
  // (although, once the request to this function is performed,
  // the variable in the front-end that will store it, can be queried and
  // its value obtained).

  response = { mt: MAPBOX_TOKEN };
  console.log("response:", response);
  callback(null, {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers":
        "Origin, X-Requested-With, Content-Type, Accept",
    },
    body: JSON.stringify(response),
  }); // Returns JSON
};
