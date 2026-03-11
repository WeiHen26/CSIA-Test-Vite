import { useAuth } from "../AuthContext";
import { supabase } from "../supabase-client";
import { useEffect } from "react";
import { useState } from "react";
import { Account } from "../classes/Account";
import { Player } from "../classes/Player";
import { Organizer } from "../classes/Organizer";
import { useNavigate } from "react-router-dom";

type PredictionRow = {
  position: number;
  driverName: string;
};

function Prediction() {
  const navigate = useNavigate();
  const { account } = useAuth();

  const [prediction, setPrediction] = useState<PredictionRow[]>([]);
  const [isPrediction, setIsPrediction] = useState(false);
  const [raceNum, setRaceNum] = useState(-1);

  useEffect(() => {
    async function loadPrediction() {
      if (!account?.getUserId()) {
        console.error("Account does not exist");
        return;
      }

      if (account.getLeagueId() === "") {
        console.error("Player is not in a league");
        return;
      }

      const { data: raceNum, error: raceNumError } = await supabase //get race num
        .from("CurrentRaceNum")
        .select("currentRaceNum")
        .single();
      if (raceNumError) {
        console.error("Error fetching user in sign up", raceNumError.message);
        return;
      }
      setRaceNum(raceNum.currentRaceNum); //get race num

      const { data: predictionData, error: predictionError } = await supabase //returns an array of position and name
        .from("driversRace")
        .select("position, driverName")
        .eq("userId", account.getUserId())
        .eq("raceNumber", raceNum.currentRaceNum)
        .order("position", { ascending: true });

      if (predictionError) {
        console.error("Error fetching prediction", predictionError.message);
        return;
      }

      if (predictionData && predictionData.length > 0) {
        setPrediction(predictionData as PredictionRow[]);
        setIsPrediction(true);
      } else {
        setPrediction([]);
        setIsPrediction(false);
      }
    }

    loadPrediction();
  }, [account]);

  return (
    <div className="container text-center mt-5">
      <h1 className="display-4">Prediction</h1>
      <h2 className="text-muted mb-4">Current Race Number: {raceNum}</h2>

      {isPrediction ? (
        <div className="mt-4">
          <h3>Your Prediction</h3>
          <table className="table table-striped table-bordered mt-3">
            <thead>
              <tr>
                <th>Position</th>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              {prediction.map((row, index) => (
                <tr key={index}>
                  <td>{row.position}</td>
                  <td>{row.driverName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-4">
          <h3>No prediction yet</h3>
        </div>
      )}

      <div className="d-flex justify-content-center gap-3 mt-4">
        <button className="btn btn-primary" onClick={() => navigate("/")}>
          Back
        </button>

        <button
          className="btn btn-primary"
          onClick={() => navigate("/prediction/make")}
        >
          Make Prediction
        </button>
      </div>
    </div>
  );
}

export default Prediction;
