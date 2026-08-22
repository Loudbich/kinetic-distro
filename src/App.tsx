import { Route, Routes } from 'react-router-dom';

import Layout from './components/Layout';
import Home from './pages/Home';
import Roster from './pages/Roster';
import ArtistPage from './pages/ArtistPage';
import Releases from './pages/Releases';
import ReleasePage from './pages/ReleasePage';
import Distribution from './pages/Distribution';
import About from './pages/About';
import Demos from './pages/Demos';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/roster" element={<Roster />} />
        <Route path="/roster/:slug" element={<ArtistPage />} />
        <Route path="/releases" element={<Releases />} />
        <Route path="/releases/:slug" element={<ReleasePage />} />
        <Route path="/distribution" element={<Distribution />} />
        <Route path="/about" element={<About />} />
        <Route path="/demos" element={<Demos />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
