import { Category } from "./category";

// trieda User - asi na uloženie údajov o užívateľovi
export class User {

  // statická metóda na kopírovanie užívateľa - aby sme mal kópiu bez pokazenia originálu
  public static clone(user: User): User {
    // vytvárame novú User s rovnakými údajmi
    return new User(user.name, user.email, user.id, user.lastLogin, user.active, user.password);
  }

  constructor(
    public name: string, // meno užívateľa
    public email: string, // emailová adresa
    public id?: number, // ID užívateľa - číslo na identifikáciu (nepovinné)
    public lastLogin?: Date, // kedy sa užívateľ naposledy prihlásil (nepovinné)
    public active: boolean = true, // či je účet aktívny alebo nie - na začiatku je true
    public password: string = '' // heslo - na začiatku je prázdne
  ){}

  // metóda na vypísanie užívateľa - aby sme videli ID a meno
  toString() {
    // vraciame text v tvare [ID, meno] - napr. [5, Janko]
    return `[${this.id}, ${this.name}]`;
  }
}