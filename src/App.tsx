
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { 
  Activity, 
  Thermometer, 
  Droplets, 
  MapPin,
  Cpu, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  Usb,
  Radio,
  XCircle
} from 'lucide-react';
import { useSerial } from './hooks/useSerial';
import { CubeSatModel } from './components/CubeSatModel';

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

  // Health Monitoring Logic
  const now = Date.now();
  
  // Consider IMU healthy if updated in last 5 seconds (expected ~2.5s)
  const imuHealthy = imuData ? (now - imuData.timestamp < 5000) : false;
  
  // Consider Env/GPS healthy if updated in last 15 seconds (expected ~10s)
  const envHealthy = envData ? (now - envData.timestamp < 15000) : false;

  const imuStatus = imuHealthy ? 'good' : (isConnected || isSimulating ? 'bad' : 'offline');
  const envStatus = envHealthy ? 'good' : (isConnected || isSimulating ? 'bad' : 'offline');

  const StatusIcon = ({ status }: { status: 'good' | 'bad' | 'offline' }) => {
    if (status === 'good') return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    if (status === 'bad') return <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />;
    return <XCircle className="w-5 h-5 text-slate-600" />;
  };

  return (
    <div className="min-h-screen bg-black text-slate-300 flex flex-col font-sans selection:bg-red-500/30">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-red-950/40 text-red-500 rounded border border-red-500/30">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-widest text-slate-100 uppercase flex items-center gap-2">
              AESS <span className="text-red-500">GROUNDSTATION</span>
            </h1>
            <p className="text-xs text-slate-500 font-mono tracking-widest">MISSION CONTROL // DIGITAL TWIN</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleSimulation}
            className={`px-4 py-2 rounded text-sm font-bold tracking-wider uppercase border transition-colors ${
              isSimulating 
                ? 'bg-blue-900/20 border-blue-500/50 text-blue-400' 
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500'
            }`}
          >
            {isSimulating ? 'Stop Sim' : 'Start Sim'}
          </button>
          
          <button
            onClick={isConnected ? disconnectSerial : connectSerial}
            disabled={isSimulating}
            className={`px-6 py-2 rounded text-sm font-bold tracking-wider uppercase flex items-center gap-2 border transition-all ${
              isSimulating 
                ? 'opacity-50 cursor-not-allowed bg-slate-800 border-slate-700'
                : isConnected
                  ? 'bg-red-500/10 border-red-500/50 text-red-400 hover:bg-red-500/20'
                  : 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20'
            }`}
          >
            <Usb className="w-4 h-4" />
            {isConnected ? 'Disconnect' : 'Connect USB'}
          </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Digital Twin Canvas */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl relative overflow-hidden flex-1 min-h-[500px]">
            {/* Top Red Strip Accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-red-600" />
            
            <div className="absolute top-4 left-4 z-10">
              <h2 className="text-slate-100 font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                <Radio className="w-4 h-4 text-blue-400" />
                Digital Twin
              </h2>
              <p className="text-xs text-slate-500 font-mono mt-1">REAL-TIME MPU6050 TELEMETRY</p>
            </div>
            
            <Canvas camera={{ position: [2, 2, 3], fov: 45 }}>
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 10, 5]} intensity={1} />
              <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#1d4ed8" />
              <Environment preset="night" />
              
              <CubeSatModel 
                pitch={imuData?.pitch || 0}
                roll={imuData?.roll || 0}
                yaw={imuData?.yaw || 0}
              />
              
              <OrbitControls enablePan={false} enableZoom={true} />
            </Canvas>

            {/* IMU Overlay Stats */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs font-mono">
              <div className="bg-black/60 px-3 py-1.5 rounded border border-slate-800 backdrop-blur">
                PITCH: <span className="text-blue-400">{imuData ? imuData.pitch.toFixed(1) : '---'}°</span>
              </div>
              <div className="bg-black/60 px-3 py-1.5 rounded border border-slate-800 backdrop-blur">
                ROLL: <span className="text-blue-400">{imuData ? imuData.roll.toFixed(1) : '---'}°</span>
              </div>
              <div className="bg-black/60 px-3 py-1.5 rounded border border-slate-800 backdrop-blur">
                YAW: <span className="text-blue-400">{imuData ? imuData.yaw.toFixed(1) : '---'}°</span>
              </div>
            </div>
          </div>

          {/* Logs */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 h-48 flex flex-col">
            <h3 className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-3 border-b border-slate-800 pb-2">System Logs</h3>
            <div className="flex-1 overflow-y-auto font-mono text-xs space-y-1">
              {logs.length === 0 && <span className="text-slate-600">No logs available.</span>}
              {logs.map((log, i) => (
                <div key={i} className="text-slate-400">
                  <span className="text-blue-500 mr-2">&gt;</span>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Telemetry & Health */}
        <div className="space-y-6">
          
          {/* Sensor Health Monitoring */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
            <h2 className="text-slate-100 font-bold uppercase tracking-widest text-sm mb-4">Sensor Health</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-950 rounded border border-slate-800">
                <div className="flex items-center gap-3">
                  <Cpu className="w-5 h-5 text-slate-400" />
                  <span className="font-mono text-sm">MPU6050 (IMU)</span>
                </div>
                <StatusIcon status={imuStatus} />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-950 rounded border border-slate-800">
                <div className="flex items-center gap-3">
                  <Thermometer className="w-5 h-5 text-slate-400" />
                  <span className="font-mono text-sm">DHT11 (Env)</span>
                </div>
                <StatusIcon status={envStatus} />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-950 rounded border border-slate-800">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-slate-400" />
                  <span className="font-mono text-sm">NEO-6M (GPS)</span>
                </div>
                <StatusIcon status={envStatus} />
              </div>
            </div>
          </div>

          {/* Telemetry Data */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-600" />
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-slate-100 font-bold uppercase tracking-widest text-sm">Telemetry</h2>
              <div className="flex items-center gap-1 text-xs text-slate-500 font-mono">
                <RefreshCw className={`w-3 h-3 ${envHealthy ? 'animate-spin' : ''}`} />
                10s INTERVAL
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded border border-slate-800 flex flex-col items-center justify-center text-center">
                <Thermometer className="w-6 h-6 text-red-400 mb-2" />
                <div className="text-2xl font-mono text-slate-200">
                  {envData && envData.temp !== -999 ? envData.temp.toFixed(1) : '--'}
                  <span className="text-sm text-slate-500 ml-1">°C</span>
                </div>
                <div className="text-[10px] text-slate-500 tracking-widest uppercase mt-1">Temperature</div>
              </div>

              <div className="bg-slate-950 p-4 rounded border border-slate-800 flex flex-col items-center justify-center text-center">
                <Droplets className="w-6 h-6 text-blue-400 mb-2" />
                <div className="text-2xl font-mono text-slate-200">
                  {envData && envData.hum !== -999 ? envData.hum.toFixed(0) : '--'}
                  <span className="text-sm text-slate-500 ml-1">%</span>
                </div>
                <div className="text-[10px] text-slate-500 tracking-widest uppercase mt-1">Humidity</div>
              </div>
            </div>

            <div className="mt-4 bg-slate-950 p-4 rounded border border-slate-800">
              <div className="flex items-center gap-2 mb-2 text-slate-400">
                <MapPin className="w-4 h-4" />
                <span className="text-xs font-bold tracking-widest uppercase">GPS Position</span>
              </div>
              <div className="flex justify-between font-mono text-sm">
                <span>LAT:</span>
                <span className="text-slate-200">{envData && envData.lat !== 0 ? envData.lat.toFixed(6) : 'SEARCHING...'}</span>
              </div>
              <div className="flex justify-between font-mono text-sm mt-1">
                <span>LON:</span>
                <span className="text-slate-200">{envData && envData.lon !== 0 ? envData.lon.toFixed(6) : 'SEARCHING...'}</span>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
