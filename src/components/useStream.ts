import { MutableRefObject } from 'react';

import { MediaType } from '../types';

export function useStream({
  ref,
}: {
  ref: MutableRefObject<HTMLVideoElement | MediaRecorder | null>;
}) {
  const initStream = async (
    type: MediaType,
    onSuccess: (stream: MediaStream, videoStream?: MediaStream) => void,
  ) => {
    if ('MediaRecorder' in window) {
      try {
        if (type === MediaType.AUDIO) {
          const streamData = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false,
          });
          onSuccess(streamData);
        } else if (type === MediaType.VIDEO) {
          const videoConstraints = {
            audio: false,
            video: true,
          };
          const audioConstraints = { audio: true };
          const audioStream = await navigator.mediaDevices.getUserMedia(audioConstraints);
          const videoStream = await navigator.mediaDevices.getUserMedia(videoConstraints);
          const combinedStream = new MediaStream([
            ...videoStream.getVideoTracks(),
            ...audioStream.getAudioTracks(),
          ]);
          onSuccess(combinedStream, videoStream);
        }
      } catch (err) {
        if (err instanceof Error) {
          alert(err.message);
        }
      }
    } else {
      alert('The MediaRecorder API is not supported in your browser');
    }
  };

  const stopStream = (stream: MediaStream | null, onStop: () => void) => {
    if (ref?.current && ref.current instanceof MediaRecorder) {
      ref.current.stop();
      ref.current.onstop = onStop;
    }
    !!stream && stopAllTracks(stream);
  };

  const stopAllTracks = (stream: MediaStream) => {
    const tracks = stream.getTracks();
    tracks.forEach((track) => {
      track.stop();
    });
  };

  return { initStream, stopStream };
}
