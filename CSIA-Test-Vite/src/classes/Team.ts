import { Driver } from "./Driver";
export class Team{
    private name: string;
    private drivers: Driver[];
    private points: number[];

    constructor(name: string, drivers: Driver[], points: number[]){
        this.name = name;
        this.drivers = drivers;
        this.points = points;
    }

}