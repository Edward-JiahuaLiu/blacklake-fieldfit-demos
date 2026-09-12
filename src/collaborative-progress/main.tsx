import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ProgressTrackApp } from './ProgressTrackApp';
import '../shared/base.css';
import './progress-track.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProgressTrackApp />
  </StrictMode>,
);
