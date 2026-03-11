import React, { useEffect, useState, useRef } from "react";

import SignIn from "./components/SignIn";
import Home from "./components/Home";
import { Routes, Route } from "react-router-dom";
import { supabase } from "./supabase-client";
import League from "./components/League";
import JoinLeague from "./components/JoinLeague";
import Prediction from "./components/Prediction";
import loadDatabase from "./functions/loadDatabase";
import MakePrediction from "./components/Player Pages/MakePrediction";
import loadAdmin from "./functions/loadAdmin";
import Result from "./components/Admin Pages/Result";

function App() {
  const [session, setSession] = useState<any>(null); //null if signed out

  const fetchSession = async () => {
    const currentSession = await supabase.auth.getSession();
    setSession(currentSession.data.session);
  };

  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    async function runLoad() {
      const { error: raceNumError } = await supabase //get race num
        .from("CurrentRaceNum")
        .insert({ id: 1, currentRaceNum: -1 });
      if (raceNumError) {
        console.error("Error inserting raceNum", raceNumError.message);
        return;
      }
    }

    runLoad();
  }, []);

  useEffect(() => {
    //listener to update page on session change
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      },
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    console.log("Logged Out");
    setSession(fetchSession);
  };

  return (
    <div>
      {session ? (
        <>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/league" element={<League />} />
            <Route path="/league/join" element={<JoinLeague />} />
            <Route path="/prediction" element={<Prediction />} />
            <Route path="/prediction/make" element={<MakePrediction />} />
            <Route path="/result" element={<Result />} />
          </Routes>

          <button
            className="btn btn-danger mt-3"
            type="button"
            onClick={logout}
          >
            Log Out
          </button>
        </>
      ) : (
        <SignIn />
      )}
    </div>
  );
}

export default App;
