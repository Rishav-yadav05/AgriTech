import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';
import App from './App';
import { AuthProvider } from './auth';
import { LangProvider } from './i18n';
createRoot(document.getElementById('root')).render(<BrowserRouter><LangProvider><AuthProvider><App /></AuthProvider></LangProvider></BrowserRouter>);
