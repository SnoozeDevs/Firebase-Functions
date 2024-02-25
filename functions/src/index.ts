import { onRequest } from "firebase-functions/v2/https";
import axios from "axios";
import * as functions from 'firebase-functions';
const { initializeApp } = require("firebase-admin/app");
// const functions = require("firebase-functions");
// const admin = require("firebase-admin");
initializeApp();

// import {onCall} from "firebase-functions/v2/https";
// import {onDocumentWritten} from "firebase-functions/v2/firestore";
const { getFirestore } = require("firebase-admin/firestore");
const db = getFirestore();


export const uploadTeams2023 = functions.region('australia-southeast1').https.onRequest((request, response) => {

  const standingsReference2023 = db.collection("standings").doc("2023");
  const teamsCollection = standingsReference2023.collection("teams");

  axios.get("https://api.squiggle.com.au/?q=teams;year=2023", {
    headers: {
      "User-Agent": "easytippingdev@gmail.com",
    },
  }).then((res) => {
    res.data.teams.forEach(async (team: any) => {
      await teamsCollection.doc(team.name).update({
        logo: team.logo,
        abbreviation: team.abbrev
      });

    })
    response.send("Team Data Updated in DB!");
  });
});

export const uploadProjTips2024Round1 = functions.region('australia-southeast1').https.onRequest((request, response) => {

  axios.get("https://api.squiggle.com.au/?q=tips;year=2024;round=1", {
    headers: {
      "User-Agent": "easytippingdev@gmail.com",
    },
  }).then((res) => {
    response.send(JSON.stringify(res.data));
  });
});

// ----------- Caveman Code -----------
export const uploadStandings2023 = functions.region('australia-southeast1').https.onRequest((request, response) => {
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

    await standingsReference2023.set({ ladder });

    response.send("Standings and Ladder Submitted to DB!");
  });
});

export const uploadResults2023 = functions.region('australia-southeast1').https.onRequest(async (request, response) => {
  const standingsReference2023 = db.collection("standings").doc("2023");
  const resultsCollection = standingsReference2023.collection("results");

  axios.get("https://api.squiggle.com.au/?q=games;year=2023", {
    headers: {
      "User-Agent": "easytippingdev@gmail.com",
    },
  }).then(async (res) => {
    res.data.games.forEach(async (element: any) => {
      const roundsCollection = resultsCollection.doc("rounds").collection(element.roundname);
      await roundsCollection.doc(`${element.hteam} vs ${element.ateam}`).set(element);
    });

    response.send("2023 Results Submitted to DB!");
  });
});

export const getTeams = functions.region('australia-southeast1').https.onRequest(async (request, response) => {

  const teamDataArray: any = []

  const teamsCollection = db.collection('standings').doc('2023').collection('teams')
  await teamsCollection.get().then((team: any) => {
    team.forEach((teamDoc: any) => {
      teamDataArray.push(teamDoc.data())
    })
  })

  response.send(teamDataArray);

});

// ----------- Chimp Code -----------
// export const getStandings = functions.region('australia-southeast1').https.onRequest(() => {
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
