import { Driver } from "./Driver";
import { Team } from "./Team";
import { Account } from "./Account";

export class Player extends Account{
 
  private leagueId: string;
  private totalPoints: number;
  private gainedPoints: number;
  private driversChamp: Driver[]; //Season final driver prediction
  private teamsChamp: Team[]; //Season final team prediction
  private driversRace: Driver[]; //Driver per race prediction

  constructor(userId: string, email: string, name: string, role: string, leagueId: string, totalPoints: number, gainedPoints: number) {
    super(userId, email, name, role);
    this.driversChamp = [];
    this.teamsChamp = [];
    this.driversRace = [];
    this.leagueId = leagueId;
    this.totalPoints = totalPoints;
    this.gainedPoints = gainedPoints;
  }

  public getLeagueId(){
    return this.leagueId;
  }

  public getTotalPoints(){
    return this.totalPoints;
  }

  public getGainedPoints(){
    return this.gainedPoints;
  }
  


}