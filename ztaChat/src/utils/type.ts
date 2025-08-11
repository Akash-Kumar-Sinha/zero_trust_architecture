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
  ProfileImage?: string;
  Status: UserStatus;
  LastSeen?: Date;
  AboutMe?: string;
};

export type UserProfile = GormModel & {
  Username: string;
  ProfileImage: string;
};

export type RequestStatus = "pending" | "accepted" | "rejected";
export type ContentType =
  | "text"
  | "image"
  | "video"
  | "file"
  | "audio"
  | "link";
export type ConversationType = "one_to_one" | "group";
export type UserStatus = "online" | "offline";

export type FriendRequests = GormModel & {
  RequesterID?: number;
  Requester?: Profile;

  ReceiverID?: number;
  Receiver?: Profile;

  Status: RequestStatus;
};

export type Conversation = GormModel & {
  ConversationType: ConversationType;
  PublicKey?: string;
  PrivateKey?: string;
  Profile1: Profile;
  Profile1ID: number;
  Profile2: Profile;
  Profile2ID: number;
  Members: ConversationMember[];
  Messages: Message[];
};

export type ConversationMember = GormModel & {
  ConversationID: number;
  UserID: number;
  User: Profile;
};

export type Message = GormModel & {
  ConversationID: number;
  SenderID: number;
  Sender: Profile;
  IsRead: boolean;
  Content: MessageContent[];
};

export type MessageContent = GormModel & {
  MessageID: number;
  ContentType: ContentType;
  Content: string;
};
