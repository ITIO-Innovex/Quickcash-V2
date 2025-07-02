import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './App.css';
import { Box } from '@mui/material';
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import DragElement from './pages/User/components/pdf/DragElement.jsx';
import {
  DndProvider,
  TouchTransition,
  MouseTransition,
  Preview,
} from 'react-dnd-multi-backend';
import { pdfjs } from 'react-pdf';
import { Provider } from "react-redux";
import { store } from "./pages/User/redux/store";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;

const HTML5toTouch = {
  backends: [
    {
      id: 'html5',
      backend: HTML5Backend,
      transition: MouseTransition,
    },
    {
      id: 'touch',
      backend: TouchBackend,
      options: { enableMouseEvents: true },
      preview: true,
      transition: TouchTransition,
    },
  ],
};

const generatePreview = (props: any) => {
  const { item, style } = props;
  return (
    <div style={style}>
      <DragElement {...item} />
    </div>
  );
};

createRoot(rootElement).render(
  <Box className="page-wrapper">
    <Provider store={store}>
      <DndProvider options={HTML5toTouch}>
        <Preview>{generatePreview}</Preview>
        <App />
      </DndProvider>
    </Provider>
  </Box>
);
