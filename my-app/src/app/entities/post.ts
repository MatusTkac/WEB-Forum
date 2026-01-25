// trieda Post - asi na uloženie príspevku na fóre
export class Post {
  constructor(
    public title: string, // nadpis príspevku - čo sa v ňom píše
    public text: string, // obsah príspevku - samotný text
    public author?: string, // kto príspevok vytvoril (nepovinné)
    public replyToId?: number, // ak je to odpoveď, ID pôvodného príspevku (nepovinné)
    public id?: number, // ID príspevku - číslo na identifikáciu (nepovinné)
    public category?: string, // kategória príspevku - napr. "Technology", "General Discussion" (nepovinné)
    public createdAt?: string // dátum vytvorenia - kedy bol príspevok napísaný (nepovinné)
  ) {}

  // statická metóda na kopírovanie príspevku - aby sme mal kópiu
  static clone(post: Post): Post {
    // vytvárame novú Post s rovnakými údajmi ako pôvodný
    return new Post(post.title, post.text, post.author, post.replyToId, post.id, post.category, post.createdAt);
  }
}