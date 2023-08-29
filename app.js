const exp = require("express");
const app = exp();
const { open } = require("sqlite");
const path = require("path");
const dbpath = path.join(__dirname, "cricketTeam.db");
const sqlite3 = require("sqlite3");
let db = null;
app.use(exp.json());

const init = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    //  console.log("start");
    app.listen(3000);
  } catch (e) {
    Console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
init();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get("/players/", async (req, resp) => {
  const getplayerq = `SELECT * FROM cricket_team;`;
  const team = await db.all(getplayerq);
  resp.send(
    team.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

app.post("/players/", async (req, resp) => {
  const playerDetails = req.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  //console.log(playerName, jerseyNumber, role);
  const addplayer = `INSERT INTO cricket_team
  (player_name,jersey_number,role) 
  VALUES ('${playerName}','${jerseyNumber}','${role}');`;
  const dbresp = await db.run(addplayer);
  const playerId = dbresp.lastID;
  resp.send("Player Added to Team");
});

app.get("/players/:playerId/", async (req, resp) => {
  const { playerId } = req.params;
  const getplayerq = `SELECT * FROM cricket_team WHERE 
    player_id='${playerId}';`;
  const player = await db.get(getplayerq);
  resp.send(convertDbObjectToResponseObject(player));
});

app.put("/players/:playerId/", async (req, resp) => {
  const { playerId } = req.params;
  const playerDetails = req.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updateplayerq = `UPDATE cricket_team SET
     player_name='${playerName}',jersey_number='${jerseyNumber}'
     ,role='${role}' WHERE player_id='${playerId}';`;
  await db.run(updateplayerq);
  resp.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (req, resp) => {
  const { playerId } = req.params;
  const deletequ = `DELETE FROM cricket_team WHERE player_id=${playerId};`;
  await db.run(deletequ);
  resp.send("Player Removed");
});
module.exports = app;
