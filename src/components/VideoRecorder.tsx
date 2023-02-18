import './MediaRecorder.css';

import React, { useRef, useState } from 'react';

export function VideoRecorder() {
  const [permission, setPermission] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState('inactive');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [videoChunks, setVideoChunks] = useState<Blob[]>([]);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const liveVideoFeed = useRef<HTMLVideoElement | null>(null);

  const getCameraPermission = async () => {
    setRecordedVideo(null);
    if ('MediaRecorder' in window) {
      try {
        const videoConstraints = {
          audio: false,
          video: true,
        };
        const audioConstraints = { audio: true };
        const audioStream = await navigator.mediaDevices.getUserMedia(audioConstraints);
        const videoStream = await navigator.mediaDevices.getUserMedia(videoConstraints);
        setPermission(true);
        const combinedStream = new MediaStream([
          ...videoStream.getVideoTracks(),
          ...audioStream.getAudioTracks(),
        ]);
        setStream(combinedStream);
        if (liveVideoFeed.current) {
          liveVideoFeed.current.srcObject = videoStream;
        }
      } catch (err) {
        alert(err instanceof Error && err.message);
      }
    } else {
      alert('The MediaRecorder API is not supported in your browser.');
    }
  };

  const startRecording = async () => {
    if (!stream) return;
    setRecordingStatus('recording');
    const media = new MediaRecorder(stream, { mimeType: 'video/webm' });
    mediaRecorder.current = media;
    mediaRecorder.current.start();
    const localVideoChunks: Blob[] = [];
    mediaRecorder.current.ondataavailable = (event) => {
      if (typeof event.data === 'undefined') return;
      if (event.data.size === 0) return;
      localVideoChunks.push(event.data);
    };
    setVideoChunks(localVideoChunks);
  };

  const stopRecording = () => {
    setPermission(false);
    setRecordingStatus('inactive');

    if (!mediaRecorder.current) return;

    mediaRecorder.current.stop();
    mediaRecorder.current.onstop = () => {
      const videoBlob = new Blob(videoChunks, { type: 'video/webm' });
      const videoUrl = URL.createObjectURL(videoBlob);
      setRecordedVideo(videoUrl);
      setVideoChunks([]);
    };
  };

  return (
    <div>
      <h2>Video Recorder</h2>
      <main>
        <div className="video-controls">
          {!permission ? (
            <button onClick={getCameraPermission} type="button">
              Get Camera
            </button>
          ) : null}
          {permission && recordingStatus === 'inactive' ? (
            <button onClick={startRecording} type="button">
              Start Recording
            </button>
          ) : null}
          {recordingStatus === 'recording' ? (
            <button onClick={stopRecording} type="button">
              Stop Recording
            </button>
          ) : null}
        </div>
      </main>

      <div className="video-player">
        {!recordedVideo ? (
          <video ref={liveVideoFeed} autoPlay className="live-player">
            <track
              src="captions_en.vtt"
              kind="captions"
              srcLang="en"
              label="english_captions"
            />
          </video>
        ) : null}
        {recordedVideo ? (
          <div className="recorded-player">
            <video className="recorded" src={recordedVideo} controls>
              <track src="" kind="captions" srcLang="en" label="english_captions" />
            </video>
            <a download href={recordedVideo}>
              Download Recording
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
}
