// trieda Category - na uloženie kategórie príspevku na fóre
export class Category {

  // statická metóda na kopírovanie kategórie - aby sme mal kópiu a nepokazili originál
  public static clone(category: Category): Category {
    // vytvárame novú Category s rovnakými údajmi
    return new Category(category.name, category.description, category.id);
  }

  constructor(
    public name: string, // meno kategórie - napr. "General Discussion", "Technology"
    public description: string, // popis kategórie - čo do nej patrí
    public id?:number // ID kategórie - na začiatku nepovinné (znak ?)
  ){}
}