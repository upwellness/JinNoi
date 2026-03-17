'use client';

/**
 * ==============================================================================
 * NEXT.JS PROJECT STRUCTURE & SETUP GUIDE
 * ==============================================================================
 * * 1. PROJECT STRUCTURE (Next.js App Router)
 * -----------------------------------------
 * /app
 * /layout.tsx              # Main layout with Sidebar and TopNav
 * /page.tsx                # Dashboard view
 * /groups/page.tsx         # Groups management
 * /drafts/page.tsx         # Trainer drafts
 * /review/page.tsx         # Review queue
 * /knowledge/page.tsx      # Knowledge base
 * /broadcasts/page.tsx     # Broadcast scheduler
 * /logs/page.tsx           # System logs
 * /components
 * /ui                      # Buttons, cards, modals (Tailwind)
 * /layout                  # Sidebar.tsx, TopNav.tsx
 * /lib
 * supabase.ts              # Supabase client initialization
 * line.ts                  # LINE Messaging API helpers (Server-side only)
 * /types
 * index.ts                 # TypeScript interfaces for Leads, Drafts, etc.
 * * 2. ENVIRONMENT VARIABLES (.env.local)
 * -----------------------------------------
 * # Public Supabase variables (Safe for frontend)
 * NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
 * NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
 * * # Server-only variables (DO NOT expose to frontend)
 * SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
 * LINE_CHANNEL_SECRET=your-line-channel-secret
 * LINE_CHANNEL_ACCESS_TOKEN=your-line-access-token
 * * 3. SUPABASE CLIENT SETUP (/lib/supabase.ts)
 * -----------------------------------------
 * import { createClient } from '@supabase/supabase-js'
 * * const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
 * const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
 * * export const supabase = createClient(supabaseUrl, supabaseAnonKey)
 * * // For admin server-side operations bypassing RLS:
 * // export const supabaseAdmin = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!)
 * * ==============================================================================
 */

import React, { useState } from 'react';
import { 
  Home, Users, FileText, CheckSquare, BookOpen, Radio, Activity, 
  Settings, Bell, Search, Plus, MoreVertical, Check, X, Edit,
  MessageCircle, Send, Clock, AlertCircle, RefreshCw
} from 'lucide-react';

// --- MOCK DATA ---
const MOCK_STATS = {
  totalGroups: 12,
  pendingReviews: 8,
  activeBroadcasts: 3,
  knowledgeBaseSize: 145
};

const MOCK_GROUPS = [
  { id: 'g1', name: 'UP Labs Trainer Hub', type: 'Trainer', members: 5, status: 'Active' },
  { id: 'g2', name: 'Cohort 4 - Q&A', type: 'Customer', members: 120, status: 'Active' },
  { id: 'g3', name: 'Cohort 5 - Onboarding', type: 'Customer', members: 85, status: 'Active' },
  { id: 'g4', name: 'Alumni Network', type: 'Customer', members: 450, status: 'Quiet' },
];

const MOCK_DRAFTS = [
  { id: 'd1', author: 'Dr. Somchai', text: 'Just a reminder to the team: The Reset Phase is 3 days long. It shifts the body from glucose to fat burning. This drops insulin and helps control hunger.', timestamp: '2 hours ago', status: 'Pending Review' },
  { id: 'd2', author: 'Coach Ann', text: 'If a client asks about Randle Effect, tell them it is about the competition between glucose and fatty acids. We want to control it so the body uses fat efficiently without blockages.', timestamp: '5 hours ago', status: 'Pending Review' },
  { id: 'd3', author: 'Dr. Somchai', text: 'PPARs activation is key for improving fat metabolism in week 2.', timestamp: '1 day ago', status: 'Approved' },
];

const MOCK_KNOWLEDGE = [
  { id: 'k1', q: 'What is Metabolic Flexibility?', a: 'It is the body\'s ability to efficiently switch between using carbohydrates and fats for fuel, leading to better health and longevity.', category: 'Core Concepts', updated: 'Oct 12' },
  { id: 'k2', q: 'How long is the Reset Phase?', a: 'The Reset Phase lasts for 3 days and focuses on shifting energy usage to fat.', category: 'Program Phases', updated: 'Oct 14' },
  { id: 'k3', q: 'What does the Reset Phase do?', a: 'It lowers insulin, controls hunger, builds discipline, and begins the shift from glucose dependence to fat adaptation.', category: 'Program Phases', updated: 'Oct 14' },
];

// --- COMPONENTS ---

