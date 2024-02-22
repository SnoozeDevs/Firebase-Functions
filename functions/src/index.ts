import {onRequest} from "firebase-functions/v2/https";
import axios from "axios";
const {initializeApp} = require("firebase-admin/app");
// const functions = require("firebase-functions");
// const admin = require("firebase-admin");
initializeApp();

// import {onCall} from "firebase-functions/v2/https";
// import {onDocumentWritten} from "firebase-functions/v2/firestore";
const {getFirestore} = require("firebase-admin/firestore");
const db = getFirestore();


export const getTeams = onRequest((request, response) => {
  axios.get("https://api.squiggle.com.au/?q=teams", {
    headers: {
      "User-Agent": "easytippingdev@gmail.com",
    },
  }).then((res) => {
    response.send(res.data);
  });
});

export const getProjTips2024Round1 = onRequest((request, response) => {
  axios.get("https://api.squiggle.com.au/?q=tips;year=2024;round=1", {
    headers: {
      "User-Agent": "easytippingdev@gmail.com",
    },
  }).then((res) => {
    response.send(JSON.stringify(res.data));
  });
});

// ----------- Caveman Code -----------
export const getStandings = onRequest((request, response) => {
  const standingsReference2023 = db.collection("standings").doc("2023");
  const teamsCollection = standingsReference2023.collection("teams");
  const ladder: Array<string> = [];

  const parseTeamObject = (team: any) => {
    return {
      team: team.name,
      rank: team.rank,
      teamId: team.id,
    };
  };

  axios.get("https://api.squiggle.com.au/?q=standings;year=2023", {
    headers: {
      "User-Agent": "easytippingdev@gmail.com",
    },
  }).then(async (res) => {
    res.data.standings.forEach(async (element: any) => {
      ladder.push(element.name);
      await teamsCollection.doc(element.name).set(parseTeamObject(element));
    });

    await standingsReference2023.set({ladder});

    response.send("Standings and Ladder Submitted to DB!");
  });
});

export const getResults = onRequest(async (request, response) => {
  const standingsReference2023 = db.collection("standings").doc("2023");
  const resultsCollection = standingsReference2023.collection("results");
  const roundsCollection = resultsCollection.doc("rounds").collection("Round 1");

  axios.get(`https://api.squiggle.com.au/?q=games;year=2023;round=${1}`, {
    headers: {
      "User-Agent": "easytippingdev@gmail.com",
    },
  }).then(async (res) => {
    res.data.games.forEach(async (element: any) => {
      await roundsCollection.doc(`${element.hteam} vs ${element.ateam}`).set(element);
    });

    response.send("2023 Results Submitted to DB!");
  });
});

// ----------- Chimp Code -----------
// export const getStandings = functions.https.onRequest(() => {
//   axios.get("https://api.squiggle.com.au/?q=standings;year=2023", {
//     headers: {
//       "User-Agent": "easytippingdev@gmail.com",
//     },
//   }).then((res) => {
//     const standingsData = res.data.standings;
//     const standingsCollection = admin.firestore().collection("standings");
//     const batch = admin.firestore().batch();
//     standingsData.forEach((standing: any) => {
//       const docRef = standingsCollection.doc(standing.id.toString());
//       batch.set(docRef, standing);
//     });
//     batch.commit();
//   }).catch((error) => {
//     console.error("it fckd", error);
//   });
// });
