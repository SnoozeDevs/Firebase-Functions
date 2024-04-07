import axios from "axios";
import * as functions from 'firebase-functions';
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");

initializeApp();
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


// const updateMatchRecords = async () => {

//   const standingsReference2024 = db.collection("standings").doc("2024");
//   const roundsRecord = standingsReference2024.collection("rounds");

//   const parseTimeRecord = (gameData: any) => {
//     const timeRecordObject = {
//       userLocalKickOff: gameData.date,
//       gameLocationKickOff: gameData.localtime,
//       time: gameData.timestr,
//       timezone: gameData.tz,
//       unixTime: gameData.unixtime,
//     }
//     return timeRecordObject;
//   }

//   axios.get("https://api.squiggle.com.au/?q=games;year=2024", {
//     headers: {
//       "User-Agent": "easytippingdev@gmail.com",
//     },
//   }).then(async (res) => {

//     let roundArray: any = []
//     res.data.games.forEach(async (element: any) => {

//       //* Reset array every time the round changes
//       if (element.round === roundArray[roundArray.length - 1]?.round + 1) {
//         roundArray = []
//       }

//       const roundsDoc = roundsRecord.doc(`${element.round}`);
//       roundArray.push(element)
//       roundsDoc.set({ roundArray })
//       const roundCollection = roundsDoc.collection(`${element.id}`)
//       await roundCollection.doc(`completeRecord`).set(element)
//       await roundCollection.doc(`timeRecord`).set(parseTimeRecord(element));
//     });
//   });
// }

export const uploadGames2024 = functions.region('australia-southeast1').https.onRequest(async (request, response) => {
  const standingsReference2024 = db.collection("standings").doc("2024");
  const roundsRecord = standingsReference2024.collection("rounds");

  const parseTimeRecord = (gameData: any) => {
    const timeRecordObject = {
      userLocalKickOff: gameData.date,
      gameLocationKickOff: gameData.localtime,
      time: gameData.timestr,
      timezone: gameData.tz,
      unixTime: gameData.unixtime,
    }

    return timeRecordObject;
  }


  axios.get("https://api.squiggle.com.au/?q=games;year=2024", {
    headers: {
      "User-Agent": "easytippingdev@gmail.com",
    },
  }).then(async (res) => {

    let roundArray: any = []
    res.data.games.forEach(async (element: any) => {

      //* Reset array every time the round changes
      if (element.round === roundArray[roundArray.length - 1]?.round + 1) {
        roundArray = []
      }

      const roundsDoc = roundsRecord.doc(`${element.round}`);
      roundArray.push(element)
      roundsDoc.set({ roundArray })
      const roundCollection = roundsDoc.collection(`${element.id}`)
      await roundCollection.doc(`completeRecord`).set(element)
      await roundCollection.doc(`timeRecord`).set(parseTimeRecord(element));
    });

    response.send(`2024 Results Submitted to DB!`);
  });
});

const updateFixtureForCurrentRound = async () => {
  const standingsReference2024 = db.collection("standings").doc("2024");
  const roundsRecord = standingsReference2024.collection("rounds");
  const currentRound = await db.collection('standings').doc('2024').get()
  const roundResponse = currentRound.data()
  let round = roundResponse.currentRound

  axios.get(`https://api.squiggle.com.au/?q=games;year=2024;round=${round}`, {
    headers: {
      "User-Agent": "easytippingdev@gmail.com",
    },
  }).then(async (res) => {

    let roundArray: any = []
    const roundsDoc = roundsRecord.doc(`${round}`);
    res.data.games.forEach(async (element: any) => {
      roundArray.push(element)
    });
    roundsDoc.set({ roundArray })
  });
};

export const getCurrentRound = functions.region('australia-southeast1').https.onRequest(async (request, response) => {
  const standingsReference2024 = db.collection("standings").doc("2024");
  let roundsNotPlayed: any = []

  axios.get("https://api.squiggle.com.au/?q=games;year=2024", {
    headers: {
      "User-Agent": "easytippingdev@gmail.com",
    },
  }).then(async (res) => {
    res.data.games.forEach(async (element: any) => {
      if (element.timestr === null) {
        roundsNotPlayed.push(element.round)
        return
      }
    });

    const currentRound = Math.min(...roundsNotPlayed)
    standingsReference2024.set({ currentRound })
    response.send(`Current round: ${currentRound}`);
  });
});

export const updateCurrentRound = functions.region('australia-southeast1').pubsub
  .schedule('0 0 * * *')
  .timeZone('Australia/Sydney')
  .onRun((context) => {
    axios.get('https://australia-southeast1-easytipping-a7ad3.cloudfunctions.net/getCurrentRound').then(() => {
      console.log("Updated cron job successfully")
    }).catch((err) => {
      console.error(err)
    })
  });

