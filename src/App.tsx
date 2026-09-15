import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Activity, 
  Compass, 
  Signal, 
  Database, 
  Layers, 
  Terminal, 
  Cpu, 
  AlertTriangle, 
  ShieldCheck, 
  RefreshCw,
  Power
} from 'lucide-react';

export default function App() {
  const [telemetry, setTelemetry] = useState({
    altitude: 12450,
    velocity: 420.5,
    battery: 88,
    temp: 24.3,
    signalStrength: 94,
    latitude: 28.6139,
    longitude: 77.2090,
    status: 'OPTIMAL'
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'telemetry' | 'commands' | 'logs'>('overview');
  const [logs, setLogs] = useState<string[]>([
    '[09:48:10] Groundstation node initialized.',
    '[09:48:12] Uplink established on 433.500 MHz.',
    '[09:48:15] Telemetry packet #1042 received: Checksum OK.'
  ]);
  const [commandInput, setCommandInput] = useState('');

  // Simulate real-time telemetry updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry((prev) => ({
        ...prev,
        altitude: Math.round((prev.altitude + (Math.random() * 10 - 4)) * 10) / 10,
        velocity: Math.round((prev.velocity + (Math.random() * 2 - 0.9)) * 10) / 10,
        temp: Math.round((prev.temp + (Math.random() * 0.4 - 0.2)) * 10) / 10,
        signalStrength: Math.min(100, Math.max(70, Math.round(prev.signalStrength + (Math.random() * 4 - 2))))
      }));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleSendCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${time}] SENT: ${commandInput.trim()}`]);
    setCommandInput('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg border border-indigo-500/30">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider text-slate-100 uppercase flex items-center gap-2">
              AESS Groundstation
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">LIVE</span>
            </h1>
            <p className="text-xs text-slate-400">IEEE Aerospace and Electronic Systems Society</p>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Signal className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400">Signal:</span>
            <span className="font-mono text-slate-200">{telemetry.signalStrength}%</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400">Link:</span>
            <span className="font-mono text-emerald-400">ACTIVE</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <Power className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-mono text-slate-300">UPLINK 433.5MHz</span>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="w-64 border-r border-slate-800 bg-slate-900/40 p-4 flex flex-col justify-between">
          <nav className="space-y-1">
            {[
              { id: 'overview', label: 'Mission Overview', icon: Activity },
              { id: 'telemetry', label: 'Telemetry Data', icon: Database },
              { id: 'commands', label: 'Command Deck', icon: Terminal },
              { id: 'logs', label: 'System Logs', icon: Layers }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">System Health</span>
              <span className="text-emerald-400 font-medium">99.8%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-emerald-500 h-full w-[99.8%]" />
            </div>
          </div>
        </aside>

        {/* Dashboard Area */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Quick Stats Grid */}
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur">
              <div className="flex items-center justify-between text-slate-400 text-sm mb-2">
                <span>Altitude</span>
                <Compass className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-slate-100">
                {telemetry.altitude.toLocaleString()} <span className="text-xs text-slate-400 font-sans">m</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur">
              <div className="flex items-center justify-between text-slate-400 text-sm mb-2">
                <span>Velocity</span>
                <Activity className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-slate-100">
                {telemetry.velocity} <span className="text-xs text-slate-400 font-sans">m/s</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur">
              <div className="flex items-center justify-between text-slate-400 text-sm mb-2">
                <span>Battery Level</span>
                <Cpu className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-slate-100">
                {telemetry.battery}%
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur">
              <div className="flex items-center justify-between text-slate-400 text-sm mb-2">
                <span>Payload Temp</span>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-slate-100">
                {telemetry.temp}°C
              </div>
            </div>
          </div>

          {/* Dynamic Tab Views */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-3 gap-6">
              {/* Primary Map Mockup */}
              <div className="col-span-2 p-5 rounded-xl bg-slate-900/60 border border-slate-800 h-96 flex flex-col justify-between relative overflow-hidden">
                <div className="flex items-center justify-between z-10">
                  <h3 className="font-semibold text-slate-200">Orbital / Flight Path Tracker</h3>
                  <div className="text-xs font-mono bg-slate-800 px-2.5 py-1 rounded text-slate-300">
                    LAT: {telemetry.latitude} | LON: {telemetry.longitude}
                  </div>
                </div>
                {/* Radar Target Visualizer */}
                <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                  <div className="w-72 h-72 rounded-full border border-indigo-500/40 animate-ping" />
                  <div className="w-48 h-48 rounded-full border border-indigo-500/60" />
                  <div className="w-24 h-24 rounded-full border border-indigo-500/80" />
                </div>
                <div className="z-10 flex items-center justify-center">
                  <div className="p-3 bg-indigo-600/30 border border-indigo-400 rounded-full text-indigo-300 shadow-xl shadow-indigo-500/20">
                    <Radio className="w-8 h-8 animate-pulse" />
                  </div>
                </div>
                <div className="z-10 text-xs text-slate-500 flex justify-between">
                  <span>GROUNDSTATION: STATION_ALPHA</span>
                  <span>STATUS: TRACKING ACTIVE</span>
                </div>
              </div>

              {/* Status Side Console */}
              <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-slate-200 mb-4">Payload Status</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm py-2 border-b border-slate-800">
                      <span className="text-slate-400">Transponder</span>
                      <span className="text-emerald-400 font-mono">ONLINE</span>
                    </div>
                    <div className="flex justify-between items-center text-sm py-2 border-b border-slate-800">
                      <span className="text-slate-400">GPS Lock</span>
                      <span className="text-emerald-400 font-mono">3D FIX (12 SATS)</span>
                    </div>
                    <div className="flex justify-between items-center text-sm py-2 border-b border-slate-800">
                      <span className="text-slate-400">Storage</span>
                      <span className="text-slate-200 font-mono">4.2 GB / 32 GB</span>
                    </div>
                    <div className="flex justify-between items-center text-sm py-2">
                      <span className="text-slate-400">Telemetry Frequency</span>
                      <span className="text-slate-200 font-mono">1.5 Hz</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setLogs(p => [...p, `[${new Date().toLocaleTimeString()}] Manual telemetry refresh requested.`])}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition"
                >
                  <RefreshCw className="w-4 h-4" /> Force Sync Telemetry
                </button>
              </div>
            </div>
          )}

          {activeTab === 'commands' && (
            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h3 className="font-semibold text-slate-200">Uplink Command Terminal</h3>
              <form onSubmit={handleSendCommand} className="flex gap-3">
                <input
                  type="text"
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  placeholder="Enter uplink payload command (e.g., SET_MODE ACTIVE, PING)..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm font-mono focus:outline-none focus:border-indigo-500 text-slate-200"
                />
                <button 
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition"
                >
                  Transmit
                </button>
              </form>
            </div>
          )}

          {(activeTab === 'logs' || activeTab === 'overview' || activeTab === 'commands') && (
            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800">
              <h3 className="font-semibold text-slate-200 mb-3 flex items-center justify-between">
                <span>Console Log Stream</span>
                <span className="text-xs text-slate-500 font-mono">{logs.length} entries</span>
              </h3>
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 space-y-1.5 max-h-48 overflow-y-auto">
                {logs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed">
                    <span className="text-indigo-400">&gt;</span> {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
