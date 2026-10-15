import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { StoreProvider } from './lib/store.jsx';
import { SparksProvider } from './components/Sparks.jsx';
import './styles/global.css';
import './styles/components.css';
import './styles/pages.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <StoreProvider>
        <SparksProvider>
          <App />
        </SparksProvider>
      </StoreProvider>
    </BrowserRouter>
  </StrictMode>
);
