import { MutableRefObject, useRef, useState } from 'react';
import { MediaType, RecordingStatus } from '../types';
import { useStream } from './useStream';

export function useRecording() {
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const liveVideo = useRef<HTMLVideoElement | null>(null);
  const [permission, setPermission] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [status, setStatus] = useState(RecordingStatus.INACTIVE);
  const [chunks, setChunks] = useState<Blob[]>([]);
  const [recordedMedia, setRecordedMedia] = useState<string | null>(null);

  const { initStream, stopStream } = useStream({ ref: mediaRecorder });

  const getPermission = async (type: MediaType) => {
    await initStream(type, (streamData, videoStream) => {
      setPermission(true);
      setStream(streamData);
      if (liveVideo.current instanceof HTMLVideoElement && videoStream) {
        liveVideo.current.srcObject = videoStream;
      }
    });
  };

  const startRecording = async (type: MediaType) => {
    setStatus(RecordingStatus.RECORDING);
    await getPermission(type);
    if (type === MediaType.AUDIO) {
      const audioChunks = (stream && getAudioChunks(mediaRecorder, stream)) || [];
      setChunks(audioChunks);
    } else if (type === MediaType.VIDEO) {
      const videoChunks = (stream && getVideoChunks(mediaRecorder, stream)) || [];
      setChunks(videoChunks);
    }
  };

  const stopRecording = () => {
    setStatus(RecordingStatus.INACTIVE);
    stopStream(stream, () => {
      const audioUrl = collectAudioUrl(chunks);
      setRecordedMedia(audioUrl);
      setChunks([]);
    });
  };

  return {
    permission,
    getPermission,
    startRecording,
    stopRecording,
    status,
    recordedMedia,
    liveVideo,
  };
}

const getAudioChunks = (
  ref: MutableRefObject<MediaRecorder | null>,
  stream: MediaStream,
) => {
  const localAudioChunks: Blob[] = [];
  ref.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
  ref.current.start();
  ref.current.ondataavailable = (event) => {
    if (typeof event.data === 'undefined') return;
    if (event.data.size === 0) return;
    localAudioChunks.push(event.data);
  };

  return localAudioChunks;
};

const getVideoChunks = (
  ref: MutableRefObject<MediaRecorder | null>,
  stream: MediaStream,
) => {
  const localVideoChunks: Blob[] = [];
  ref.current = new MediaRecorder(stream, { mimeType: 'video/webm' });
  ref.current.start();
  ref.current.ondataavailable = (event) => {
    if (typeof event.data === 'undefined') return;
    if (event.data.size === 0) return;
    localVideoChunks.push(event.data);
  };
  return localVideoChunks;
};

const collectAudioUrl = (chunks: Blob[]) => {
  const audioBlob = new Blob(chunks, { type: 'audio/webm' });
  return URL.createObjectURL(audioBlob);
};
