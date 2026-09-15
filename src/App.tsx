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

/* ─── Reusable HUD Panel ─── */
function HUDPanel({
  children,
  className = '',
  accentColor = 'red',
}: {
  children: React.ReactNode;
  className?: string;
  accentColor?: 'red' | 'blue' | 'green';
}) {
  const colorMap = {
    red:   'border-red-900/50 panel-accent-red box-glow-red',
    blue:  'border-blue-900/50 panel-accent-blue box-glow-blue',
    green: 'border-green-900/50 box-glow-green',
  };
  return (
    <div className={`relative bg-[#0d1520]/90 border backdrop-blur-sm ${colorMap[accentColor]} ${className}`}>
      <div className="hud-corner hud-corner-tl" />
      <div className="hud-corner hud-corner-tr" />
      <div className="hud-corner hud-corner-bl" />
      <div className="hud-corner hud-corner-br" />
      {children}
    </div>
  );
}

/* ─── Section heading with red accent bar ─── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div className="w-1 h-5 bg-red-500 rounded-sm flex-shrink-0" />
      <span className="text-xs font-semibold tracking-widest text-slate-300 uppercase">{children}</span>
      <div className="flex-1 h-px bg-slate-800/70" />
    </div>
  );
}

/* ─── Animated status dot + label ─── */
function StatusDot({ status }: { status: 'good' | 'bad' | 'offline' }) {
  if (status === 'good') return (
    <span className="flex items-center gap-2">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
        <span className="relative flex rounded-full h-2.5 w-2.5 bg-emerald-500 status-pulse-green" />
      </span>
      <span className="text-emerald-400 text-xs font-semibold tracking-wider glow-green">NOMINAL</span>
    </span>
  );
  if (status === 'bad') return (
    <span className="flex items-center gap-2">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-70" />
        <span className="relative flex rounded-full h-2.5 w-2.5 bg-red-500 status-pulse-red" />
      </span>
      <span className="text-red-400 text-xs font-semibold tracking-wider glow-red">ERROR</span>
    </span>
  );
  return (
    <span className="flex items-center gap-2">
      <span className="flex h-2.5 w-2.5 rounded-full bg-slate-700" />
      <span className="text-slate-600 text-xs font-medium tracking-wider">OFFLINE</span>
    </span>
  );
}

/* ─── Telemetry key/value row ─── */
function DataRow({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-800/60 last:border-0">
      <span className="text-xs text-slate-500 font-medium">{label}</span>
      <span className="mono-data text-sm text-slate-200 font-medium">
        {value}
        {unit && <span className="text-slate-500 text-xs ml-1">{unit}</span>}
      </span>
    </div>
  );
}

