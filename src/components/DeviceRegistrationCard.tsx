import { useState, useEffect } from 'react';

export default function DeviceRegistrationCard() {
  const [name, setName] = useState('');
  const [device, setDevice] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devices, setDevices] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  async function fetchDevices() {
    const res = await fetch('/api/device', { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      setDevices(data.devices || []);
    }
  }

  useEffect(() => {
    fetchDevices();
  }, []);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setDevice(null);
    try {
      const res = await fetch('/api/device', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to register device');
        setLoading(false);
        return;
      }
      const data = await res.json();
      setDevice(data);
      setName('');
      fetchDevices();
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  async function handleEdit(deviceId: string, currentName: string) {
    setEditingId(deviceId);
    setEditName(currentName);
  }

  async function handleEditSave(deviceId: string) {
    setEditLoading(true);
    try {
      const res = await fetch(`/api/device`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, name: editName }),
      });
      if (res.ok) {
        fetchDevices();
        setEditingId(null);
      }
    } finally {
      setEditLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Register New AWTRIX Device</h3>
      <form onSubmit={handleRegister} className="space-y-4">
        <input
          type="text"
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Device name (optional)"
          value={name}
          onChange={e => setName(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register Device'}
        </button>
      </form>
      {error && <div className="text-red-600 mt-4">{error}</div>}
      {device && (
        <div className="mt-6">
          <h4 className="text-lg font-semibold mb-2">Device Credentials</h4>
          <div className="space-y-1 text-sm">
            <div><b>Broker:</b> {device.broker}</div>
            <div><b>Port:</b> {device.port}</div>
            <div><b>Username:</b> {device.rabbitmqUsername}</div>
            <div><b>Password:</b> {device.rabbitmqPassword}</div>
            <div><b>Prefix:</b> {device.topicPrefix}</div>
          </div>
          <div className="mt-2 text-xs text-gray-500">Enter these values in your AWTRIX MQTT setup screen.</div>
        </div>
      )}
      <div className="mt-8">
        <h4 className="text-lg font-semibold mb-2">Your Devices</h4>
        <div className="divide-y divide-gray-200">
          {devices.map((d) => (
            <div key={d.id} className="py-3 flex items-center justify-between">
              <div>
                {editingId === d.id ? (
                  <input
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    disabled={editLoading}
                  />
                ) : (
                  <span className="font-medium text-gray-900">{d.name || '(unnamed device)'}</span>
                )}
                <div className="text-xs text-gray-500">{d.topicPrefix}</div>
              </div>
              <div>
                {editingId === d.id ? (
                  <button
                    className="ml-2 text-indigo-600 hover:underline text-sm"
                    onClick={() => handleEditSave(d.id)}
                    disabled={editLoading}
                  >
                    Save
                  </button>
                ) : (
                  <button
                    className="ml-2 text-indigo-600 hover:underline text-sm"
                    onClick={() => handleEdit(d.id, d.name)}
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          ))}
          {devices.length === 0 && <div className="text-gray-500 text-sm">No devices registered yet.</div>}
        </div>
      </div>
    </div>
  );
} 