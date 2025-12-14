export class Post {
  constructor(
    public title: string,
    public text: string,
    public id?: number,
    public createdAt?: string
  ) {}

  static clone(post: Post): Post {
    return new Post(post.title, post.text, post.id, post.createdAt);
  }
}