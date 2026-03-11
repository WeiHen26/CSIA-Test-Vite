import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase-client";
import { Player } from "./classes/Player";
import { Organizer } from "./classes/Organizer";
import { Account } from "./classes/Account";

type AuthContextType = {
  account: any;
  setAccount: React.Dispatch<React.SetStateAction<any>>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<any>(null);

  useEffect(() => {
    async function loadAccount() {
      //so data is refreshed on page refresh

      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession(); //get user session from supabase

      if (sessionError) {
        console.error("Error getting session:", sessionError.message);
        return;
      }

      const user = sessionData.session?.user;
      if (!user) {
        setAccount(null);
        return;
      }

      const { data: profile, error: profileError } = await supabase //fetch account from supabase
        .from("Account")
        .select("*")
        .eq("userId", user.id)
        .single();
      if (profileError) {
        console.error("Error fetching profile:", profileError.message);
        return;
      }

      if (profile.role === "player") {
        const { data: player, error: playerError } = await supabase //fetch account from supabase
          .from("Player")
          .select("*")
          .eq("userId", user.id)
          .single();
        if (playerError) {
          console.error("Error fetching profile:", playerError.message);
          return;
        }
        setAccount(
          new Player(
            profile.userId,
            profile.email,
            profile.name,
            profile.role,
            player.leagueId,
            player.totalPoints,
            player.gainedPoints,
          ),
        );
      } else if (profile.role === "organizer") {
        const { data: organizer, error: organizerError } = await supabase
          .from("Organizer")
          .select("*")
          .eq("userId", profile.userId)
          .single();

        if (organizerError) {
          console.error("Error fetching organizer:", organizerError.message);
          return;
        }

        setAccount(
          new Organizer(
            organizer.leagueId,
            organizer.leagueName,
            profile.userId,
            profile.email,
            profile.name,
            profile.role,
            organizer.currentRaceNumber,
          ),
        );
      }
      if (profile.role === "admin") {
        //admin
        setAccount(
          new Account(
            profile.userId,
            profile.email,
            profile.name,
            profile.role,
          ),
        );
      }
    }

    loadAccount();
  }, []);

  return (
    <AuthContext.Provider value={{ account, setAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
