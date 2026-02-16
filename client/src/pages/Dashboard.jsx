import React from 'react';
import { LayoutGrid, Folder, Search, ShieldCheck, ArrowLeft, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const projects = [
    { id: '1', name: 'NodeJs&Express + React Auth', type: 'JWT Flow', status: 'Active', date: '2024-03-20' },
    { id: '2', name: 'Stripe Webhook Handler', type: 'Billing Logic', status: 'Completed', date: '2024-03-18' },
    { id: '3', name: 'OAuth2 Integration', type: 'Social Login', status: 'Testing', date: '2024-03-15' },
  ];
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-slate-50 font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a0a0a] border-r border-slate-700 p-6 flex flex-col">
        {/* Back to Home Option */}
        <button onClick={()=> navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-[#38bdf8] transition-colors mb-8 group text-sm">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>

        <div className="mb-10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-[#38bdf8]" size={28} />
            <h2 className="text-xl font-bold tracking-tight">AUTH<span className="text-[#38bdf8]">TEMPLATES</span></h2>
          </div>
          <p className="text-slate-500 text-xs mt-1 px-1">Project Management Portal</p>
        </div>

        <nav className="flex-1 space-y-2">
          <button className="w-full flex items-center gap-3 text-[#38bdf8] bg-[#38bdf8]/10 p-3 rounded-xl transition-all font-medium">
            <LayoutGrid size={20} /> Dashboard
          </button>
          <button className="w-full flex items-center gap-3 text-slate-400 hover:text-slate-200 p-3 rounded-xl transition-all">
            <Folder size={20} /> My Templates
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">Project Overview</h1>
            <p className="text-slate-400 text-sm">Manage your authentication boilerplate projects.</p>
          </div>
          
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Search projects..." 
                className="bg-[#0a0a0a] border border-slate-700 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:border-[#38bdf8] text-sm w-64 text-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Project Table */}
        <div className="bg-[#0a0a0a] rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/40 text-slate-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Project Name</th>
                <th className="px-6 py-4 font-semibold">Logic Type</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-slate-900/30 transition-colors group">
                  <td className="px-6 py-4 font-medium text-slate-200">{project.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{project.type}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                      project.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                      project.status === 'Completed' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                      'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-500 hover:text-[#38bdf8] transition-colors">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          
        </div>
      </main>
    </div>
  );
};

export default Dashboard;