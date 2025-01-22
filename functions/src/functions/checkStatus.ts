import { onRequest } from "firebase-functions/v2/https";

export const checkStatus = onRequest((request, response) => {
    response.send({ status: "live", message: "Hello from Jetpack!" });
}); 