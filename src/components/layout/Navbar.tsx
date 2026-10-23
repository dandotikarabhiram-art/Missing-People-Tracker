import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { isLiveFirebaseActive } from '../../lib/firebase';
import { FirebaseConfigModal } from '../common/FirebaseConfigModal';
import { UserRole } from '../../types';
import {
  ShieldAlert,
  Search,
  PlusCircle,
  MapPin,
  Bell,
  User,
  Shield,
  FileText,
  LogOut,
  LogIn,
  Menu,
  X,
  ChevronDown,
  Database,
  ExternalLink,
  PhoneCall,
} from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate }) => {
  const { user, role, logout, switchDemoRole } = useAuth();
  const { notifications, unreadNotifCount, markNotificationRead, markAllNotificationsRead } = useData();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const isLive = isLiveFirebaseActive();

  const handleNav = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
    setIsNotifOpen(false);
    setIsUserMenuOpen(false);
  };

  const getRoleBadgeStyle = (r: UserRole) => {
    switch (r) {
      case 'admin':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'investigator':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'reporter':
        return 'bg-teal-100 text-teal-900 border-teal-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <>
      {/* Top Emergency Disclaimer Strip for India */}
      <div className="bg-slate-950 text-slate-300 text-xs py-1.5 px-4 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href="tel:112"
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold text-[11px] uppercase tracking-wide border border-amber-500/40 hover:bg-amber-500/30 transition cursor-pointer"
              title="Click to dial 112 directly"
            >
              <PhoneCall className="w-3 h-3 text-amber-400" />
              <span>Emergency 112</span>
            </a>
            <span className="text-[11px] text-slate-300">
              Childline: <a href="tel:1098" className="text-white hover:text-amber-300 font-semibold underline decoration-slate-600">1098</a> &bull; Women: <a href="tel:1091" className="text-white hover:text-amber-300 font-semibold underline decoration-slate-600">1091 / 181</a> &bull; Railway GRP: <a href="tel:139" className="text-white hover:text-amber-300 font-semibold underline decoration-slate-600">139</a>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsConfigOpen(true)}
              className="inline-flex items-center gap-1.5 text-[11px] text-teal-400 hover:text-teal-300 transition cursor-pointer font-medium"
            >
              <Database className="w-3 h-3" />
              <span>{isLive ? 'Cloud Firestore: Active' : 'Registry: Standalone India Mode'}</span>
            </button>
            <span className="text-slate-700">|</span>
            <button
              onClick={() => handleNav('/contact')}
              className="inline-flex items-center gap-1.5 text-[11px] text-slate-300 hover:text-white transition cursor-pointer font-medium"
            >
              <PhoneCall className="w-3 h-3 text-amber-400" />
              <span>24x7 Helplines & Zero FIR</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl text-white border-b border-slate-800/80 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div
              onClick={() => handleNav('/')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-teal-600 to-slate-900 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform border border-amber-400/30">
                <ShieldAlert className="w-5 h-5 text-slate-950 stroke-[2.4]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-amber-200 bg-clip-text text-transparent">
                    Missing Persons Registry
                  </span>
                  <span className="font-devanagari text-xs text-amber-400 font-bold tracking-wide">
                    खोया-पाया
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 font-mono tracking-wider">
                    BHARAT
                  </span>
                </div>
                <p className="hidden sm:block text-[10px] text-slate-400 tracking-wider font-medium">
                  National Investigation & Citizen Sighting Network
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              <button
                onClick={() => handleNav('/')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                  currentPath === '/' ? 'text-white bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => handleNav('/search')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 cursor-pointer ${
                  currentPath === '/search' ? 'text-white bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Search className="w-4 h-4 text-teal-400" />
                Search Directory
              </button>
              <button
                onClick={() => handleNav('/map')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1.5 cursor-pointer ${
                  currentPath === '/map' ? 'text-white bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <MapPin className="w-4 h-4 text-teal-400" />
                India Map
              </button>
              <button
                onClick={() => handleNav('/report')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                  currentPath === '/report'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/30'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                Report Missing
              </button>
              <button
                onClick={() => handleNav('/about')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                  currentPath === '/about' ? 'text-white bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                About
              </button>
            </div>

            {/* User & Role Controls */}
            <div className="hidden md:flex items-center gap-3">
              {/* Persona Switcher for Evaluation */}
              <div className="relative group">
                <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-slate-800 text-slate-300 hover:text-white border border-slate-700 cursor-pointer">
                  <span className="text-[10px] text-slate-400 uppercase">Role:</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase border ${getRoleBadgeStyle(role)}`}>
                    {role}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <div className="absolute right-0 mt-1 w-60 bg-white text-slate-900 rounded-xl shadow-xl border border-slate-200 py-1.5 hidden group-hover:block group-focus-within:block z-50">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    Switch Persona for Testing:
                  </div>
                  <button
                    onClick={() => switchDemoRole('public')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">Public Visitor</div>
                      <div className="text-[11px] text-slate-500">Search & submit sightings</div>
                    </div>
                    {role === 'public' && <span className="text-teal-600 font-bold">&check;</span>}
                  </button>
                  <button
                    onClick={() => switchDemoRole('reporter')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">Sunita Sharma (Reporter)</div>
                      <div className="text-[11px] text-slate-500">File & track family reports</div>
                    </div>
                    {role === 'reporter' && <span className="text-teal-600 font-bold">&check;</span>}
                  </button>
                  <button
                    onClick={() => switchDemoRole('investigator')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">Insp. Rajesh Kumar (CID)</div>
                      <div className="text-[11px] text-slate-500">Anti-Human Trafficking Unit</div>
                    </div>
                    {role === 'investigator' && <span className="text-teal-600 font-bold">&check;</span>}
                  </button>
                  <button
                    onClick={() => switchDemoRole('admin')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">Chief Coord. Alok Verma</div>
                      <div className="text-[11px] text-slate-500">National Verification Admin</div>
                    </div>
                    {role === 'admin' && <span className="text-teal-600 font-bold">&check;</span>}
                  </button>
                </div>
              </div>

              {/* Notifications Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-teal-500 text-slate-950 font-bold text-[10px] rounded-full flex items-center justify-center ring-2 ring-slate-900">
                      {unreadNotifCount}
                    </span>
                  )}
                </button>

                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50">
                    <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-teal-400" />
                        <span className="font-bold text-xs uppercase tracking-wider">Notifications</span>
                      </div>
                      {unreadNotifCount > 0 && (
                        <button
                          onClick={markAllNotificationsRead}
                          className="text-[11px] text-teal-400 hover:underline cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-500">No notifications yet</div>
                      ) : (
                        notifications.slice(0, 6).map(n => (
                          <div
                            key={n.id}
                            onClick={() => {
                              markNotificationRead(n.id);
                              if (n.link) handleNav(n.link);
                            }}
                            className={`p-3 text-xs hover:bg-slate-50 transition cursor-pointer ${
                              !n.isRead ? 'bg-teal-50/60 font-semibold' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                              <span className="font-bold text-slate-700">{n.title}</span>
                              <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-slate-600 line-clamp-2">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-2 bg-slate-50 text-center border-t border-slate-100">
                      <button
                        onClick={() => handleNav('/notifications')}
                        className="text-xs font-semibold text-teal-700 hover:underline cursor-pointer"
                      >
                        View all notifications &rarr;
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Account / Dashboards */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition cursor-pointer text-xs"
                  >
                    <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                      {user.displayName.charAt(0)}
                    </div>
                    <span className="font-medium max-w-[120px] truncate">{user.displayName}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white text-slate-900 rounded-xl shadow-xl border border-slate-200 py-1 z-50">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="font-bold text-xs truncate">{user.displayName}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      </div>

                      {role === 'admin' && (
                        <button
                          onClick={() => handleNav('/admin')}
                          className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-purple-700 font-semibold cursor-pointer"
                        >
                          <Shield className="w-4 h-4" /> Admin Command Center
                        </button>
                      )}

                      {(role === 'investigator' || role === 'admin') && (
                        <button
                          onClick={() => handleNav('/investigator')}
                          className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-blue-700 font-semibold cursor-pointer"
                        >
                          <FileText className="w-4 h-4" /> Investigator Dashboard
                        </button>
                      )}

                      <button
                        onClick={() => handleNav('/dashboard')}
                        className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                      >
                        <User className="w-4 h-4 text-teal-600" /> My Submitted Reports
                      </button>

                      <button
                        onClick={() => handleNav('/profile')}
                        className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                      >
                        <User className="w-4 h-4 text-slate-400" /> Account Profile
                      </button>

                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          onClick={logout}
                          className="w-full text-left px-4 py-2 text-xs hover:bg-rose-50 text-rose-700 flex items-center gap-2 cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleNav('/login')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white transition flex items-center gap-1 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" /> Sign In
                  </button>
                  <button
                    onClick={() => handleNav('/register')}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 transition cursor-pointer"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setIsConfigOpen(true)}
                className="p-1.5 rounded-lg bg-slate-800 text-teal-400"
                aria-label="Storage status"
              >
                <Database className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 pt-2 pb-6 space-y-2">
            <button
              onClick={() => handleNav('/')}
              className="w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
            >
              Home
            </button>
            <button
              onClick={() => handleNav('/search')}
              className="w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800 flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-teal-400" /> Search Cases
            </button>
            <button
              onClick={() => handleNav('/map')}
              className="w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800 flex items-center gap-2"
            >
              <MapPin className="w-4 h-4 text-teal-400" /> Map View
            </button>
            <button
              onClick={() => handleNav('/report')}
              className="w-full text-left py-2 px-3 rounded-lg text-sm font-semibold text-teal-300 bg-teal-900/30 flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" /> Report Missing Person
            </button>
            <button
              onClick={() => handleNav('/about')}
              className="w-full text-left py-2 px-3 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
            >
              About Project
            </button>

            <div className="pt-3 border-t border-slate-800">
              <div className="text-xs text-slate-400 font-semibold mb-2">Switch Active Persona:</div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => switchDemoRole('public')}
                  className={`px-2.5 py-1.5 text-xs rounded border text-left ${
                    role === 'public' ? 'bg-slate-700 text-white border-teal-500' : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  Visitor (Public)
                </button>
                <button
                  onClick={() => switchDemoRole('reporter')}
                  className={`px-2.5 py-1.5 text-xs rounded border text-left ${
                    role === 'reporter' ? 'bg-slate-700 text-white border-teal-500' : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  Reporter (Family)
                </button>
                <button
                  onClick={() => switchDemoRole('investigator')}
                  className={`px-2.5 py-1.5 text-xs rounded border text-left ${
                    role === 'investigator' ? 'bg-slate-700 text-white border-teal-500' : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  Investigator (Det.)
                </button>
                <button
                  onClick={() => switchDemoRole('admin')}
                  className={`px-2.5 py-1.5 text-xs rounded border text-left ${
                    role === 'admin' ? 'bg-slate-700 text-white border-teal-500' : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  Administrator
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-1">
              {user ? (
                <>
                  <button
                    onClick={() => handleNav('/dashboard')}
                    className="w-full text-left py-2 px-3 rounded-lg text-sm text-slate-200 hover:bg-slate-800"
                  >
                    User Dashboard
                  </button>
                  {role === 'investigator' && (
                    <button
                      onClick={() => handleNav('/investigator')}
                      className="w-full text-left py-2 px-3 rounded-lg text-sm text-blue-300 hover:bg-slate-800"
                    >
                      Investigator Workspace
                    </button>
                  )}
                  {role === 'admin' && (
                    <button
                      onClick={() => handleNav('/admin')}
                      className="w-full text-left py-2 px-3 rounded-lg text-sm text-purple-300 hover:bg-slate-800"
                    >
                      Admin Command Center
                    </button>
                  )}
                  <button
                    onClick={logout}
                    className="w-full text-left py-2 px-3 rounded-lg text-sm text-rose-400 hover:bg-slate-800"
                  >
                    Sign Out ({user.displayName})
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => handleNav('/login')}
                    className="py-2 text-center text-xs font-semibold rounded bg-slate-800 text-white"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleNav('/register')}
                    className="py-2 text-center text-xs font-bold rounded bg-teal-500 text-slate-950"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Database Setup Modal */}
      <FirebaseConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} />
    </>
  );
};
