import { supabase } from "../supabase-client";

function loadDatabase(){
   

    type DriverSeed = {
  name: string;
};

type TeamSeed = {
  name: string;
  driverA: string;
  driverB: string;
};

const drivers: DriverSeed[] = [
  { name: "Lando Norris" },
  { name: "Oscar Piastri" },
  { name: "Charles Leclerc" },
  { name: "Lewis Hamilton" },
  { name: "Max Verstappen" },
  { name: "Liam Lawson" },
  { name: "George Russell" },
  { name: "Kimi Antonelli" },
  { name: "Fernando Alonso" },
  { name: "Lance Stroll" },
  { name: "Pierre Gasly" },
  { name: "Jack Doohan" },
  { name: "Esteban Ocon" },
  { name: "Oliver Bearman" },
  { name: "Yuki Tsunoda" },
  { name: "Isack Hadjar" },
  { name: "Alexander Albon" },
  { name: "Carlos Sainz" },
  { name: "Nico Hulkenberg" },
  { name: "Gabriel Bortoleto" },
];

const teams: TeamSeed[] = [
  { name: "McLaren", driverA: "Lando Norris", driverB: "Oscar Piastri" },
  { name: "Ferrari", driverA: "Charles Leclerc", driverB: "Lewis Hamilton" },
  { name: "Red Bull Racing", driverA: "Max Verstappen", driverB: "Liam Lawson" },
  { name: "Mercedes", driverA: "George Russell", driverB: "Kimi Antonelli" },
  { name: "Aston Martin", driverA: "Fernando Alonso", driverB: "Lance Stroll" },
  { name: "Alpine", driverA: "Pierre Gasly", driverB: "Jack Doohan" },
  { name: "Haas F1 Team", driverA: "Esteban Ocon", driverB: "Oliver Bearman" },
  { name: "Racing Bulls", driverA: "Yuki Tsunoda", driverB: "Isack Hadjar" },
  { name: "Williams", driverA: "Alexander Albon", driverB: "Carlos Sainz" },
  { name: "Kick Sauber", driverA: "Nico Hulkenberg", driverB: "Gabriel Bortoleto" },
];

async function loadF12025Lineup() {
  // 1) insert drivers
  const driverRows = drivers.map((driver) => ({
    name: driver.name,
    points: 0,
  }));

  const { error: insertDriversError } = await supabase
    .from("Driver")
    .insert(driverRows);

  if (insertDriversError) {
    console.error("Error inserting drivers:", insertDriversError.message);
    return;
  }

  console.log("Drivers inserted successfully");

  // 2) fetch inserted drivers to get driverId values
  const { data: insertedDrivers, error: fetchDriversError } = await supabase
    .from("Driver")
    .select("driverId, name");

  if (fetchDriversError) {
    console.error("Error fetching drivers:", fetchDriversError.message);
    return;
  }

  const driverIdMap = new Map<string, number>();
  insertedDrivers.forEach((driver) => {
    driverIdMap.set(driver.name, driver.driverId);
  });

  // 3) build team rows using fetched driver IDs
  const teamRows = teams.map((team) => {
    const driverIdA = driverIdMap.get(team.driverA);
    const driverIdB = driverIdMap.get(team.driverB);

    if (driverIdA == null || driverIdB == null) {
      throw new Error(
        `Missing driverId for team ${team.name}: ${team.driverA} / ${team.driverB}`,
      );
    }

    return {
      name: team.name,
      driverIdA,
      driverIdB,
      points: 0,
    };
  });

  // 4) insert teams
  const { error: insertTeamsError } = await supabase
    .from("Team")
    .insert(teamRows);

  if (insertTeamsError) {
    console.error("Error inserting teams:", insertTeamsError.message);
    return;
  }

  console.log("Teams inserted successfully");
    }
loadF12025Lineup();

}

export default loadDatabase;