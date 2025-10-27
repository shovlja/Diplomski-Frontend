// src/features/notifications/types.ts

export type NotificationKind =
  | "team_invite"
  | "team_joined"
  | "team_kicked"
  | "team_role_changed"
  | "invite_accepted"
  | "member_left";

export type NotificationBase = {
  id: number;
  kind: NotificationKind;
  created_at: string; // ISO
  is_read: boolean;
};

/* ---------- Payloads ---------- */
export type TeamInvitePayload = {
  team_id: number;
  team_name: string;
  inviter_name: string;
};

export type TeamJoinedPayload = {
  team_id: number;
  team_name: string;
};

export type TeamKickedPayload = {
  team_id: number;
  team_name: string;
};

export type TeamRoleChangedPayload = {
  team_id: number;
  team_name: string;
  role: "developer" | "manager" | "owner";
};

export type ActorPayload = {
  actor_display_name: string;
  actor_avatar_url?: string | null;
};

export type InviteAcceptedPayload = ActorPayload & {
  team_id: number;
  team_name: string;
};

export type MemberLeftPayload = ActorPayload & {
  team_id: number;
  team_name: string;
};

/* ---------- Discriminated unions ---------- */
export type TeamInviteNotification = NotificationBase & {
  kind: "team_invite";
  payload: TeamInvitePayload;
};

export type TeamJoinedNotification = NotificationBase & {
  kind: "team_joined";
  payload: TeamJoinedPayload;
};

export type TeamKickedNotification = NotificationBase & {
  kind: "team_kicked";
  payload: TeamKickedPayload;
};

export type TeamRoleChangedNotification = NotificationBase & {
  kind: "team_role_changed";
  payload: TeamRoleChangedPayload;
};

export type InviteAcceptedNotification = NotificationBase & {
  kind: "invite_accepted";
  payload: InviteAcceptedPayload;
};

export type MemberLeftNotification = NotificationBase & {
  kind: "member_left";
  payload: MemberLeftPayload;
};

export type Notification =
  | TeamInviteNotification
  | TeamJoinedNotification
  | TeamKickedNotification
  | TeamRoleChangedNotification
  | InviteAcceptedNotification
  | MemberLeftNotification;
