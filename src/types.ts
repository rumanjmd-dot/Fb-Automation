export interface FacebookPage {
  id: string;
  name: string;
  followers: number;
  category?: string;
  isSelected?: boolean;
  accessToken?: string;
  avatarUrl?: string;
  verified?: boolean;
}

export interface GeoState {
  key: string;
  name: string;
  code?: string;
  isSelected: boolean;
}

export interface GeoCountry {
  code: string;
  name: string;
  states: GeoState[];
  isExpanded?: boolean;
  isSelected?: boolean; // When all or explicit country is selected
}

export interface MediaItem {
  id: string;
  name: string;
  size: number;
  type: 'video' | 'image';
  previewUrl?: string;
  duration?: number;
  caption: string;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  progress: number;
  fbPostId?: string;
  error?: string;
}

export interface UploadLogItem {
  id: string;
  timestamp: string;
  text: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export type PostTab = 'Post' | 'Reels' | 'Video' | 'Story';

export interface AutomationConfig {
  postTab: PostTab;
  universalCaption: string;
  autoHashtags: boolean;
  fastUpload: boolean;
  geoTargeting: boolean;
  schedule: boolean;
  scheduleDate: string;
  scheduleTime: string;
  autoComment: boolean;
  commentText: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  email?: string;
  connectedAt?: string;
  userToken?: string;
  isValidated: boolean;
}
