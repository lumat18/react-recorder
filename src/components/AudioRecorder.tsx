import './MediaRecorder.css';

import React, { useRef, useState } from 'react';

import { RecordingStatus } from '../types';

export function AudioRecorder() {
  const mediaRecorder = useRef<MediaRecorder | null>(null);

  const [permission, setPermission] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordingStatus, setRecordingStatus] = useState(RecordingStatus.INACTIVE);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audio, setAudio] = useState<string | null>(null);

  const getPermission = async () => {
    if ('MediaRecorder' in window) {
      try {
        const streamData = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        setPermission(true);
        setStream(streamData);
      } catch (err) {
        if (err instanceof Error) {
          alert(err.message);
        }
      }
    } else {
      alert('The MediaRecorder API is not supported in your browser');
    }
  };

  const startRecording = async () => {
    setRecordingStatus(RecordingStatus.RECORDING);
    mediaRecorder.current =
      stream && new MediaRecorder(stream, { mimeType: 'audio/webm' });
    if (mediaRecorder.current) {
      mediaRecorder.current.start();
      const localAudioChunks: Blob[] = [];
      mediaRecorder.current.ondataavailable = (event) => {
        if (typeof event.data === 'undefined') return;
        if (event.data.size === 0) return;
        localAudioChunks.push(event.data);
      };
      setAudioChunks(localAudioChunks);
    }
  };

  const stopRecording = () => {
    setRecordingStatus(RecordingStatus.INACTIVE);
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudio(audioUrl);
        setAudioChunks([]);
      };
    }
  };

  return (
    <div>
      <h2>Audio Recorder</h2>
      <main>
        <div className="media-controls">
          {!permission && (
            <button onClick={() => void getPermission()} type="button">
              Get Microphone
            </button>
          )}
          {permission && recordingStatus === RecordingStatus.INACTIVE && (
            <button onClick={() => startRecording()} type="button">
              Start Recording
            </button>
          )}
          {recordingStatus === RecordingStatus.RECORDING && (
            <button onClick={() => stopRecording()} type="button">
              Stop Recording
            </button>
          )}
          {audio && (
            <div className="media-container">
              <audio src={audio} controls>
                <track src="" kind="captions" srcLang="en" label="english_captions" />
              </audio>
              <a download href={audio}>
                Download Recording
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
