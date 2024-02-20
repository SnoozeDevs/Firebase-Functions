/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import axios from "axios";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const getTeams = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  axios.get("https://api.squiggle.com.au/?q=teams",{
    headers:{
      "User-Agent":"easytippingdev@gmail.com"
    }
  }).then((res)=>{
    response.send(res.data);
  })
});

export const getGames2022 = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  axios.get("https://api.squiggle.com.au/?q=games&year=2022",{
    headers:{
      "User-Agent":"easytippingdev@gmail.com"
    }
  }).then((res)=>{
    response.send(JSON.stringify(res.data));
  })
});
