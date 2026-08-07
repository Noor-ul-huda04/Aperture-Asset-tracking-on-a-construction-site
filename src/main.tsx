import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { FirebaseAuthProvider } from './context/FirebaseAuthContext.tsx';
import './index.css';

// Handle background Vite HMR WebSocket rejections gracefully in container preview environment
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event?.reason;
    const isWsError =
      reason &&
      (typeof reason === 'string' && reason.includes('WebSocket') ||
        reason?.message?.includes('WebSocket') ||
        String(reason).includes('WebSocket'));
    if (isWsError) {
      event.preventDefault();
      // Silently consume expected Vite dev server HMR websocket notices
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FirebaseAuthProvider>
      <App />
    </FirebaseAuthProvider>
  </StrictMode>,
);

