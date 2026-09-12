import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import QuickReportApp from './QuickReportApp';
import './quick-report.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Quick report root element was not found.');
}

createRoot(rootElement).render(
  <StrictMode>
    <QuickReportApp />
  </StrictMode>,
);
