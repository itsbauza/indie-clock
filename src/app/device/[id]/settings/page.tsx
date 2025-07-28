"use client"

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface DeviceSettings {
  brightness: number;
  volume: number;
  autoBrightness: boolean;
  timezone: string;
  language: string;
  displayTimeout: number;
  ledCount: number;
  matrixWidth: number;
  matrixHeight: number;
  wifiSSID: string;
  wifiPassword: string;
  mqttEnabled: boolean;
  mqttBroker: string;
  mqttPort: number;
  mqttUsername: string;
  mqttPassword: string;
  mqttTopic: string;
  ntpServer: string;
  timeFormat: '12h' | '24h';
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  temperatureUnit: 'celsius' | 'fahrenheit';
  soundEnabled: boolean;
  startupAnimation: boolean;
  powerSaveMode: boolean;
  customApps: string[];
}

export default function DeviceSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const deviceId = params.id as string;

  const [device, setDevice] = useState<any>(null);
  const [settings, setSettings] = useState<DeviceSettings>({
    brightness: 50,
    volume: 50,
    autoBrightness: true,
    timezone: 'UTC',
    language: 'en',
    displayTimeout: 30,
    ledCount: 256,
    matrixWidth: 32,
    matrixHeight: 8,
    wifiSSID: '',
    wifiPassword: '',
    mqttEnabled: true,
    mqttBroker: '',
    mqttPort: 1883,
    mqttUsername: '',
    mqttPassword: '',
    mqttTopic: '',
    ntpServer: 'pool.ntp.org',
    timeFormat: '24h',
    dateFormat: 'DD/MM/YYYY',
    temperatureUnit: 'celsius',
    soundEnabled: true,
    startupAnimation: true,
    powerSaveMode: false,
    customApps: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated" && deviceId) {
      fetchDeviceAndSettings();
    }
  }, [status, deviceId, router]);

  async function fetchDeviceAndSettings() {
    try {
      setLoading(true);
      const [deviceRes, settingsRes] = await Promise.all([
        fetch(`/api/device/${deviceId}`),
        fetch(`/api/device/${deviceId}/settings`)
      ]);

      if (deviceRes.ok) {
        const deviceData = await deviceRes.json();
        setDevice(deviceData.device);
      }

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData.settings);
      }
    } catch (err) {
      setError('Failed to load device settings');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveSettings() {
    try {
      setSaving(true);
      setError('');

      const res = await fetch(`/api/device/${deviceId}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to save settings');
        return;
      }

      // Show success message
      alert('Settings saved successfully!');
    } catch (err) {
      setError('Network error while saving settings');
    } finally {
      setSaving(false);
    }
  }

  async function handleApplyToDevice() {
    try {
      setSaving(true);
      setError('');

      const res = await fetch(`/api/device/${deviceId}/settings/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to apply settings to device');
        return;
      }

      alert('Settings applied to device successfully!');
    } catch (err) {
      setError('Network error while applying settings');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading device settings...</p>
        </div>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Device Not Found</h1>
          <p className="text-gray-600 mb-6">The device you're looking for doesn't exist or you don't have permission to access it.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Device Settings</h1>
            <p className="text-gray-600 mt-2">
              Configure hardware settings for {device.name || 'your device'}
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 hover:text-gray-800 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Settings Categories */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings Categories</h3>
            <nav className="space-y-2">
              <a href="#display" className="block text-sm text-gray-600 hover:text-indigo-600 py-2">
                Display & Brightness
              </a>
              <a href="#audio" className="block text-sm text-gray-600 hover:text-indigo-600 py-2">
                Audio Settings
              </a>
              <a href="#network" className="block text-sm text-gray-600 hover:text-indigo-600 py-2">
                Network & MQTT
              </a>
              <a href="#time" className="block text-sm text-gray-600 hover:text-indigo-600 py-2">
                Time & Date
              </a>
              <a href="#hardware" className="block text-sm text-gray-600 hover:text-indigo-600 py-2">
                Hardware Configuration
              </a>
              <a href="#power" className="block text-sm text-gray-600 hover:text-indigo-600 py-2">
                Power Management
              </a>
            </nav>
          </div>
        </div>

        {/* Settings Forms */}
        <div className="lg:col-span-2 space-y-8">
          {/* Display & Brightness */}
          <div id="display" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Display & Brightness</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brightness Level
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.brightness}
                    onChange={(e) => setSettings({...settings, brightness: parseInt(e.target.value)})}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600 w-12">{settings.brightness}%</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Auto Brightness
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.autoBrightness}
                    onChange={(e) => setSettings({...settings, autoBrightness: e.target.checked})}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable automatic brightness adjustment</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Timeout (seconds)
                </label>
                <input
                  type="number"
                  min="0"
                  max="3600"
                  value={settings.displayTimeout}
                  onChange={(e) => setSettings({...settings, displayTimeout: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Startup Animation
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.startupAnimation}
                    onChange={(e) => setSettings({...settings, startupAnimation: e.target.checked})}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Show animation on startup</span>
                </label>
              </div>
            </div>
          </div>

          {/* Audio Settings */}
          <div id="audio" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Audio Settings</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Volume Level
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.volume}
                    onChange={(e) => setSettings({...settings, volume: parseInt(e.target.value)})}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600 w-12">{settings.volume}%</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sound Enabled
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={(e) => setSettings({...settings, soundEnabled: e.target.checked})}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable audio output</span>
                </label>
              </div>
            </div>
          </div>

          {/* Network & MQTT */}
          <div id="network" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Network & MQTT</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WiFi SSID
                </label>
                <input
                  type="text"
                  value={settings.wifiSSID}
                  onChange={(e) => setSettings({...settings, wifiSSID: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Your WiFi network name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  WiFi Password
                </label>
                <input
                  type="password"
                  value={settings.wifiPassword}
                  onChange={(e) => setSettings({...settings, wifiPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Your WiFi password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  MQTT Enabled
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.mqttEnabled}
                    onChange={(e) => setSettings({...settings, mqttEnabled: e.target.checked})}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable MQTT communication</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  MQTT Broker
                </label>
                <input
                  type="text"
                  value={settings.mqttBroker}
                  onChange={(e) => setSettings({...settings, mqttBroker: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="mqtt://broker.example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  MQTT Port
                </label>
                <input
                  type="number"
                  min="1"
                  max="65535"
                  value={settings.mqttPort}
                  onChange={(e) => setSettings({...settings, mqttPort: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  MQTT Topic
                </label>
                <input
                  type="text"
                  value={settings.mqttTopic}
                  onChange={(e) => setSettings({...settings, mqttTopic: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="awtrix/device"
                />
              </div>
            </div>
          </div>

          {/* Time & Date */}
          <div id="time" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Time & Date</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <select
                  value={settings.timezone}
                  onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Format
                </label>
                <select
                  value={settings.timeFormat}
                  onChange={(e) => setSettings({...settings, timeFormat: e.target.value as '12h' | '24h'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="24h">24-hour</option>
                  <option value="12h">12-hour</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Format
                </label>
                <select
                  value={settings.dateFormat}
                  onChange={(e) => setSettings({...settings, dateFormat: e.target.value as 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NTP Server
                </label>
                <input
                  type="text"
                  value={settings.ntpServer}
                  onChange={(e) => setSettings({...settings, ntpServer: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="pool.ntp.org"
                />
              </div>
            </div>
          </div>

          {/* Hardware Configuration */}
          <div id="hardware" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Hardware Configuration</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LED Count
                </label>
                <input
                  type="number"
                  min="1"
                  max="1024"
                  value={settings.ledCount}
                  onChange={(e) => setSettings({...settings, ledCount: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Matrix Width
                </label>
                <input
                  type="number"
                  min="1"
                  max="64"
                  value={settings.matrixWidth}
                  onChange={(e) => setSettings({...settings, matrixWidth: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Matrix Height
                </label>
                <input
                  type="number"
                  min="1"
                  max="32"
                  value={settings.matrixHeight}
                  onChange={(e) => setSettings({...settings, matrixHeight: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperature Unit
                </label>
                <select
                  value={settings.temperatureUnit}
                  onChange={(e) => setSettings({...settings, temperatureUnit: e.target.value as 'celsius' | 'fahrenheit'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="celsius">Celsius</option>
                  <option value="fahrenheit">Fahrenheit</option>
                </select>
              </div>
            </div>
          </div>

          {/* Power Management */}
          <div id="power" className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Power Management</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Power Save Mode
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.powerSaveMode}
                    onChange={(e) => setSettings({...settings, powerSaveMode: e.target.checked})}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable power saving features</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-end space-x-4">
        <button
          onClick={() => router.push('/dashboard')}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg transition-colors flex items-center"
        >
          {saving ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            'Save Settings'
          )}
        </button>
        <button
          onClick={handleApplyToDevice}
          disabled={saving}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors flex items-center"
        >
          {saving ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Applying...
            </>
          ) : (
            'Apply to Device'
          )}
        </button>
      </div>
    </div>
  );
} 