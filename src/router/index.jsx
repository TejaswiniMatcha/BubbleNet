/**
 * src/router/index.jsx
 * Application router — all routes defined here.
 */

import { createBrowserRouter, Navigate } from 'react-router-dom';
import Shell from '../shell/Shell.jsx';
import Create from '../pages/Create/Create.jsx';
import Created from '../pages/Created/Created.jsx';
import Join from '../pages/Join/Join.jsx';
import Messages from '../pages/Messages/Messages.jsx';
import Album from '../pages/Album/Album.jsx';
import Files from '../pages/Files/Files.jsx';
import Notes from '../pages/Notes/Notes.jsx';
import Polls from '../pages/Polls/Polls.jsx';
import Location from '../pages/Location/Location.jsx';
import Mesh from '../pages/Mesh/Mesh.jsx';
import RelaySettings from '../pages/RelaySettings/RelaySettings.jsx';
import Emergency from '../pages/Emergency/Emergency.jsx';
import About from '../pages/About/About.jsx';
import Expired from '../pages/Expired/Expired.jsx';
import Dev from '../pages/Dev/Dev.jsx';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Shell />,
    children: [
      { index: true,                  element: <Create /> },
      { path: 'create',               element: <Create /> },
      { path: 'created',              element: <Created /> },
      { path: 'join',                 element: <Join /> },
      { path: 'bubble/messages',      element: <Messages /> },
      { path: 'bubble/album',         element: <Album /> },
      { path: 'bubble/files',         element: <Files /> },
      { path: 'bubble/notes',         element: <Notes /> },
      { path: 'bubble/polls',         element: <Polls /> },
      { path: 'bubble/location',      element: <Location /> },
      { path: 'mesh',                 element: <Mesh /> },
      { path: 'relay-settings',       element: <RelaySettings /> },
      { path: 'emergency',            element: <Emergency /> },
      { path: 'about',                element: <About /> },
      { path: 'expired',              element: <Expired /> },
      { path: 'dev',                  element: <Dev /> },
      { path: '*',                    element: <Navigate to="/" replace /> },
    ],
  },
]);
