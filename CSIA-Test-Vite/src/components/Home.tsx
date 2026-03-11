import { useAuth } from "../AuthContext";
import { supabase } from "../supabase-client";
import { useEffect } from "react";
import { useState } from "react";
import { Account } from "../classes/Account";
import { Player } from "../classes/Player";
import { useNavigate } from "react-router-dom";

function Home() {
  const { account } = useAuth();
  const [name, setName] = useState("");
  const navigate = useNavigate();
  // const [role, setRole] = useState("");
  const [isPlayer, setIsPlayer] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [inLeague, setInLeague] = useState(false);

  console.log(account);

  useEffect(() => {
    //run code after render
    // async function fetchUser() {
    //   if (!account?.getUserId()) {
    //     console.error("Account does not exist");
    //     return;
    //   }

    //   const { data, error } = await supabase
    //     .from("Account")
    //     .select("name")
    //     .eq("userId", account.getUserId())
    //     .single();

    //   console.log("query data:", data);
    //   console.log("query error:", error);

    //   if (error) {
    //     console.error("Error fetching account:", error);
    //     return;
    //   }

    if (!account?.getUserId()) {
      console.error("Account does not exist");
      return;
    }
    if (account.role !== "admin") {
      if (account.getLeagueId() !== null) {
        //determine if show prediction
        setInLeague(true);
      }
    }
    setName(account.name);

    let role = account.getRole();
    if (role === "player") setIsPlayer(true);
    if (role === "admin") setIsAdmin(true);
    if (role === "organizer") setIsOrganizer(true);
    console.log("Role: " + role);
  }, [account]); //run when account changes

  return (
    <div className="container text-center mt-5">
      <h1 className="display-4">Welcome {account?.getName() || ""}</h1>
      <h2 className="text-muted mb-4">F1 Predictions</h2>

      <div className="d-flex justify-content-center gap-3">
        {isPlayer && inLeague && (
          <div>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/prediction")}
            >
              Predictions
            </button>
          </div>
        )}

        {!isAdmin && (
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/league")}
          >
            League
          </button>
        )}

        {isAdmin && (
          <button
            className="btn btn-secondary"
            onClick={() => navigate("/result")}
          >
            Load Results
          </button>
        )}
      </div>
    </div>
  );
}

export default Home;
