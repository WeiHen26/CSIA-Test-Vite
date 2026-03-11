import React, { useState, useEffect } from "react";
import { supabase } from "../../supabase-client";
import { useAuth } from "../../AuthContext";
import { useNavigate } from "react-router-dom";

function Result() {
  const { account } = useAuth();
  const navigate = useNavigate();

  const [drivers, setDrivers] = useState<string[]>([]);
  const [firstIndex, setFirstIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [raceNum, setRaceNum] = useState(-1);

  let currentRaceNum = -1;

  useEffect(() => {
    if (account && account.getRole() !== "admin") {
      navigate("/");
    }
  }, [account]);

  useEffect(() => {
    async function loadDrivers() {
      const { data, error } = await supabase
        .from("Driver")
        .select("name")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error loading drivers:", error.message);
        return;
      }

      if (data) {
        setDrivers(data.map((driver) => driver.name));
      }

      setLoading(false);

      const { data: raceNum, error: raceNumError } = await supabase //get race num
        .from("CurrentRaceNum")
        .select("currentRaceNum")
        .single();
      if (raceNumError) {
        console.error("Error fetching race Num", raceNumError.message);
        return;
      }

      setRaceNum(raceNum.currentRaceNum);
      currentRaceNum = raceNum.currentRaceNum;
    }

    loadDrivers();
  }, []);

  function handleClick(index: number) {
    if (firstIndex === -1) {
      setFirstIndex(index);
      return;
    }

    if (index !== firstIndex) {
      const copy = [...drivers];
      const holder = copy[firstIndex];
      copy[firstIndex] = copy[index];
      copy[index] = holder;
      setDrivers(copy);
    }

    setFirstIndex(-1);
  }

  let resultDrivers: string[]; //Driver names in order

  let isScored = false;

  async function handleSubmit() {
    resultDrivers = [...drivers];

    console.log("result " + resultDrivers);

    scorePoints();

    while (true) {
      if (isScored) {
        updateLeaderboard();
        break;
      }
    }
  }

  async function scorePoints() {
    console.log("scoring");
    //scoring predictions

    //clear gained points
    const { error: gainedPtsError } = await supabase
      .from("Player")
      .update({ gainedPoints: 0 })
      .not("userId", "is", null);
    if (gainedPtsError) {
      console.error(
        "Could not fetch driver predicitons",
        gainedPtsError.message,
      );
      return;
    }

    for (let position = 1; position <= resultDrivers.length; position++) {
      //iterate through drivers

      const { data: predictions, error: predictionsError } = await supabase //get predictions related to that driver
        .from("driversRace")
        .select("*")
        .eq("driverName", resultDrivers[position - 1])
        .eq("raceNumber", currentRaceNum)
        .order("position", { ascending: true });
      if (predictionsError) {
        console.error(
          "Could not fetch driver predicitons",
          predictionsError.message,
        );
        return;
      }

      for (let j = 0; j < predictions.length; j++) {
        // score predictions; iterate through predictions
        let predictedPos = predictions[j].position;

        let gainedPts = 0;

        if (predictedPos === position) {
          //correct +4 pts
          gainedPts = 4;
        } else if (
          predictedPos === position + 1 ||
          predictedPos === position - 1
        ) {
          //one off + 2 pts
          gainedPts = 2;
        } else if (
          predictedPos === position + 2 ||
          predictedPos === position - 2
        ) {
          //two off + 1 pts
          gainedPts = 1;
        } else {
          //over 2 off
          continue;
        }

        let userId = predictions[j].userId;

        const { data: user, error: userError } = await supabase //get current total and gainedpoints
          .from("Player")
          .select("*")
          .eq("userId", userId)
          .single();
        if (userError) {
          console.error("Could not fetch player", userError.message);
          return;
        }

        let totalPts = user.totalPoints + gainedPts;
        let cumGainedPts = user.gainedPoints + gainedPts;

        const { data: player, error: playerError } = await supabase //update total and gained points
          .from("Player")
          .update({ gainedPoints: cumGainedPts, totalPoints: totalPts })
          .eq("userId", userId);

        if (playerError) {
          console.error("Could not fetch player", playerError.message);
          return;
        }
      }
    }

    console.log("scorePoints ran");
  }

  async function updateLeaderboard() {
    const { data: organizer, error: organizerError } = await supabase //get all leagues
      .from("Organizer")
      .select("leagueId");
    if (organizerError) {
      console.error("Could not fetch organizer", organizerError.message);
      return;
    }

    for (let i = 0; i < organizer.length; i++) {
      //iterate through leagues

      const { data: leaderboard, error: leaderboardError } = await supabase //get that league's leaderboard
        .from("leaderboard")
        .select("*")
        .eq("leagueId", organizer[i].leagueId);

      if (leaderboardError) {
        console.error("Could not fetch leaderbaord", leaderboardError.message);
        return;
      }

      let updatedBoard: PlayerType[] = [];

      for (let j = 0; j < leaderboard.length; j++) {
        placePlayer(updatedBoard, leaderboard[j], 0);
      }
    }

    console.log("updateLeaderboard ran");
  }

  async function handleResetSeason() {
    const { error: playersError } = await supabase
      .from("Player")
      .update({ totalPoints: 0, gainedPoints: 0 })
      .not("userId", "is", null);
    if (playersError) {
      console.error("Error resetting player points", playersError.message);
      return;
    }

    const { error: raceNumError } = await supabase
      .from("CurrentRaceNum")
      .update({ currentRaceNum: 1 })
      .eq("id", 1);
    if (raceNumError) {
      console.error("Error resetting race number", raceNumError.message);
      return;
    }

    setRaceNum(1);
    console.log("Season reset");
  }

  type PlayerType = {
    name: string;
    totalScore: number;
  };

  function placePlayer( //places players into leaderboard
    updatedBoard: PlayerType[] = [],
    player: PlayerType,
    index: number,
  ) {
    if (updatedBoard.length === 0) {
      //first player
      updatedBoard.push(player);
      return;
    }

    if (index >= updatedBoard.length) {
      //last player
      updatedBoard.push(player);
      return;
    }

    if (player.totalScore > updatedBoard[index].totalScore) {
      //player is greater
      updatedBoard.splice(index, 0, player); //push down
      return;
    }

    placePlayer(updatedBoard, player, index + 1); //check next index
  }

  if (loading) {
    return <div className="container mt-4">Loading drivers...</div>;
  }

  return (
    <div className="container mt-4" style={{ maxWidth: "500px" }}>
      <h1 className="mb-3">Submit Result</h1>
      <p className="text-muted">Click two drivers to swap their positions.</p>

      <h6 className="mb-3">Race Number {raceNum}</h6>

      <table className="table table-hover">
        <thead className="table-dark">
          <tr>
            <th style={{ width: "80px" }}>Pos</th>
            <th>Driver</th>
          </tr>
        </thead>

        <tbody>
          {drivers.map((driver, index) => (
            <tr
              key={index}
              className={firstIndex === index ? "table-primary" : ""}
              onClick={() => handleClick(index)}
              style={{ cursor: "pointer" }}
            >
              <td>
                <strong>{index + 1}</strong>
              </td>
              <td>{driver}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="btn btn-primary w-100 mt-3" onClick={handleSubmit}>
        Submit Result
      </button>

      <button className="btn btn-danger w-100 mt-2" onClick={handleResetSeason}>
        Reset Season
      </button>

      <div className="d-flex justify-content-center gap-3 mt-4">
        <button className="btn btn-secondary" onClick={() => navigate("/")}>
          Back
        </button>
      </div>
    </div>
  );
}

export default Result;
