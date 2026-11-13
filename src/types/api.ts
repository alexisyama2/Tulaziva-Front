// Mirrors the DTOs of Tulaziva.Application (System.Text.Json camelCase).

export type Language = 'es' | 'en';

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'User' | 'Admin' | string;
  preferredLanguage: Language | string;
  latitude: number | null;
  longitude: number | null;
  createdAtUtc: string;
  photoUrl: string | null;
  emailVerified: boolean;
}

export interface AuthResponse {
  token: string;
  expiresAtUtc: string;
  user: User;
  /** Renews the session without the password; replaced every time it is used. */
  refreshToken: string | null;
}

export interface Category {
  id: number;
  key: string;
  name: string;
}

export interface AdImage {
  id: string;
  position: number;
  contentType: string;
  sizeBytes: number;
  url: string;
}

export type AdStatus = 'Active' | 'Removed';

export interface Ad {
  id: string;
  ownerId: string;
  ownerDisplayName: string;
  ownerPhotoUrl: string | null;
  categoryId: number;
  title: string;
  description: string;
  price: number;
  currency: string;
  latitude: number | null;
  longitude: number | null;
  status: AdStatus;
  createdAtUtc: string;
  updatedAtUtc: string;
  expiresAtUtc: string;
  images: AdImage[];
  /** The ad is shown first in the searches while this moment is in the future. */
  featuredUntilUtc: string | null;
}

export interface AdSummary {
  id: string;
  categoryId: number;
  title: string;
  price: number;
  currency: string;
  latitude: number | null;
  longitude: number | null;
  distanceKm: number | null;
  coverImageUrl: string | null;
  createdAtUtc: string;
  featuredUntilUtc: string | null;
}

export interface AdInput {
  categoryId: number;
  title: string;
  description: string;
  price: number;
  currency: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface AdSearchParams {
  text?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  page?: number;
  pageSize?: number;
}

export interface Participant {
  id: string;
  displayName: string;
  photoUrl: string | null;
  /** The account was deleted: the chat stays but nobody can write in it. */
  deleted: boolean;
}

export interface MessagePreview {
  senderId: string;
  text: string | null;
  hasAttachments: boolean;
  createdAtUtc: string;
}

export interface Conversation {
  id: string;
  adId: string;
  adTitle: string;
  otherParticipant: Participant;
  lastMessage: MessagePreview | null;
  unreadCount: number;
  createdAtUtc: string;
  lastMessageAtUtc: string;
}

export interface Attachment {
  id: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  url: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string | null;
  createdAtUtc: string;
  readAtUtc: string | null;
  attachments: Attachment[];
}

export interface AdminAttachment {
  id: string;
  conversationId: string;
  senderId: string;
  senderDisplayName: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  createdAtUtc: string;
  url: string;
}

export interface CreateAdminInput {
  email: string;
  password: string;
  displayName: string;
  language?: Language;
}

/** RFC 7807 problem details as returned by the API (validation problems add `errors`). */
export interface ProblemDetails {
  title?: string;
  detail?: string;
  status?: number;
  errors?: Record<string, string[]>;
}

export type ReportReason = 'spam' | 'fraud' | 'inappropriate' | 'prohibited' | 'other';
export type ReportStatus = 'open' | 'resolved' | 'dismissed';

export interface Report {
  id: string;
  adId: string;
  adTitle: string;
  /** "active" or "removed" while the ad exists, "deleted" when its owner deleted it. */
  adState: 'active' | 'removed' | 'deleted';
  reporterId: string;
  reporterDisplayName: string;
  reason: ReportReason;
  details: string | null;
  status: ReportStatus;
  createdAtUtc: string;
  resolvedAtUtc: string | null;
}

export interface UpdateProfileInput {
  displayName: string;
  language?: Language;
  latitude?: number | null;
  longitude?: number | null;
}

/** Pushed by the live channel when someone writes to the signed-in user. */
export interface MessageNotification {
  message: Message;
  senderDisplayName: string;
  adTitle: string;
}

export interface BlockedUser {
  id: string;
  displayName: string;
  photoUrl: string | null;
  blockedAtUtc: string;
}

export interface FeaturingOptions {
  /** Whether owners can feature their own ads (otherwise only admins can). */
  ownersCanFeature: boolean;
  /** The durations that can be chosen, in days. */
  plans: number[];
}
