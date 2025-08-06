export type GormModel = {
  ID: number;
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

export type RequestStatus = "pending" | "accepted" | "rejected";

export type FriendRequests = GormModel & {
  RequesterID?: number;
  Requester?: Profile;

  ReceiverID?: number;
  Receiver?: Profile;

  Status: RequestStatus;
};
