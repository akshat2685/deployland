import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './design/reset.css';
import './design/tokens.css';
import './design/game.css';

import { AuthProvider } from './store/AuthProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
