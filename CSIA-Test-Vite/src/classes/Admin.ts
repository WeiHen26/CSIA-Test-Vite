import { Account  } from "./Account";
export class Admin extends Account{
    private currentRaceNum: number;

    constructor(userId: string, email: string, name: string, role: string, currentRaceNum: number) {
    super(userId, email, name, role);
    this.currentRaceNum = currentRaceNum;
}

}