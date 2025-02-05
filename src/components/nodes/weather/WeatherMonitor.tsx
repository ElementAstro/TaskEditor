import { useEffect } from 'react';
import useEditorStore from '@/store/editorStore';
import { Cloud, Thermometer, Droplets } from 'lucide-react';

export default function WeatherMonitor() {
  const { weatherData, updateWeatherData } = useEditorStore();

  useEffect(() => {
    // 模拟天气数据更新
    const interval = setInterval(() => {
      updateWeatherData({
        timestamp: Date.now(),
        temperature: 15 + Math.random() * 5,
        humidity: 60 + Math.random() * 20,
        cloudCover: Math.random() * 100,
        seeing: 1 + Math.random() * 3,
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [updateWeatherData]);

  if (!weatherData) return null;

  return (
    <div className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-2">Weather Conditions</h3>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Thermometer className="text-red-500" />
          <span>{weatherData.temperature.toFixed(1)}°C</span>
        </div>
        <div className="flex items-center gap-2">
          <Droplets className="text-blue-500" />
          <span>{weatherData.humidity.toFixed(1)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <Cloud className="text-gray-500" />
          <span>{weatherData.cloudCover.toFixed(1)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Seeing:</span>
          <span>{weatherData.seeing.toFixed(1)}&quot;</span>
        </div>
      </div>
    </div>
  );
}
