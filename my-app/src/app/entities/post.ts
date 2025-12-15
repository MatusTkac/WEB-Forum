// trieda Post - asi na uloženie príspevku na fóre
export class Post {
  constructor(
    public title: string, // nadpis príspevku - čo sa v ňom píše
    public text: string, // obsah príspevku - samotný text
    public id?: number, // ID príspevku - číslo na identifikáciu (nepovinné)
    public createdAt?: string // dátum vytvorenia - kedy bol príspevok napísaný (nepovinné)
  ) {}

  // statická metóda na kopírovanie príspevku - aby sme mal kópiu
  static clone(post: Post): Post {
    // vytvárame novú Post s rovnakými údajmi ako pôvodný
    return new Post(post.title, post.text, post.id, post.createdAt);
  }
}