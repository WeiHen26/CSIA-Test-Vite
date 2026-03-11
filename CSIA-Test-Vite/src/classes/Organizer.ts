import { Account } from "./Account";
import { Player } from "./Player";

export class Organizer extends Account{
    private players: Player[]; //list of players in league
    private leagueId: string; //needed to join league
    private leagueName: string;
    

    constructor(leagueId: string, leagueName: string, userId: string, email: string, name: string, role: string){
        super(userId, email, name, role);
        this.leagueId = leagueId; 
        this.leagueName = leagueName;
        this.players = [];
        
    }
    public getPlayers(){
        return this.players;
    }
    public getLeagueId(){
        return this.leagueId;
    }
    public getLeagueName(){
        return this.leagueName;
    }
    

}