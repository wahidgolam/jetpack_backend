import * as functions from "firebase-functions";

export const checkStatus = functions.https.onRequest((request, response) => {
    response.send({ status: "live", message: "Hello from Jetpack!" });
}); 