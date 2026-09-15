import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import {
  Thermometer,
  Droplets,
  MapPin,
  Cpu,
  Usb,
  Radio,
  Satellite,
  Wifi,
  WifiOff,
  Play,
  Square,
} from 'lucide-react';
import { useSerial } from './hooks/useSerial';
import { CubeSatModel } from './components/CubeSatModel';

function HUDPanel({ children, className = '', accentColor = 'red' }: { children: React.ReactNode, className?: string, accentColor?: 'red' | 'blue' | 'green' }) {
  const colorMap = {
    red: 'border-red-900/60 panel-red-top box-glow-red',
    blue: 'border-blue-900/60 panel-blue-top box-glow-blue',
    green: 'border-green-900/60 box-glow-green',
  };
  return (
    <div className={`relative bg-slate-950/80 border backdrop-blur-sm ${colorMap[accentColor]} ${className}`}>
      <div className="hud-corner hud-corner-tl" />
      <div className="hud-corner hud-corner-tr" />
      <div className="hud-corner hud-corner-bl" />
      <div className="hud-corner hud-corner-br" />
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-1 h-4 bg-red-500" />
      <span className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">{children}</span>
      <div className="flex-1 h-px bg-slate-800" />
    </div>
  );
}

function StatusDot({ status }: { status: 'good' | 'bad' | 'offline' }) {
  if (status === 'good') return (
    <span className="flex items-center gap-1.5">
      <span className="relative inline-flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 status-pulse-green" />
      </span>
      <span className="text-emerald-400 text-xs font-bold tracking-widest glow-green">NOMINAL</span>
    </span>
  );
  if (status === 'bad') return (
    <span className="flex items-center gap-1.5">
      <span className="relative inline-flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 status-pulse-red" />
      </span>
      <span className="text-red-400 text-xs font-bold tracking-widest glow-red">ERROR</span>
    </span>
  );
  return (
    <span className="flex items-center gap-1.5">
      <span className="inline-flex h-2.5 w-2.5 rounded-full bg-slate-700" />
      <span className="text-slate-600 text-xs font-bold tracking-widest">OFFLINE</span>
    </span>
  );
}

function DataRow({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-900">
      <span className="text-[11px] text-slate-500 tracking-widest uppercase">{label}</span>
      <span className="font-mono text-sm text-slate-200 mono-data">
        {value}{unit && <span className="text-slate-500 text-xs ml-1">{unit}</span>}
      </span>
    </div>
  );
}

