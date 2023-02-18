import './App.css';

import { useState } from 'react';

import { AudioRecorder } from './components/AudioRecorder';
import { VideoRecorder } from './components/VideoRecorder';
import { MediaType } from './types';

function App() {
  const [recordOption, setRecordOption] = useState<MediaType>(MediaType.AUDIO);
  const toggleRecordOption = (type: MediaType) => () => setRecordOption(type);

  return (
    <div className="App">
      <h1>Media Recorder</h1>
      <div className="button-flex">
        <button onClick={toggleRecordOption(MediaType.VIDEO)} type="button">
          Record Video
        </button>
        <button onClick={toggleRecordOption(MediaType.AUDIO)} type="button">
          Record Audio
        </button>
      </div>
      <div>
        {recordOption === MediaType.AUDIO && <AudioRecorder />}
        {recordOption === MediaType.VIDEO && <VideoRecorder />}
      </div>
    </div>
  );
}

export default App;
