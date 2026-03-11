import { useAuth } from "../AuthContext";
import { supabase } from "../supabase-client";
import { useEffect } from "react";
import { useState } from "react";
import { Account } from "../classes/Account";
import { Player } from "../classes/Player";
import { Organizer } from "../classes/Organizer";
import { useNavigate } from "react-router-dom";

type LeaderboardRow = {
  leagueId: string;
  userId: string;
  position: number;
  name: string;
  totalPoints: number;
  gainedPoints: number;
};

function League() {
  const navigate = useNavigate();
  const { account } = useAuth();
  const [isPlayer, setIsPlayer] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [leagueName, setLeagueName] = useState("Not in a League");
  const [inLeague, setInLeague] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [leagueId, setLeagueId] = useState("");
  const [currentRaceNumber, setCurrentRaceNumber] = useState(-1);

  useEffect(() => {
    async function loadPage() {
      //run code after render
      if (!account?.getUserId()) {
        console.error("Account does not exist");
        return;
      }

      let currentLeagueId = "";

      const { data: raceNum, error: raceNumError } = await supabase //get race num
        .from("CurrentRaceNum")
        .select("currentRaceNum")
        .single();
      if (raceNumError) {
        console.error("Error fetching user in sign up", raceNumError.message);
        return;
      }

      if (account.role === "player") {
        setIsPlayer(true);

        if (account.getLeagueId() !== "") {
          //fetch the league's organizer

          const { data: organizer, error: organizerError } = await supabase
            .from("Organizer")
            .select("*")
            .eq("leagueId", account.getLeagueId())
            .single();
          if (organizerError) {
            console.error("Error fetching organizer", organizerError.message);
            return;
          }

          setLeagueName(organizer.leagueName);
          setInLeague(true);
          setLeagueId(organizer.leagueId);
          currentLeagueId = organizer.leagueId;
        }
      }

      if (account.role === "organizer") {
        //organizer
        setIsOrganizer(true);

        setLeagueName(account.getLeagueName());
        setInLeague(true);

        const { data: organizer, error: organizerError } = await supabase //get leagueId
          .from("Organizer")
          .select("*")
          .eq("userId", account.getUserId())
          .single();
        if (organizerError) {
          console.error("Error fetching organizer", organizerError.message);
          return;
        }
        setLeagueId(organizer.leagueId);
        currentLeagueId = organizer.leagueId;
      }

      if (currentLeagueId !== "") {
        const { data: leaderboardData, error: leaderboardError } =
          await supabase
            .from("leaderboard")
            .select("*")
            .eq("leagueId", account.getLeagueId())
            .order("position", { ascending: true });

        if (leaderboardError) {
          console.error("Error fetching leaderboard", leaderboardError.message);
          return;
        }

        setLeaderboard((leaderboardData as LeaderboardRow[]) || []);
      }
    }
    loadPage();
  }, [account]);
  return (
    <div className="container text-center mt-5">
      <h1 className="display-4">League </h1>
      <h2 className="text-muted mb-4"> {leagueName} </h2>
      {isOrganizer && (
        <h6 className="text-muted mb-4">League Id: {leagueId} </h6>
      )}

      {inLeague && (
        <div className="mt-4">
          <h3>Leaderboard</h3>
          <h6>Race Number: {currentRaceNumber}</h6>
          <table className="table table-striped table-bordered mt-3">
            <thead>
              <tr>
                <th>Position</th>
                <th>Name</th>
                <th>Total Points</th>
                <th>Points Gained</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.length > 0 ? (
                leaderboard.map((row, index) => (
                  <tr key={index}>
                    <td>{row.position}</td>
                    <td>{row.name}</td>
                    <td>{row.totalPoints}</td>
                    <td>{row.gainedPoints}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4}>No leaderboard data found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="d-flex justify-content-center gap-3">
        {isPlayer && !inLeague && (
          <div>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/league/join")}
            >
              Join League
            </button>
          </div>
        )}
        <div>
          <button className="btn btn-primary" onClick={() => navigate("/")}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default League;
