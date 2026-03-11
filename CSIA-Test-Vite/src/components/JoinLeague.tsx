import React, { useState } from "react";

import { supabase } from "../supabase-client";
import { useAuth } from "../AuthContext";
import { Player } from "../classes/Player";
import { Organizer } from "../classes/Organizer";
import { useNavigate } from "react-router-dom";

function JoinLeague() {
  const [inputLeagueId, setInputLeagueId] = useState("");
  const [inputLeaguename, setInputLeagueName] = useState("");
  const { account, setAccount } = useAuth();

  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!account) {
      console.error("No account found");
      return;
    }

    console.log("test");

    const { data: organizer, error: organizerError } = await supabase //find the league with the same id
      .from("Organizer")
      .select("*")
      .eq("leagueId", inputLeagueId)
      .single();
    if (organizerError) {
      console.error("This league ID does not exist", organizerError.message);
      return;
    }

    if (organizer.leagueName === inputLeaguename) {
      //league names match
      const { data: player, error: playerError } = await supabase //update player's leagueId
        .from("Player")
        .update({ leagueId: organizer.leagueId })
        .eq("userId", account.getUserId());
      if (playerError) {
        console.error("Error updating player leagueID", playerError.message);
        return;
      }

      setAccount(
        //update the player with leagueId
        new Player(
          account.getUserId(),
          account.getEmail(),
          account.getName(),
          account.getRole(),
          organizer.leagueId,
          account.getTotalPoints(),
          account.getGainedPoints(),
        ),
      );

      const { error: insertError } = await supabase //add player to league player list
        .from("players")
        .insert([
          { leagueId: organizer.leagueId, playerId: account.getUserId() },
        ]);
      if (insertError) {
        console.error("Error inserting into players", insertError.message);
        return;
      }
      console.log("Successfully updated league");
      navigate("/league");

      //add to leaderboard as 0
      //find leaderbaord length
      const { data: leaderboard, error: leaderboardError } = await supabase
        .from("leaderboard")
        .select("position")
        .eq("leagueId", organizer.leagueId);
      if (leaderboardError) {
        console.error("Error fetching leaderboard", leaderboardError.message);
        return;
      }

      let leaderboardLength = 1;
      if (leaderboard) {
        leaderboardLength = leaderboard.length;
      }

      const { error: leaderboardInsertError } = await supabase //add player leaderboard
        .from("leaderboard")
        .insert([
          {
            leagueId: organizer.leagueId,
            userId: account.getUserId(),
            position: leaderboardLength,
            name: account.getName(),
            totalPoints: 0,
            gainedPoints: 0,
          },
        ]);
      if (leaderboardInsertError) {
        console.error(
          "Error inserting into players",
          leaderboardInsertError.message,
        );
        return;
      }
    }
  }

  return (
    <div>
      <h3 className="text-center mb-4">Join League</h3>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">League Name</label>
          <input
            type="text"
            className="form-control"
            value={inputLeaguename}
            onChange={(e) => setInputLeagueName(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">LeagueId</label>
          <input
            type="text"
            className="form-control"
            value={inputLeagueId}
            onChange={(e) => setInputLeagueId(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary w-100">
          Submit Request
        </button>
      </form>

      <div>
        <button className="btn btn-primary" onClick={() => navigate("/league")}>
          Back
        </button>
      </div>
    </div>
  );
}

export default JoinLeague;
