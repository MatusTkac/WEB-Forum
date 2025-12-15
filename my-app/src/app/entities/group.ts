// trieda Group - asi na uloženie skupiny užívateľov s právami
export class Group {

  // statická metóda na kopírovanie skupiny - asi aby sme mal kópiu a nepokazili originál
  public static clone(group: Group): Group {
    // vytvárame novú Group s rovnakými údajmi
    // [...group.permissions] - takto vytvárame novú kopiu poľa permissions
    return new Group(group.name, [...group.permissions], group.id);
  }

  constructor(
    public name: string, // meno skupiny - napr. "Admin", "User"
    public permissions: string[], // pole oprávnení - čo môže táto skupina robiť
    public id?:number // ID skupiny - na začiatku nepovinné (znak ?)
  ){}
}