import './MediaRecorder.css';
import React from 'react';
import { MediaType, RecordingStatus } from '../types';
import { useRecording } from './useRecording';

export function AudioRecorder() {
  const {
    permission,
    getPermission,
    startRecording,
    stopRecording,
    status,
    recordedMedia,
  } = useRecording();

  return (
    <div>
      <h2>Audio Recorder</h2>
      <main>
        <div className="media-controls">
          {!permission && (
            <button onClick={() => void getPermission(MediaType.AUDIO)} type="button">
              Get Microphone
            </button>
          )}
          {permission && status === RecordingStatus.INACTIVE && (
            <button
              disabled={!!recordedMedia}
              onClick={() => startRecording(MediaType.AUDIO)}
              type="button"
            >
              Start Recording
            </button>
          )}
          {status === RecordingStatus.RECORDING && (
            <button onClick={stopRecording} type="button">
              Stop Recording
            </button>
          )}
          {recordedMedia && (
            <div className="media-container">
              <audio src={recordedMedia} controls>
                <track src="" kind="captions" srcLang="en" label="english_captions" />
              </audio>
              <a download href={recordedMedia}>
                Download Recording
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