//todo batch this current round update into the task listener, and only update the specific match record that just finishes. (can use id that is fetched on the listener)
export const taskRunner = functions.region('australia-southeast1').pubsub
  //* runs every 5 minutes
  .schedule('*/5 * * * *')
  .timeZone('Australia/Sydney')
  .onRun(async () => {
    //* Update match records
    await updateFixtureForCurrentRound();
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


//* This shoule be updated every week or so to ensure fixture changes are accounted for
export const uploadAflMatchSchedule = functions.region('australia-southeast1').https.onRequest(async (request, response) => {


  const aflScheduler = db.collection('tasks').doc('sport').collection('afl')

  axios.get("https://api.squiggle.com.au/?q=games;year=2024", {
    headers: {
      "User-Agent": "easytippingdev@gmail.com",
    },
  }).then(async (res) => {
    res.data.games.map((match: any) => {
      aflScheduler.doc(`${match.id}`).set({
        performAt: match.unixtime,
        status: match.complete === 100 ? 'complete' : 'scheduled',
        complete: match.complete === 100 ? true : false,
        options: {
          matchId: match.id,
          round: match.round,
        }
      })
    })
  })

  response.send(`AFL Matches Successfully Scheduled`);
});

interface Workers {
  [key: string]: (options: any) => Promise<any>
}

const workers: Workers = {
  updateRecord: (options: any) => db.collection('logs').add({
    hello: 'world',
    options: options
  })
}


export const taskListener = functions.region('australia-southeast1').pubsub.schedule('* * * * *').timeZone('Australia/Sydney').onRun(async () => {
  const timeStamp = Timestamp.now().seconds
  const docRef = db.collection('tasks').doc('sport').collection('afl').where('performAt', '<=', timeStamp).where('status', '==', 'scheduled').where('complete', '==', true);
  const tasksToRun = await docRef.get()
  const jobArray: Promise<any>[] = []

  await updateActiveGamesAFL()

  tasksToRun.forEach(async (snapshot: any) => {

    let { options } = snapshot.data();
    const matchId = options.matchId
    const matchWinner: any = await axios.get(`https://api.squiggle.com.au/?q=games;game=${matchId}`, {
      headers: {
        "User-Agent": "easytippingdev@gmail.com",
      },
    })

    const winner = matchWinner.data.games[0].winner;
    options = {
      ...options,
      winner: abbreviateTeam(winner)
    }

    const job = workers['updateRecord'](options).then(() => {
      snapshot.ref.update({
        status: 'complete',
        complete: true,
      })
    }).catch(() => {
      snapshot.ref.update({
        status: 'error'
      })
    })

    jobArray.push(job)
  })

  return await Promise.all(jobArray)
})


const updateActiveGamesAFL = async () => {

  const currentRound = await db.collection('standings').doc('2024').get()
  const roundResponse = currentRound.data()
  let round = roundResponse.currentRound

  await axios.get(`https://api.squiggle.com.au/?q=games;year=2024;round=${round}`, {
    headers: {
      "User-Agent": "easytippingdev@gmail.com",
    },
  }).then((response) => {
    response.data.games.map(async (match: any) => {

      const matchRef = db.collection('tasks').doc('sport').collection('afl').doc(`${match.id}`)
      const matchData = await matchRef.get();
      const { status } = matchData.data()

      if (match.complete > 0 && match.complete < 100) {
        matchRef.update({
          status: 'in progress'
        })
      } else if (match.complete === 100 && status !== 'complete') {
        matchRef.update({
          status: 'scheduled',
          complete: true,
        })
      }
    })
  })
}

const abbreviateTeam = (teamName: string) => {

  switch (teamName) {
    case 'Richmond':
      return 'RIC'
    case 'Carlton':
      return 'CAR'
    case 'Sydney':
      return 'SYD'
    case 'Collingwood':
      return 'COL'
    case 'Hawthorn':
      return 'HAW'
    case 'Essendon':
      return 'ESS'
    case 'Brisbane Lions':
      return 'BRI'
    case 'Fremantle':
      return 'FRE'
    case 'St Kilda':
      return 'STK'
    case 'Geelong':
      return 'GEL'
    case 'Adelaide':
      return 'ADE'
    case 'Gold Coast':
      return 'GCS'
    case 'North Melbourne':
      return 'NOR'
    case 'Greater Western Sydney':
      return 'GWS'
    case 'Western Bulldogs':
      return 'WBD'
    case 'Melbourne':
      return 'MEL'
    case 'West Coast':
      return 'WCE'
    case 'Port Adelaide':
      return 'POR'
    default:
      return 'Team not found'
  }
}




