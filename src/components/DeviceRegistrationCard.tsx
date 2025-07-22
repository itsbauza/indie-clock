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
  const [credentials, setCredentials] = useState<any>(null);
  const [credentialsLoading, setCredentialsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function fetchDevices() {
    const res = await fetch('/api/device', { method: 'GET' });
    if (res.ok) {
      const data = await res.json();
      setDevices(data.devices || []);
    }
  }

  async function fetchCredentials() {
    setCredentialsLoading(true);
    try {
      const res = await fetch('/api/device/credentials', { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        setCredentials(data);
      }
    } catch (err) {
      console.error('Failed to fetch credentials:', err);
    } finally {
      setCredentialsLoading(false);
    }
  }

  useEffect(() => {
    fetchDevices();
    fetchCredentials();
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

  async function handleDelete(deviceId: string) {
    if (!confirm('Are you sure you want to delete this device? This action cannot be undone.')) {
      return;
    }

    setDeletingId(deviceId);
    try {
      const res = await fetch(`/api/device?deviceId=${deviceId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchDevices();
        fetchCredentials();
        // Clear device credentials if the deleted device was being shown
        if (device && getDeviceCredentials(deviceId)?.rabbitmqUsername === device.rabbitmqUsername) {
          setDevice(null);
        }
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete device');
      }
    } catch (err) {
      setError('Network error while deleting device');
    } finally {
      setDeletingId(null);
    }
  }

  function getDeviceCredentials(deviceId: string) {
    if (!credentials?.devices) return null;
    return credentials.devices.find((d: any) => d.id === deviceId);
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
          {devices.map((d) => {
            const deviceCreds = getDeviceCredentials(d.id);
            return (
              <div key={d.id} className="py-3">
                <div className="flex items-center justify-between">
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
                  <div className="flex items-center space-x-2">
                    {editingId === d.id ? (
                      <button
                        className="text-indigo-600 hover:underline text-sm"
                        onClick={() => handleEditSave(d.id)}
                        disabled={editLoading}
                      >
                        Save
                      </button>
                    ) : (
                      <>
                        <button
                          className="text-indigo-600 hover:underline text-sm"
                          onClick={() => handleEdit(d.id, d.name)}
                        >
                          Edit
                        </button>
                        {deviceCreds && (
                          <button
                            className="text-green-600 hover:underline text-sm"
                            onClick={() => {
                              setDevice({
                                broker: credentials.broker,
                                port: 1883,
                                rabbitmqUsername: deviceCreds.rabbitmqUsername,
                                rabbitmqPassword: deviceCreds.rabbitmqPassword,
                                topicPrefix: deviceCreds.topicPrefix,
                              });
                            }}
                          >
                            Show Credentials
                          </button>
                        )}
                        <button
                          className="text-red-600 hover:underline text-sm"
                          onClick={() => handleDelete(d.id)}
                          disabled={deletingId === d.id}
                        >
                          {deletingId === d.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {credentialsLoading && (
                  <div className="text-xs text-gray-500 mt-1">Loading credentials...</div>
                )}
              </div>
            );
          })}
          {devices.length === 0 && <div className="text-gray-500 text-sm">No devices registered yet.</div>}
        </div>
      </div>
    </div>
  );
} 