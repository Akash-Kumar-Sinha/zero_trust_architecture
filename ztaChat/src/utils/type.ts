export type GormModel = {
  ID: Number;
  CreatedAt: Date;
  UpdatedAt: Date;
  DeletedAt: Date | null;
};

export type Profile = GormModel & {
  Email: string;
  PublicKey: string;
  Username: string;
  ProfileImage: string;
  Status: string;
  LastSeen: Date;
  AboutMe: string;
};

export type UserProfile = GormModel & {
  Username: string;
  ProfileImage: string;
};
