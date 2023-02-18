import './MediaRecorder.css';

import React from 'react';

import { MediaType, RecordingStatus } from '../types';
import { useRecording } from './useRecording';

export function VideoRecorder() {
  const {
    permission,
    getPermission,
    startRecording,
    stopRecording,
    status,
    recordedMedia,
    liveVideo,
  } = useRecording();

  return (
    <div>
      <h2>Video Recorder</h2>
      <main>
        <div className="video-controls">
          {!permission && (
            <button onClick={() => void getPermission(MediaType.VIDEO)} type="button">
              Get Camera
            </button>
          )}
          {permission && status === RecordingStatus.INACTIVE && (
            <button
              disabled={!!recordedMedia}
              onClick={() => startRecording(MediaType.VIDEO)}
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
        </div>
      </main>

      <div className="video-player">
        {!recordedMedia && (
          <video ref={liveVideo} autoPlay className="live-player">
            <track src="" kind="captions" srcLang="en" label="english_captions" />
          </video>
        )}
        {recordedMedia && (
          <div className="recorded-player">
            <video className="recorded" src={recordedMedia} controls>
              <track src="" kind="captions" srcLang="en" label="english_captions" />
            </video>
            <a download href={recordedMedia}>
              Download Recording
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
