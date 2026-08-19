export type Blog = {
  id?: number | string;
  title?: string;
  slug?: string;
  excerpt?: string;
  coverImage: string;
  images?: string[];
  date: string;
  category?: string;
  author?: string;
  readTime?: string;
};
