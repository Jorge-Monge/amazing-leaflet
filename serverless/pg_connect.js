// Netlify CRUD Serverless Application
// Author: Jorge Monge
// Date: 2019 February 18

// Variable which will store the
// data coming from the database query.
var queryReturn;
// Variable which will store the database query
// passed from the front-end through a POST request
var dbQuery = null;

// Getting the Pool and Client objects
// from the 'pg' module
const { Pool } = require("pg");

// Hiding away these sensitive values inside environment variables,
// which will be provided while deploying the Netlify serverless app.
const { DB_USER, DB_HOST, DB_DATABASE, DB_PASSWORD, DB_PORT } = process.env;

const sqlQueries = {
  // SQL query for fetching names and texts of all markers
  // Note how we obfuscate the real names of the columns, so that
  // they cannot be maliciously played with in the front-end.
  selectAllQuery: `SELECT gid AS marker_id,
                            poi_name AS marker_name,
                            poi_text AS marker_text,
                            poi_lat AS marker_latitude,
                            poi_lon AS marker_longitude,
                            CONCAT(
                                EXTRACT(YEAR FROM datetime_uploaded), '-',
                                LPAD(EXTRACT(MONTH FROM datetime_uploaded)::text, 2, '0'), '-',
                                LPAD(EXTRACT(DAY FROM datetime_uploaded)::text, 2, '0')
                                )AS date_uploaded,
                            DATE_TRUNC('SECONDS', datetime_uploaded)::time AS time_uploaded,
                            image_b64 AS marker_image 
                            FROM leaflet_project_1`,

  // SQL query for inserting a marker in the database
  // and selecting back the new ones.

  insertMarkerQuery:
    "INSERT INTO leaflet_project_1 (poi_name, poi_text, poi_lat," +
    "poi_lon, datetime_uploaded, image_b64) " +
    "VALUES ('${marker_name}', '${marker_text}', ${marker_latitude}," +
    "${marker_longitude}, (SELECT NOW()), '${marker_image}');",

  // SQL query to get the markers that are not in the map yet.
  selectNewQuery:
    "SELECT gid AS marker_id," +
    "poi_name AS marker_name," +
    "poi_text AS marker_text," +
    "poi_lat AS marker_latitude," +
    "poi_lon AS marker_longitude," +
    "CONCAT(" +
    "EXTRACT(YEAR FROM datetime_uploaded), '-'," +
    "LPAD(EXTRACT(MONTH FROM datetime_uploaded)::text, 2, '0'), '-'," +
    "LPAD(EXTRACT(DAY FROM datetime_uploaded)::text, 2, '0')" +
    ") AS date_uploaded," +
    "DATE_TRUNC('SECONDS', datetime_uploaded)::time AS time_uploaded, " +
    "image_b64 AS marker_image " +
    "FROM leaflet_project_1 " +
    "WHERE NOT gid IN (${featureIdList});",

  // SQL query for deleting a marker from the database
  deleteMarkerQuery: "DELETE FROM leaflet_project_1 WHERE gid = ${marker_id}",
};

async function execute(dbQuery) {
  const pgPool = new Pool({
    user: DB_USER,
    host: DB_HOST,
    database: DB_DATABASE,
    password: DB_PASSWORD,
  });
  // This function receives a string corresponding to
  // a database query, and returns the result as a JSON

  var res = await pgPool.query(dbQuery);
  await pgPool.end();
  return res;
}

// The function can be tested locally (with Postman), by POSTing
// this body:
/*
{"httpMessage": {"dbQuery" : "selectAllQuery",
"marker": {"marker_id": 31 },
"featureIdList": []
}
}
*/

exports.handler = async function (event, context, callback) {
  // This function will answer to GET and POST requests.
  // It will normally be used with POST requests, where the client
  // will pass a database query to the back-end. This query will
  // be executed against the database, and the result passed to
  // the client (front-end)

  // The http request's body is an object that will have the following keys:
  // - "dbQuery": Its content will be a string, corresponding to the key in the
  //      sqlQueries object (in this file). With this key, we can get the actual SQL query.
  // - "marker": Its content will be an object with the marker information.

  var httpMessage = JSON.parse(event.body).httpMessage;
  //console.log("HTTP MESSAGE" + httpMessage);
  var marker = httpMessage.marker;
  //console.log("MARKER: " + marker)
  //console.log(httpMessage.featureIdList);
  //console.log(typeof(httpMessage.featureIdList));
  dbQuery = sqlQueries[httpMessage.dbQuery]
    .replace("${marker_id}", marker.marker_id)
    .replace("${marker_name}", marker.marker_name)
    .replace("${marker_text}", marker.marker_text)
    .replace("${marker_latitude}", marker.marker_latitude)
    .replace("${marker_longitude}", marker.marker_longitude)
    .replace("${marker_image}", marker.marker_image)
    .replace("${featureIdList}", httpMessage.featureIdList.toString());

  console.log("dbQuery:", httpMessage.dbQuery);
  var response = await execute(dbQuery);

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