export default function App() {
  const {
    isConnected,
    isSimulating,
    imuData,
    envData,
    logs,
    connectSerial,
    disconnectSerial,
    toggleSimulation
  } = useSerial();

  const now = Date.now();
  const imuHealthy = imuData ? (now - imuData.timestamp < 5000) : false;
  const envHealthy = envData ? (now - envData.timestamp < 15000) : false;
  const imuStatus = imuHealthy ? 'good' : (isConnected || isSimulating ? 'bad' : 'offline');
  const envStatus = envHealthy ? 'good' : (isConnected || isSimulating ? 'bad' : 'offline');

  const isActive = isConnected || isSimulating;

  const time = new Date().toLocaleTimeString('en-US', { hour12: false });

  return (
    <div className="min-h-screen bg-[#040810] text-slate-300 flex flex-col grid-bg flicker">
      {/* ─────────────────── TOP HEADER BAR ─────────────────── */}
      <header className="border-b border-red-900/40 bg-[#040810]/90 backdrop-blur-md sticky top-0 z-50">
        {/* Red top strip */}
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-red-600 to-transparent" />
        
        <div className="px-6 py-3 flex items-center justify-between">
          {/* Logo + Title */}
          <div className="flex items-center gap-4">
            <div className="relative p-2.5 border border-red-700/50 bg-red-950/30">
              <div className="hud-corner hud-corner-tl" style={{ width: 8, height: 8 }} />
              <div className="hud-corner hud-corner-br" style={{ width: 8, height: 8 }} />
              <Satellite className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-black tracking-[0.25em] text-white uppercase">
                  AESS <span className="text-red-500 glow-red">GROUNDSTATION</span>
                </h1>
                <div className={`flex items-center gap-1.5 px-2 py-0.5 border text-[10px] font-bold tracking-widest ${
                  isActive ? 'border-emerald-700/60 text-emerald-400 bg-emerald-950/30' : 'border-slate-700/60 text-slate-500 bg-slate-900/30'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                  {isActive ? 'LIVE' : 'STANDBY'}
                </div>
              </div>
              <p className="text-[10px] text-slate-600 tracking-[0.3em] uppercase mt-0.5">
                MISSION CONTROL / CUBESAT DIGITAL TWIN / v2.0
              </p>
            </div>
          </div>

          {/* Center: Clock */}
          <div className="hidden lg:flex flex-col items-center">
            <span className="text-[10px] text-slate-600 tracking-widest uppercase">Mission Time</span>
            <span className="font-mono text-xl text-blue-400 glow-blue tracking-widest">{time}</span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSimulation}
              className={`relative px-4 py-2 flex items-center gap-2 text-xs font-bold tracking-widest uppercase border transition-all duration-300 ${
                isSimulating
                  ? 'border-blue-600/60 text-blue-400 bg-blue-950/30 box-glow-blue'
                  : 'border-slate-700 text-slate-400 hover:text-blue-400 hover:border-blue-700/60 bg-slate-900/50'
              }`}
            >
              {isSimulating ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isSimulating ? 'Stop Sim' : 'Simulate'}
            </button>

            <button
              onClick={isConnected ? disconnectSerial : connectSerial}
              disabled={isSimulating}
              className={`relative px-5 py-2 flex items-center gap-2 text-xs font-bold tracking-widest uppercase border transition-all duration-300 ${
                isSimulating
                  ? 'opacity-40 cursor-not-allowed border-slate-700 text-slate-600'
                  : isConnected
                    ? 'border-red-700/60 text-red-400 bg-red-950/30 box-glow-red'
                    : 'border-emerald-700/60 text-emerald-400 bg-emerald-950/30 box-glow-green hover:border-emerald-500'
              }`}
            >
              {isConnected ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
              {isConnected ? 'Disconnect' : 'Connect USB'}
              <Usb className="w-3 h-3 opacity-60" />
            </button>
          </div>
        </div>
      </header>

      {/* ─────────────────── MAIN LAYOUT ─────────────────── */}
      <main className="flex-1 p-4 lg:p-6 grid grid-cols-12 gap-4 lg:gap-5">

        {/* ── LEFT SIDE: IMU attitude strips ── */}
        <div className="col-span-12 lg:col-span-1 flex lg:flex-col gap-3">
          {[
            { label: 'P', val: imuData?.pitch, color: 'text-red-400' },
            { label: 'R', val: imuData?.roll, color: 'text-blue-400' },
            { label: 'Y', val: imuData?.yaw, color: 'text-slate-300' },
          ].map(({ label, val, color }) => (
            <HUDPanel key={label} className="flex-1 flex flex-col items-center justify-center py-4 px-2 gap-2" accentColor="red">
              <span className="text-[10px] tracking-widest text-slate-600 uppercase">{label === 'P' ? 'PITCH' : label === 'R' ? 'ROLL' : 'YAW'}</span>
              <span className={`font-mono text-xl font-black ${color} mono-data`} style={{ writingMode: 'horizontal-tb' }}>
                {val != null ? val.toFixed(0) : '--'}
              </span>
              <span className="text-[10px] text-slate-600">°</span>
            </HUDPanel>
          ))}
        </div>

        {/* ── CENTER: Digital Twin Canvas ── */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-4">
          <HUDPanel className="flex-1 min-h-[480px] lg:min-h-[540px] overflow-hidden" accentColor="red">
            {/* scan line effect */}
            <div className="scan-line" />

            {/* Header overlay */}
            <div className="absolute top-4 left-5 z-10 flex items-center gap-3">
              <Radio className="w-4 h-4 text-blue-400 animate-pulse" />
              <div>
                <div className="text-[10px] tracking-[0.2em] text-slate-400 uppercase">Digital Twin</div>
                <div className="text-[9px] text-slate-600 font-mono">MPU6050 @ 2.5s INTERVAL</div>
              </div>
            </div>

            {/* Top-right corner badge */}
            <div className="absolute top-4 right-5 z-10 text-right">
              <div className="text-[9px] text-slate-600 font-mono tracking-widest">ORBIT SIM</div>
              <div className={`text-[10px] font-bold ${isActive ? 'text-emerald-400 glow-green' : 'text-slate-600'}`}>
                {isActive ? '● TRACKING' : '○ NO SIGNAL'}
              </div>
            </div>

            {/* 3D Canvas */}
            <Canvas camera={{ position: [2.5, 1.5, 3.5], fov: 42 }}>
              <ambientLight intensity={0.3} />
              <directionalLight position={[8, 10, 5]} intensity={1.2} />
              <directionalLight position={[-10, -8, -5]} intensity={0.6} color="#1d4ed8" />
              <pointLight position={[0, 4, 0]} intensity={0.4} color="#ef4444" />
              <Stars radius={80} depth={50} count={1000} factor={3} saturation={0} fade speed={0.5} />
              <CubeSatModel
                pitch={imuData?.pitch || 0}
                roll={imuData?.roll || 0}
                yaw={imuData?.yaw || 0}
              />
              <OrbitControls enablePan={false} enableZoom autoRotate={!isActive} autoRotateSpeed={0.6} />
            </Canvas>

            {/* Bottom IMU bar */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-slate-800/60 bg-[#040810]/70 backdrop-blur-sm px-4 py-2.5 flex items-center justify-between">
              <span className="text-[9px] text-slate-600 tracking-widest uppercase">Attitude / Orientation</span>
              <div className="flex gap-6 font-mono text-xs">
                <span>PITCH <span className="text-red-400 ml-1">{imuData ? imuData.pitch.toFixed(1) : '---'}°</span></span>
                <span>ROLL <span className="text-blue-400 ml-1">{imuData ? imuData.roll.toFixed(1) : '---'}°</span></span>
                <span>YAW <span className="text-slate-300 ml-1">{imuData ? imuData.yaw.toFixed(1) : '---'}°</span></span>
              </div>
            </div>
          </HUDPanel>

          {/* System Log Terminal */}
          <HUDPanel className="h-40 overflow-hidden" accentColor="blue">
            <div className="p-3 flex flex-col h-full">
              <SectionLabel>System Console</SectionLabel>
              <div className="flex-1 overflow-y-auto space-y-0.5 scrollbar-hide">
                {logs.length === 0 && (
                  <span className="text-slate-700 text-xs font-mono">Awaiting signal<span className="blink">_</span></span>
                )}
                {logs.map((log, i) => (
                  <div key={i} className="text-xs font-mono leading-relaxed">
                    <span className="text-blue-600 mr-1.5">{'>'}</span>
                    <span className={i === logs.length - 1 ? 'text-slate-300' : 'text-slate-500'}>{log}</span>
                  </div>
                ))}
              </div>
            </div>
          </HUDPanel>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">

          {/* Sensor Health Panel */}
          <HUDPanel accentColor="blue">
            <div className="p-4">
              <SectionLabel>Sensor Health Monitor</SectionLabel>
              <div className="space-y-2">
                {[
                  { icon: Cpu, label: 'MPU6050', sub: 'Inertial Measurement Unit', status: imuStatus as 'good' | 'bad' | 'offline', freq: '2.5s' },
                  { icon: Thermometer, label: 'DHT11', sub: 'Temperature & Humidity', status: envStatus as 'good' | 'bad' | 'offline', freq: '10s' },
                  { icon: MapPin, label: 'NEO-6M GPS', sub: 'Global Positioning', status: envStatus as 'good' | 'bad' | 'offline', freq: '10s' },
                ].map(({ icon: Icon, label, sub, status, freq }) => (
                  <div
                    key={label}
                    className={`flex items-center justify-between p-3 border transition-colors ${
                      status === 'good' ? 'border-emerald-900/50 bg-emerald-950/10' :
                      status === 'bad'  ? 'border-red-900/50 bg-red-950/10' :
                      'border-slate-800/50 bg-slate-900/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 border ${
                        status === 'good' ? 'border-emerald-800/60 text-emerald-500' :
                        status === 'bad'  ? 'border-red-800/60 text-red-500' :
                        'border-slate-700 text-slate-600'
                      }`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-200 tracking-wider">{label}</div>
                        <div className="text-[10px] text-slate-600">{sub} · {freq}</div>
                      </div>
                    </div>
                    <StatusDot status={status} />
                  </div>
                ))}
              </div>
            </div>
          </HUDPanel>

          {/* Telemetry Panel */}
          <HUDPanel accentColor="red">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-red-500" />
                  <span className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">Payload Telemetry</span>
                </div>
                <span className="text-[9px] text-slate-600 font-mono">10s PKT</span>
              </div>

              {/* Temp and Humidity big cards */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-slate-900/60 border border-red-900/30 p-3 flex flex-col gap-1 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-12 h-12 bg-red-900/10 rounded-bl-full" />
                  <Thermometer className="w-4 h-4 text-red-400 mb-1" />
                  <div className="text-3xl font-black font-mono text-slate-100 mono-data leading-none">
                    {envData && envData.temp !== -999 ? envData.temp.toFixed(1) : '--'}
                  </div>
                  <div className="text-[10px] tracking-widest text-slate-500">TEMP · °C</div>
                </div>

                <div className="bg-slate-900/60 border border-blue-900/30 p-3 flex flex-col gap-1 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-12 h-12 bg-blue-900/10 rounded-bl-full" />
                  <Droplets className="w-4 h-4 text-blue-400 mb-1" />
                  <div className="text-3xl font-black font-mono text-slate-100 mono-data leading-none">
                    {envData && envData.hum !== -999 ? envData.hum.toFixed(0) : '--'}
                  </div>
                  <div className="text-[10px] tracking-widest text-slate-500">HUM · %</div>
                </div>
              </div>

              {/* GPS */}
              <div className="bg-slate-900/60 border border-slate-800/60 p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-[10px] tracking-widest text-slate-500 uppercase">GPS Coordinates</span>
                </div>
                <DataRow
                  label="Latitude"
                  value={envData && envData.lat !== 0 ? envData.lat.toFixed(6) : 'SEARCHING...'}
                />
                <DataRow
                  label="Longitude"
                  value={envData && envData.lon !== 0 ? envData.lon.toFixed(6) : 'SEARCHING...'}
                />
              </div>
            </div>
          </HUDPanel>

          {/* Radar / Link Quality Panel */}
          <HUDPanel accentColor="blue" className="flex-1 min-h-[140px]">
            <div className="p-4 h-full flex flex-col">
              <SectionLabel>RF Uplink · NRF24L01</SectionLabel>
              <div className="flex-1 flex items-center justify-between gap-4">
                {/* Mini radar */}
                <div className="relative w-20 h-20 flex-shrink-0">
                  <div className="absolute inset-0 rounded-full border border-blue-900/40 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full border border-blue-900/40 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full border border-blue-900/40" />
                    </div>
                  </div>
                  {isActive && (
                    <>
                      <div className="radar-ping absolute inset-0 rounded-full border border-blue-500/40" />
                      <div className="radar-ping-delay absolute inset-0 rounded-full border border-blue-500/20" />
                    </>
                  )}
                  <div className={`absolute inset-0 flex items-center justify-center text-[9px] font-bold ${isActive ? 'text-blue-400' : 'text-slate-700'}`}>
                    {isActive ? 'LOCK' : 'NO SIG'}
                  </div>
                </div>

                {/* Link info */}
                <div className="flex-1 space-y-2">
                  <DataRow label="Frequency" value="433.500" unit="MHz" />
                  <DataRow label="Mode" value="NRF24L01" />
                  <DataRow label="Status" value={isConnected ? 'UPLINK' : isSimulating ? 'SIMUL.' : 'OFFLINE'} />
                </div>
              </div>
            </div>
          </HUDPanel>

        </div>
      </main>

      {/* Bottom status bar */}
      <footer className="border-t border-slate-900 bg-[#040810]/80 px-6 py-1.5 flex items-center justify-between">
        <div className="h-px w-16 bg-red-700/40" />
        <div className="flex items-center gap-6 text-[9px] font-mono text-slate-700 tracking-widest uppercase">
          <span>AESS · Aerospace &amp; Electronic Systems Society</span>
          <span className="text-slate-800">|</span>
          <span>CubeSat Mission · DHT11 · MPU6050 · NEO-6M · NRF24L01</span>
        </div>
        <div className="h-px w-16 bg-red-700/40" />
      </footer>
    </div>
  );
}
