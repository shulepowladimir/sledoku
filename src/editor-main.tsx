import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './styles/app.css';
import { LevelEditor } from './components/editor/LevelEditor';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LevelEditor />
  </StrictMode>,
);
