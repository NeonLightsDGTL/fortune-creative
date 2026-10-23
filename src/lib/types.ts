export interface Client {
  id: string;
  name: string;
  url: string | null;
  image_path: string | null;
  position: number;
  created_at: string;
}

export interface CarouselSlide {
  id: string;
  client_name: string;
  caption: string | null;
  url: string | null;
  image_path: string | null;
  position: number;
  created_at: string;
}

export interface Tag {
  id: string;
  kind: "release" | "coverage";
  name: string;
}

export interface Release {
  id: string;
  slug: string;
  headline: string;
  release_date: string;
  tag_id: string | null;
  thumbnail_path: string | null;
  blurb: string | null;
  body: string | null;
  include_contact_block: boolean;
  status: "draft" | "published";
  created_at: string;
  updated_at: string;
  tags?: Tag;
}

export interface Coverage {
  id: string;
  headline: string;
  outlet: string;
  url: string;
  published_date: string;
  tag_id: string | null;
  thumbnail_path: string | null;
  blurb: string | null;
  status: "draft" | "published";
  created_at: string;
  updated_at: string;
  tags?: Tag;
}

export interface About {
  id: number;
  photo_path: string | null;
  photo_credit: string | null;
  bio: string | null;
  updated_at: string;
}

export interface Signup {
  id: string;
  email: string;
  created_at: string;
}
