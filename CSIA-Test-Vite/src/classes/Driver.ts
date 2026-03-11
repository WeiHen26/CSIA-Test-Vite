export class Driver {
  id: string;
  name: string;
  team?: string;
  number?: number;

  constructor(id: string, name: string, team?: string, number?: number) {
    this.id = id;
    this.name = name;
    this.team = team;
    this.number = number;
  }

  displayName() {
    return this.team ? `${this.name} (${this.team})` : this.name;
  }
}