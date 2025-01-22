import { onRequest } from "firebase-functions/v2/https";

exports.checkStatus = onRequest((request, response) => {
    response.send({ status: "live", message: "Hello from Jetpack!" });
}); 