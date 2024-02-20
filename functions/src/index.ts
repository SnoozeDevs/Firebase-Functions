/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {onRequest} from "firebase-functions/v2/https";
import axios from "axios";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const getTeams = onRequest((request, response) => {
  axios.get("https://api.squiggle.com.au/?q=teams", {
    headers: {
      "User-Agent": "easytippingdev@gmail.com",
    },
  }).then((res)=>{
    response.send(res.data);
  });
});

export const getGames2022 = onRequest((request, response) => {
  axios.get("https://api.squiggle.com.au/?q=games&year=2022", {
    headers: {
      "User-Agent": "easytippingdev@gmail.com",
    },
  }).then((res)=>{
    response.send(JSON.stringify(res.data));
  });
});

export const getCossiesGame = onRequest((request, response) => {
  axios.get("https://api.squiggle.com.au/?q=games;game=10913", {
    headers: {
      "User-Agent": "easytippingdev@gmail.com",
    },
  }).then((res)=>{
    response.send(JSON.stringify(res.data));
  });
});