/* ─── Main App ─── */
export default function App() {
  const {
    isConnected,
    isSimulating,
    imuData,
    envData,
    logs,
    connectSerial,
    disconnectSerial,
    toggleSimulation,
  } = useSerial();

  const now = Date.now();
  const imuHealthy = imuData ? (now - imuData.timestamp < 5000)  : false;
  const envHealthy = envData ? (now - envData.timestamp < 15000) : false;

  const imuStatus = imuHealthy ? 'good' : (isConnected || isSimulating ? 'bad' : 'offline');
  const envStatus = envHealthy ? 'good' : (isConnected || isSimulating ? 'bad' : 'offline');

  const isActive = isConnected || isSimulating;

  return (
    <div className="min-h-screen bg-[#080d14] text-slate-300 flex flex-col grid-bg">

      {/* ═══════════════ HEADER ═══════════════ */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#080d14]/95 backdrop-blur-md">
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-red-600 to-transparent" />
        <div className="px-5 py-3 flex items-center justify-between gap-4">

          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="relative p-2 border border-red-700/60 bg-red-950/25 flex-shrink-0">
              <div className="hud-corner hud-corner-tl" style={{ width: 8, height: 8 }} />
              <div className="hud-corner hud-corner-br" style={{ width: 8, height: 8 }} />
              <Satellite className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-[0.18em] text-white uppercase leading-tight">
                AESS <span className="text-red-500 glow-red">GROUNDSTATION</span>
              </h1>
              <p className="text-[10px] text-slate-500 tracking-widest uppercase mt-0.5">
                Mission Control · CubeSat Digital Twin
              </p>
            </div>
          </div>

          {/* Link status pill */}
          <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 border text-xs font-semibold tracking-wide ${
            isActive
              ? 'border-emerald-700/60 text-emerald-400 bg-emerald-950/30'
              : 'border-slate-700/60 text-slate-500 bg-slate-900/30'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
            {isActive ? 'LIVE SIGNAL' : 'NO SIGNAL'}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2.5 ml-auto">
            <button
              onClick={toggleSimulation}
              className={`px-3.5 py-2 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase border transition-all ${
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
              className={`px-4 py-2 flex items-center gap-2 text-xs font-semibold tracking-wider uppercase border transition-all ${
                isSimulating
                  ? 'opacity-40 cursor-not-allowed border-slate-700 text-slate-600'
                  : isConnected
                    ? 'border-red-700/60 text-red-400 bg-red-950/30 box-glow-red'
                    : 'border-emerald-700/60 text-emerald-400 bg-emerald-950/30 box-glow-green hover:border-emerald-500'
              }`}
            >
              {isConnected ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
              {isConnected ? 'Disconnect' : 'Connect'}
              <Usb className="w-3 h-3 opacity-50" />
            </button>
          </div>
        </div>
      </header>

      {/* ═══════════════ BODY ═══════════════ */}
      <main className="flex-1 p-4 lg:p-5 grid grid-cols-12 gap-4">

        {/* ── LEFT: IMU attitude column ── */}
        <div className="col-span-12 lg:col-span-1 flex lg:flex-col gap-3">
          {[
            { label: 'PITCH', val: imuData?.pitch, color: 'text-red-400' },
            { label: 'ROLL',  val: imuData?.roll,  color: 'text-blue-400' },
            { label: 'YAW',   val: imuData?.yaw,   color: 'text-slate-300' },
          ].map(({ label, val, color }) => (
            <HUDPanel key={label} className="flex-1 flex flex-col items-center justify-center py-5 px-2 gap-1.5" accentColor="red">
              <span className="text-[9px] font-semibold tracking-widest text-slate-500">{label}</span>
              <span className={`mono-data text-2xl font-bold ${color}`}>
                {val != null ? val.toFixed(0) : '--'}
              </span>
              <span className="text-xs text-slate-600 font-medium">deg</span>
            </HUDPanel>
          ))}
        </div>

        {/* ── CENTER: 3D Canvas + Console ── */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-4">

          {/* 3D Canvas */}
          <HUDPanel className="flex-1 min-h-[460px] lg:min-h-[520px] overflow-hidden" accentColor="red">
            <div className="scan-line" />

            {/* Canvas label */}
            <div className="absolute top-4 left-5 z-10 flex items-center gap-2.5">
              <Radio className="w-4 h-4 text-blue-400 animate-pulse flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-200 tracking-wide">Digital Twin</p>
                <p className="text-[10px] text-slate-500 mt-0.5">MPU6050 · 2.5s update interval</p>
              </div>
            </div>

            {/* Signal badge */}
            <div className="absolute top-4 right-5 z-10 text-right">
              <span className={`text-xs font-semibold ${isActive ? 'text-emerald-400 glow-green' : 'text-slate-600'}`}>
                {isActive ? '● TRACKING' : '○ NO SIGNAL'}
              </span>
            </div>

            <Canvas camera={{ position: [2.8, 1.6, 3.8], fov: 40 }}>
              <ambientLight intensity={0.8} />
              <directionalLight position={[10, 20, 10]} intensity={2.5} color="#ffffff" />
              <directionalLight position={[-10, -20, -10]} intensity={1.5} color="#93c5fd" />
              <pointLight position={[0, 5, 5]} intensity={2.0} color="#ffffff" />
              <pointLight position={[0, -5, -5]} intensity={1.0} color="#ef4444" />
              <Stars radius={80} depth={50} count={1200} factor={3} saturation={0} fade speed={0.4} />
              <CubeSatModel
                pitch={imuData?.pitch || 0}
                roll={imuData?.roll  || 0}
                yaw={imuData?.yaw   || 0}
              />
              <OrbitControls enablePan={false} enableZoom autoRotate={!isActive} autoRotateSpeed={0.7} />
            </Canvas>

            {/* Bottom IMU strip */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-slate-800/60 bg-[#080d14]/75 backdrop-blur-sm px-4 py-2.5 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-medium">Attitude · Orientation</span>
              <div className="flex gap-5 mono-data text-xs">
                <span className="text-slate-500">P: <span className="text-red-400 font-semibold">{imuData ? imuData.pitch.toFixed(1) : '---'}°</span></span>
                <span className="text-slate-500">R: <span className="text-blue-400 font-semibold">{imuData ? imuData.roll.toFixed(1)  : '---'}°</span></span>
                <span className="text-slate-500">Y: <span className="text-slate-300 font-semibold">{imuData ? imuData.yaw.toFixed(1)   : '---'}°</span></span>
              </div>
            </div>
          </HUDPanel>

          {/* Console */}
          <HUDPanel className="h-40 overflow-hidden" accentColor="blue">
            <div className="p-4 flex flex-col h-full">
              <SectionLabel>System Console</SectionLabel>
              <div className="flex-1 overflow-y-auto space-y-1 scrollbar-hide">
                {logs.length === 0 && (
                  <p className="text-slate-600 text-xs mono-data">Awaiting connection<span className="blink">_</span></p>
                )}
                {logs.map((log, i) => (
                  <div key={i} className="text-xs flex gap-2 leading-relaxed">
                    <span className="text-blue-600 flex-shrink-0">›</span>
                    <span className={`mono-data ${i === logs.length - 1 ? 'text-slate-300' : 'text-slate-500'}`}>{log}</span>
                  </div>
                ))}
              </div>
            </div>
          </HUDPanel>
        </div>

        {/* ── RIGHT: Health + Telemetry + RF ── */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">

          {/* Sensor Health */}
          <HUDPanel accentColor="blue">
            <div className="p-4">
              <SectionLabel>Sensor Health</SectionLabel>
              <div className="space-y-2">
                {[
                  { icon: Cpu,         label: 'MPU6050', sub: 'Inertial Measurement',    status: imuStatus as 'good'|'bad'|'offline', freq: '2.5s' },
                  { icon: Thermometer, label: 'DHT11',   sub: 'Temperature & Humidity',  status: envStatus as 'good'|'bad'|'offline', freq: '10s'  },
                  { icon: MapPin,      label: 'NEO-6M',  sub: 'GPS Module',               status: envStatus as 'good'|'bad'|'offline', freq: '10s'  },
                ].map(({ icon: Icon, label, sub, status, freq }) => (
                  <div
                    key={label}
                    className={`flex items-center justify-between p-3 border transition-all ${
                      status === 'good' ? 'border-emerald-900/50 bg-emerald-950/10'
                    : status === 'bad'  ? 'border-red-900/50 bg-red-950/10'
                    : 'border-slate-800/50 bg-slate-900/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 border flex-shrink-0 ${
                        status === 'good' ? 'border-emerald-800/60 text-emerald-500'
                      : status === 'bad'  ? 'border-red-800/60 text-red-500'
                      : 'border-slate-700 text-slate-600'
                      }`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-200">{label}</p>
                        <p className="text-xs text-slate-500">{sub} · <span className="mono-data">{freq}</span></p>
                      </div>
                    </div>
                    <StatusDot status={status} />
                  </div>
                ))}
              </div>
            </div>
          </HUDPanel>

          {/* Telemetry */}
          <HUDPanel accentColor="red">
            <div className="p-4">
              <SectionLabel>Payload Telemetry</SectionLabel>

              {/* Big metric cards */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-900/60 border border-red-900/30 p-3.5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-14 h-14 bg-red-900/10 rounded-bl-2xl" />
                  <Thermometer className="w-4 h-4 text-red-400 mb-2" />
                  <div className="mono-data text-3xl font-bold text-slate-100 leading-none">
                    {envData && envData.temp !== -999 ? envData.temp.toFixed(1) : '--'}
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5 font-medium">Temperature · °C</p>
                </div>

                <div className="bg-slate-900/60 border border-blue-900/30 p-3.5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-14 h-14 bg-blue-900/10 rounded-bl-2xl" />
                  <Droplets className="w-4 h-4 text-blue-400 mb-2" />
                  <div className="mono-data text-3xl font-bold text-slate-100 leading-none">
                    {envData && envData.hum !== -999 ? envData.hum.toFixed(0) : '--'}
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5 font-medium">Humidity · %RH</p>
                </div>
              </div>

              {/* GPS block */}
              <div className="bg-slate-900/60 border border-slate-700/40 p-3.5">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-semibold text-slate-300 tracking-wide">GPS Coordinates</span>
                </div>
                <DataRow
                  label="Latitude"
                  value={envData && envData.lat !== 0 ? envData.lat.toFixed(6) : 'SEARCHING…'}
                />
                <DataRow
                  label="Longitude"
                  value={envData && envData.lon !== 0 ? envData.lon.toFixed(6) : 'SEARCHING…'}
                />
              </div>
            </div>
          </HUDPanel>

          {/* RF Uplink panel */}
          <HUDPanel accentColor="blue" className="flex-1">
            <div className="p-4 h-full flex flex-col">
              <SectionLabel>RF Uplink · NRF24L01</SectionLabel>
              <div className="flex items-center gap-5 flex-1">
                {/* Radar */}
                <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
                  <div className="absolute w-20 h-20 rounded-full border border-blue-900/50" />
                  <div className="absolute w-14 h-14 rounded-full border border-blue-900/40" />
                  <div className="absolute w-8  h-8  rounded-full border border-blue-900/40" />
                  {isActive && (
                    <>
                      <div className="radar-ping absolute w-20 h-20 rounded-full border border-blue-500/50" />
                      <div className="radar-ping-delay absolute w-20 h-20 rounded-full border border-blue-400/30" />
                    </>
                  )}
                  <span className={`text-[10px] font-bold tracking-widest ${isActive ? 'text-blue-400 glow-blue' : 'text-slate-700'}`}>
                    {isActive ? 'LOCK' : '---'}
                  </span>
                </div>

                {/* Link details */}
                <div className="flex-1 space-y-0.5">
                  <DataRow label="Frequency" value="433.500" unit="MHz" />
                  <DataRow label="Protocol"  value="NRF24L01+" />
                  <DataRow label="Status"    value={isConnected ? 'UPLINK' : isSimulating ? 'SIM' : 'OFFLINE'} />
                  <DataRow label="LCD"       value="16×2 · I2C" />
                </div>
              </div>
            </div>
          </HUDPanel>

        </div>
      </main>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="border-t border-slate-800/60 bg-[#080d14]/80 px-6 py-2 flex items-center justify-between">
        <div className="h-px w-12 bg-gradient-to-r from-transparent to-red-700/50" />
        <p className="text-[10px] text-slate-600 tracking-widest uppercase font-medium">
          AESS · CubeSat Mission · DHT11 / MPU6050 / NEO-6M / NRF24L01
        </p>
        <div className="h-px w-12 bg-gradient-to-l from-transparent to-red-700/50" />
      </footer>
    </div>
  );
}
