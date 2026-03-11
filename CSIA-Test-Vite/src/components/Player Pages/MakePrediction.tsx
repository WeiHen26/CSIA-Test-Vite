import React, { useState, useEffect } from "react";
import { supabase } from "../../supabase-client";
import { useAuth } from "../../AuthContext";
import { Organizer } from "../../classes/Organizer";
import { useNavigate } from "react-router-dom";

function MakePrediction() {
  const { account } = useAuth();
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<string[]>([]);
  const [firstIndex, setFirstIndex] = useState(-1);
  const [raceNum, setRaceNum] = useState(-1);

  async function handleSubmit() {
    const orderedDrivers = [...drivers];
    console.log("Ordered prediction:", orderedDrivers);

    //get race number
    const { data: organizer, error: organizerError } = await supabase
      .from("Organizer")
      .select("*")
      .eq("leagueId", account.getLeagueId())
      .single();
    if (organizerError) {
      console.error("Error fetching organizer", organizerError.message);
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

    let currentRaceNumber = raceNum.currentRaceNum;
    setRaceNum(currentRaceNumber);

    //check if there is already a prediction for this race
    const { data: predictionCheck, error: predictionCheckError } =
      await supabase
        .from("driversRace")
        .select("*")
        .eq("raceNumber", currentRaceNumber);

    if (predictionCheck && predictionCheck.length > 0) {
      //There is a prediction ==> override

      for (let position = 1; position <= orderedDrivers.length; position++) {
        const { error: predictionError } = await supabase
          .from("driversRace")
          .update({
            driverName: orderedDrivers[position - 1],
          })
          .eq("userId", account.getUserId())
          .eq("raceNumber", currentRaceNumber)
          .eq("position", position);

        if (predictionError) {
          console.error("Error inserting prediction", predictionError.message);
          return;
        }
      }
    } else {
      //make new prediciton
      for (let position = 1; position <= orderedDrivers.length; position++) {
        const { error: predictionError } = await supabase
          .from("driversRace")
          .insert([
            {
              userId: account.getUserId(),
              raceNumber: currentRaceNumber,
              position: position,
              driverName: orderedDrivers[position - 1],
            },
          ]);
        if (predictionError) {
          console.error("Error inserting prediction", predictionError.message);
          return;
        }
      }
    }

    navigate("/prediction");

    // example:
    // pass orderedDrivers into your player update function here
    // await updatePlayerPrediction(orderedDrivers);
  }

  function handleClick(index: number) {
    //first click
    if (firstIndex === -1) {
      setFirstIndex(index);
      return;
    }

    //second click ==> swap
    if (index !== firstIndex) {
      const copy = [...drivers]; //creates array same as drivers
      const holder = copy[firstIndex];
      copy[firstIndex] = copy[index];
      copy[index] = holder;
      setDrivers(copy);
    }

    //reset (only on second)
    setFirstIndex(-1);
  }

  useEffect(() => {
    loadDrivers();
  }, []);

  async function loadDrivers() {
    const { data, error } = await supabase.from("Driver").select("name");

    if (error) {
      console.error("Error loading drivers:", error);
      return;
    }

    if (data) {
      const names = data.map((driver) => driver.name);
      setDrivers(names);
    }
  }

  return (
    <div className="container mt-4" style={{ maxWidth: "500px" }}>
      <h1 className="mb-3">Make Prediction</h1>
      <p className="text-muted">Click two drivers to swap their positions.</p>
      <h6 className="text-muted">Race Number {raceNum}</h6>
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
        Submit Prediction
      </button>
      <div className="d-flex justify-content-center gap-3 mt-4">
        <button
          className="btn btn-primary"
          onClick={() => navigate("/prediction")}
        >
          Back
        </button>
      </div>
    </div>
  );
}

export default MakePrediction;
