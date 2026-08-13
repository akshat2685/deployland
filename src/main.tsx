import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './design/reset.css';
import './design/tokens.css';
import './design/game.css';

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