const SidebarItem = ({ icon: Icon, label, active, onClick, badge }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors mb-1 ${
      active 
        ? 'bg-blue-50 text-blue-700 font-medium' 
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon size={20} className={active ? 'text-blue-600' : 'text-slate-400'} />
      <span>{label}</span>
    </div>
    {badge > 0 && (
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
        active ? 'bg-blue-200 text-blue-800' : 'bg-slate-200 text-slate-700'
      }`}>
        {badge}
      </span>
    )}
  </button>
);

const StatCard = ({ title, value, icon: Icon, trend }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-start justify-between">
    <div>
      <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
      {trend && <p className="text-emerald-600 text-sm mt-2 font-medium">{trend}</p>}
    </div>
    <div className="p-3 bg-slate-50 rounded-lg">
      <Icon size={24} className="text-slate-400" />
    </div>
  </div>
);

// --- VIEWS ---

const DashboardView = () => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="Total Managed Groups" value={MOCK_STATS.totalGroups} icon={Users} trend="+2 this month" />
      <StatCard title="Pending Reviews" value={MOCK_STATS.pendingReviews} icon={CheckSquare} trend="Needs attention" />
      <StatCard title="Knowledge Base" value={MOCK_STATS.knowledgeBaseSize} icon={BookOpen} trend="+12 this week" />
      <StatCard title="Active Broadcasts" value={MOCK_STATS.activeBroadcasts} icon={Radio} />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Activity</h3>
        <div className="space-y-6">
          {[
            { msg: 'New draft submitted by Dr. Somchai', time: '10 mins ago', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
            { msg: 'Broadcast "Week 1 Tips" sent to 3 groups', time: '2 hours ago', icon: Send, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            { msg: 'Knowledge Base updated: "Randle Effect"', time: '5 hours ago', icon: Edit, color: 'text-amber-500', bg: 'bg-amber-50' },
            { msg: 'New group "Cohort 6" detected', time: '1 day ago', icon: Users, color: 'text-purple-500', bg: 'bg-purple-50' },
          ].map((log, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className={`p-2 rounded-full ${log.bg}`}>
                <log.icon size={16} className={log.color} />
              </div>
              <div>
                <p className="text-slate-800 text-sm">{log.msg}</p>
                <p className="text-slate-400 text-xs mt-1">{log.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors">
            <Radio size={18} /> New Broadcast
          </button>
          <button className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 rounded-lg font-medium transition-colors">
            <Plus size={18} /> Add Q&A Manually
          </button>
          <button className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 rounded-lg font-medium transition-colors">
            <RefreshCw size={18} /> Sync LINE Groups
          </button>
        </div>
      </div>
    </div>
  </div>
);

const ReviewQueueView = () => {
  const [queue, setQueue] = useState(MOCK_DRAFTS.filter(d => d.status === 'Pending Review'));

  const handleApprove = (id) => {
    setQueue(queue.filter(q => q.id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Review Queue</h2>
          <p className="text-slate-500 mt-1">Transform trainer notes into structured Knowledge Base articles.</p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium">
          {queue.length} Pending
        </div>
      </div>

      {queue.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center">
          <CheckSquare size={48} className="mx-auto text-emerald-400 mb-4" />
          <h3 className="text-xl font-bold text-slate-800 mb-2">All caught up!</h3>
          <p className="text-slate-500">No pending drafts to review.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {queue.map((draft) => (
            <div key={draft.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-100 p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 text-blue-700 p-2 rounded-full">
                    <MessageCircle size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Source: {draft.author}</p>
                    <p className="text-xs text-slate-500">{draft.timestamp} • Trainer Group</p>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  <Clock size={12} /> Pending
                </span>
              </div>
              
              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Original Context */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Original Message</h4>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-slate-700 text-sm leading-relaxed italic">
                    "{draft.text}"
                  </div>
                </div>

                {/* Right: Draft Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Generated Question (Trigger)</label>
                    <input 
                      type="text" 
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      defaultValue={`What is the purpose of the ${draft.text.includes('Reset') ? 'Reset Phase' : 'Randle Effect'}?`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Polished Answer (Bot Response)</label>
                    <textarea 
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm h-24 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      defaultValue={draft.text.includes('Reset') 
                        ? "The Reset Phase lasts for 3 days and is designed to shift your body's energy source from glucose to fat burning. This process helps lower insulin levels and effectively controls hunger." 
                        : "The Randle Effect refers to the competition between glucose and fatty acids for energy. By controlling it, we ensure the body uses fat efficiently without blockages."}
                    ></textarea>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button 
                      onClick={() => handleApprove(draft.id)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                      <Check size={18} /> Approve to KB
                    </button>
                    <button 
                      onClick={() => handleApprove(draft.id)} // Mock reject
                      className="px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 py-2.5 rounded-lg font-medium flex items-center justify-center transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const KnowledgeBaseView = () => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Knowledge Base</h2>
        <p className="text-slate-500 mt-1">Manage the Q&A pairs your bot uses to answer customers.</p>
      </div>
      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
        <Plus size={18} /> Add Entry
      </button>
    </div>

    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex gap-4 bg-slate-50/50">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search questions or answers..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select className="border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <option>All Categories</option>
          <option>Core Concepts</option>
          <option>Program Phases</option>
        </select>
      </div>
      
      <div className="divide-y divide-slate-100">
        {MOCK_KNOWLEDGE.map((item) => (
          <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors group">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-semibold text-slate-800">{item.q}</h4>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {item.category}
                  </span>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{item.a}</p>
                <p className="text-xs text-slate-400 mt-2">Updated {item.updated}</p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Edit size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const GroupsView = () => (
  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">LINE Groups</h2>
        <p className="text-slate-500 mt-1">Manage trainer and customer groups connected to the bot.</p>
      </div>
      <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
        <RefreshCw size={18} /> Sync Groups
      </button>
    </div>

    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Group Name</th>
            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Members</th>
            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {MOCK_GROUPS.map((group) => (
            <tr key={group.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${group.type === 'Trainer' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                    {group.type === 'Trainer' ? <Settings size={18} /> : <Users size={18} />}
                  </div>
                  <span className="font-semibold text-slate-800">{group.name}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                  group.type === 'Trainer' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  {group.type}
                </span>
              </td>
              <td className="px-6 py-4 text-slate-600 text-sm">~{group.members}</td>
              <td className="px-6 py-4">
                <span className={`flex items-center gap-1.5 text-sm ${
                  group.status === 'Active' ? 'text-emerald-600' : 'text-slate-400'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${group.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                  {group.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <button className="text-slate-400 hover:text-slate-600 p-1">
                  <MoreVertical size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// --- MAIN LAYOUT ---

export default function App() {
  const [currentRoute, setCurrentRoute] = useState('dashboard');

  const renderContent = () => {
    switch (currentRoute) {
      case 'dashboard': return <DashboardView />;
      case 'review': return <ReviewQueueView />;
      case 'knowledge': return <KnowledgeBaseView />;
      case 'groups': return <GroupsView />;
      default: return (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
          <Activity size={48} className="mb-4 opacity-20" />
          <p>This module is under construction.</p>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex fixed h-full z-10">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-sm">
            <MessageCircle size={18} className="text-white" />
          </div>
          <h1 className="font-bold text-lg tracking-tight text-slate-800">Bot Admin</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
          <div>
            <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Overview</p>
            <nav>
              <SidebarItem icon={Home} label="Dashboard" active={currentRoute === 'dashboard'} onClick={() => setCurrentRoute('dashboard')} />
              <SidebarItem icon={Users} label="LINE Groups" active={currentRoute === 'groups'} onClick={() => setCurrentRoute('groups')} />
            </nav>
          </div>
          
          <div>
            <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Knowledge Workflow</p>
            <nav>
              <SidebarItem icon={FileText} label="Trainer Drafts" active={currentRoute === 'drafts'} onClick={() => setCurrentRoute('drafts')} />
              <SidebarItem icon={CheckSquare} label="Review Queue" badge={8} active={currentRoute === 'review'} onClick={() => setCurrentRoute('review')} />
              <SidebarItem icon={BookOpen} label="Knowledge Base" active={currentRoute === 'knowledge'} onClick={() => setCurrentRoute('knowledge')} />
            </nav>
          </div>

          <div>
            <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Engagement</p>
            <nav>
              <SidebarItem icon={Radio} label="Broadcasts" active={currentRoute === 'broadcasts'} onClick={() => setCurrentRoute('broadcasts')} />
              <SidebarItem icon={Activity} label="System Logs" active={currentRoute === 'logs'} onClick={() => setCurrentRoute('logs')} />
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100">
          <button className="w-full flex items-center gap-3 px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
            <Settings size={20} className="text-slate-400" />
            <span className="font-medium">Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4 text-sm font-medium text-slate-500 capitalize">
            {currentRoute.replace('-', ' ')} Overview
          </div>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-px h-6 bg-slate-200 mx-2"></div>
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-sm">
                AD
              </div>
              <span className="text-sm font-medium text-slate-700 hidden sm:block">Admin User</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 flex-1">
          <div className="max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </div>

      </main>
    </div>
  );
}