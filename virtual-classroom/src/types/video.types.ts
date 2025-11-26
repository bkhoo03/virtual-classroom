import type {
  IAgoraRTCClient,
  ILocalVideoTrack,
  ILocalAudioTrack,
  IRemoteVideoTrack,
  IRemoteAudioTrack,
  UID
} from 'agora-rtc-sdk-ng';
import type { ConnectionStatus } from './index';

export interface VideoStream {
  userId: string;
  streamId: string;
  videoTrack: ILocalVideoTrack | IRemoteVideoTrack | null;
  audioTrack: ILocalAudioTrack | IRemoteAudioTrack | null;
  isLocal: boolean;
}

export interface VideoCallConfig {
  appId: string;
  channel: string;
  token: string | null;
  uid: UID;
  userId: string;
  userName: string;
}

export interface AgoraTokenResponse {
  token: string;
  uid: number;
  channel: string;
  expiresAt: number;
}

export interface VideoCallState {
  localStream: VideoStream | null;
  remoteStreams: Map<string, VideoStream>;
  connectionStatus: ConnectionStatus;
  isAudioMuted: boolean;
  isVideoOff: boolean;
  client: IAgoraRTCClient | null;
}
