import {onRequest} from "firebase-functions/v2/https";
import axios from "axios";
const {initializeApp} = require("firebase-admin/app");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
initializeApp();

//import {onCall} from "firebase-functions/v2/https";
//import {onDocumentWritten} from "firebase-functions/v2/firestore";
//const {getFirestore} = require("firebase-admin/firestore");
//const db = getFirestore();

export const getTeams = onRequest((request, response) => {
  axios.get("https://api.squiggle.com.au/?q=teams", {
    headers: {
      "User-Agent": "easytippingdev@gmail.com",
    },
  }).then((res)=>{
    response.send(res.data);
  });
});

export const getProjTips2024Round1 = onRequest((request, response) => {
  axios.get("https://api.squiggle.com.au/?q=tips;year=2024;round=1", {
    headers: {
      "User-Agent": "easytippingdev@gmail.com",
    },
  }).then((res)=>{
    response.send(JSON.stringify(res.data));
  });
});

// ----------- Caveman Code -----------
// export const getStandings = onRequest((request, response) => {
//   axios.get("https://api.squiggle.com.au/?q=standings;year=2023", {
//     headers: {
//       "User-Agent": "easytippingdev@gmail.com",
//     },
//   }).then((res)=>{
//     response.send(JSON.stringify(res.data));
//     res.data.standings.forEach(async(element:any,elementIndex:number) => {
//       await db.collection("standings2023").doc(`StandingsObject-${elementIndex}`).set(element)
//     });
//   });
// });

// ----------- Chimp Code -----------
export const getStandings = functions.https.onRequest(() => {
  axios.get("https://api.squiggle.com.au/?q=standings;year=2023", {
    headers: {
      "User-Agent": "easytippingdev@gmail.com",
    },
  }).then((res) => {
    const standingsData = res.data.standings;
    const standingsCollection = admin.firestore().collection("standings");
    const batch = admin.firestore().batch();
    standingsData.forEach((standing:any) => {
      const docRef = standingsCollection.doc(standing.id.toString());
      batch.set(docRef, standing);
    });
    batch.commit();
  }).catch((error) => {
    console.error("it fckd", error);
  });
});
