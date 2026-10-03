import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
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

const ROUTES = [
  '/', '/create', '/created', '/join', '/bubble/messages', '/bubble/album',
  '/bubble/files', '/bubble/notes', '/bubble/polls', '/bubble/location'
];

describe('Smoke Test', () => {
  it('renders all routes without throwing errors', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    for (const path of ROUTES) {
      expect(() => {
        render(
          <MemoryRouter initialEntries={[path]}>
            <Routes>
              <Route element={<Shell />}>
                <Route path="/" element={<Create />} />
                <Route path="create" element={<Create />} />
                <Route path="created" element={<Created />} />
                <Route path="join" element={<Join />} />
                <Route path="bubble/messages" element={<Messages />} />
                <Route path="bubble/album" element={<Album />} />
                <Route path="bubble/files" element={<Files />} />
                <Route path="bubble/notes" element={<Notes />} />
                <Route path="bubble/polls" element={<Polls />} />
                <Route path="bubble/location" element={<Location />} />
              </Route>
            </Routes>
          </MemoryRouter>
        );
      }).not.toThrow();
    }
    
    expect(errorSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});

