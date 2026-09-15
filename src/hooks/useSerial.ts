import { useState, useEffect, useCallback, useRef } from 'react';

export interface IMUData {
  pitch: number;
  roll: number;
  yaw: number;
  timestamp: number;
}

export interface EnvData {
  temp: number;
  hum: number;
  lat: number;
  lon: number;
  timestamp: number;
}

export function useSerial() {
  const [isConnected, setIsConnected] = useState(false);
  const [imuData, setImuData] = useState<IMUData | null>(null);
  const [envData, setEnvData] = useState<EnvData | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  const portRef = useRef<any>(null);
  const readerRef = useRef<any>(null);

  const addLog = useCallback((msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev.slice(-49), `[${time}] ${msg}`]);
  }, []);

  const parseData = useCallback((dataStr: string) => {
    try {
      const data = JSON.parse(dataStr);
      const timestamp = Date.now();
      if (data.type === 'imu') {
        setImuData({ pitch: data.pitch, roll: data.roll, yaw: data.yaw, timestamp });
      } else if (data.type === 'env') {
        setEnvData({ temp: data.temp, hum: data.hum, lat: data.lat, lon: data.lon, timestamp });
      }
    } catch (e) {
      // Ignore parse errors, could be incomplete line or other serial noise
    }
  }, []);

  const connectSerial = async () => {
    if (isSimulating) {
        setIsSimulating(false);
    }
    try {
      if (!('serial' in navigator)) {
        addLog("ERROR: Web Serial API not supported in this browser.");
        return;
      }
      
      // Request a port and open a connection
      // @ts-ignore
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });
      portRef.current = port;
      setIsConnected(true);
      addLog("Connected to Groundstation via Web Serial.");

      // Set up reader
      const textDecoder = new TextDecoderStream();
      port.readable.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();
      readerRef.current = reader;

      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          reader.releaseLock();
          break;
        }
        if (value) {
          buffer += value;
          const lines = buffer.split('\n');
          // keep the last incomplete part in the buffer
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (line.trim()) {
              parseData(line.trim());
            }
          }
        }
      }
    } catch (error: any) {
      setIsConnected(false);
      addLog(`ERROR: ${error.message}`);
    }
  };

  const disconnectSerial = async () => {
    try {
      if (readerRef.current) {
        await readerRef.current.cancel();
        readerRef.current = null;
      }
      if (portRef.current) {
        await portRef.current.close();
        portRef.current = null;
      }
      setIsConnected(false);
      addLog("Disconnected from Groundstation.");
    } catch (err: any) {
      addLog(`Disconnect Error: ${err.message}`);
    }
  };

  const toggleSimulation = () => {
      if (isConnected) {
          disconnectSerial();
      }
      setIsSimulating(!isSimulating);
      if (!isSimulating) {
          addLog("Simulation Mode Started");
      } else {
          addLog("Simulation Mode Stopped");
      }
  };

  // Simulation effect
  useEffect(() => {
    let imuInterval: ReturnType<typeof setInterval>;
    let envInterval: ReturnType<typeof setInterval>;

    if (isSimulating) {
        let pitch = 0;
        let roll = 0;
        let yaw = 0;

        // Simulate MPU6050 every 2.5s
        imuInterval = setInterval(() => {
            pitch += (Math.random() - 0.5) * 10;
            roll += (Math.random() - 0.5) * 10;
            yaw += (Math.random() - 0.5) * 5;
            // keep bounds roughly reasonable for visual
            if (pitch > 180) pitch -= 360;
            if (pitch < -180) pitch += 360;
            if (roll > 180) roll -= 360;
            if (roll < -180) roll += 360;
            
            parseData(JSON.stringify({ type: 'imu', pitch, roll, yaw }));
        }, 2500);

        // Simulate DHT11/GPS every 10s
        envInterval = setInterval(() => {
            const temp = 20 + Math.random() * 10;
            const hum = 40 + Math.random() * 20;
            const lat = 28.6139 + (Math.random() - 0.5) * 0.01;
            const lon = 77.2090 + (Math.random() - 0.5) * 0.01;
            parseData(JSON.stringify({ type: 'env', temp, hum, lat, lon }));
        }, 10000);

        // Trigger initial data
        parseData(JSON.stringify({ type: 'env', temp: 24, hum: 45, lat: 28.6139, lon: 77.2090 }));
        parseData(JSON.stringify({ type: 'imu', pitch: 0, roll: 0, yaw: 0 }));
    }

    return () => {
        clearInterval(imuInterval);
        clearInterval(envInterval);
    };
  }, [isSimulating, parseData]);

  return {
    isConnected,
    isSimulating,
    imuData,
    envData,
    logs,
    connectSerial,
    disconnectSerial,
    toggleSimulation
  };
}
