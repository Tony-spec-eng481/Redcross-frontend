import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import Home from './pages/Home';
import About from './pages/About';
import Programs from './pages/Programs';
import Principles from './pages/Principles';
import Events from './pages/Events';
import Team from './pages/Team';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import PortalLayout from './components/PortalLayout';
import Dashboard from './pages/Portal/Dashboard';
import PortalGallery from './pages/Portal/Gallery';
import PortalEvents from './pages/Portal/Events';
import FirstAid from './pages/Portal/FirstAid';
import Messages from './pages/Portal/Messages';
import Profile from './pages/Portal/Profile';
import Settings from './pages/Portal/Settings';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Website Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="programs" element={<Programs />} />
          <Route path="principles" element={<Principles />} />
          <Route path="events" element={<Events />} />
          <Route path="team" element={<Team />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="contact" element={<Contact />} />
        </Route>

        {/* Authentication Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Membership Portal Routes */}
        <Route path="/portal" element={<PortalLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="gallery" element={<PortalGallery />} />
          <Route path="events" element={<PortalEvents />} />
          <Route path="firstaid" element={<FirstAid />} />
          <Route path="messages" element={<Messages />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;