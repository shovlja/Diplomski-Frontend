export type NotificationKind = "team_invite";

export type NotificationBase = {
  id: number;
  kind: NotificationKind;
  created_at: string;      // ISO
  is_read: boolean;
};

export type TeamInvitePayload = {
  team_id: number;
  team_name: string;
  inviter_name: string;
};

export type TeamJoinedPayload = {
  team_id: number;
  team_name: string;
};

export type TeamInviteNotification = NotificationBase & {
  kind: "team_invite";
  payload: TeamInvitePayload;
};

export type TeamJoinedNotification = NotificationBase & {
  kind: "team_joined";
  payload: TeamInvitePayload; // koristimo team_id, team_name
};


export type Notification = TeamInviteNotification | TeamJoinedNotification;
