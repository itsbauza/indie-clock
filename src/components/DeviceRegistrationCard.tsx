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
  const [showCredentials, setShowCredentials] = useState<string | null>(null);

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

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Device Management</h2>
        <p className="text-gray-600">Register and manage your AWTRIX devices</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Registration Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Register New Device</h3>
              <p className="text-sm text-gray-500">Add a new AWTRIX device to your account</p>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="deviceName" className="block text-sm font-medium text-gray-700 mb-2">
                Device Name
              </label>
              <input
                id="deviceName"
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Enter device name (optional)"
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registering...
                </>
              ) : (
                'Register Device'
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-800 text-sm">{error}</span>
              </div>
            </div>
          )}

          {device && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center mb-3">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <h4 className="font-medium text-green-900">Device Registered Successfully!</h4>
              </div>
                             <div className="space-y-2 text-sm">
                 <div className="flex justify-between items-start">
                   <span className="text-green-700 font-medium flex-shrink-0 mr-2">Broker:</span>
                   <span className="text-green-800 font-mono break-all text-right">{device.broker}</span>
                 </div>
                 <div className="flex justify-between items-start">
                   <span className="text-green-700 font-medium flex-shrink-0 mr-2">Port:</span>
                   <span className="text-green-800 font-mono break-all text-right">{device.port}</span>
                 </div>
                 <div className="flex justify-between items-start">
                   <span className="text-green-700 font-medium flex-shrink-0 mr-2">Username:</span>
                   <span className="text-green-800 font-mono break-all text-right">{device.rabbitmqUsername}</span>
                 </div>
                 <div className="flex justify-between items-start">
                   <span className="text-green-700 font-medium flex-shrink-0 mr-2">Password:</span>
                   <span className="text-green-800 font-mono break-all text-right">{device.rabbitmqPassword}</span>
                 </div>
                 <div className="flex justify-between items-start">
                   <span className="text-green-700 font-medium flex-shrink-0 mr-2">Topic Prefix:</span>
                   <span className="text-green-800 font-mono break-all text-right">{device.topicPrefix}</span>
                 </div>
               </div>
              <div className="mt-3 text-xs text-green-600">
                Enter these values in your AWTRIX MQTT setup screen.
              </div>
            </div>
          )}
        </div>

        {/* Device List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Your Devices</h3>
              <p className="text-sm text-gray-500">{devices.length} device{devices.length !== 1 ? 's' : ''} registered</p>
            </div>
          </div>

          <div className="space-y-3">
            {devices.map((d) => {
              const deviceCreds = getDeviceCredentials(d.id);
              const isShowingCredentials = showCredentials === d.id;
              
              return (
                <div key={d.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                                    <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      {editingId === d.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            className="flex-1 px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            disabled={editLoading}
                          />
                          <button
                            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                            onClick={() => handleEditSave(d.id)}
                            disabled={editLoading}
                          >
                            {editLoading ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      ) : (
                        <div>
                          <span className="font-medium text-gray-900 break-words">{d.name || '(unnamed device)'}</span>
                          <div className="text-xs text-gray-500 font-mono break-all">{d.topicPrefix}</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100"
                        onClick={() => handleEdit(d.id, d.name)}
                        title="Edit device name"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      {deviceCreds && (
                        <button
                          className="p-2 text-gray-400 hover:text-green-600 transition-colors rounded-md hover:bg-gray-100"
                          onClick={() => setShowCredentials(isShowingCredentials ? null : d.id)}
                          title="Show credentials"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      )}
                      <button
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-md hover:bg-gray-100"
                        onClick={() => handleDelete(d.id)}
                        disabled={deletingId === d.id}
                        title="Delete device"
                      >
                        {deletingId === d.id ? (
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {isShowingCredentials && deviceCreds && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-200">
                      <div className="space-y-2 text-xs">
                                                 <div className="flex justify-between items-start">
                           <span className="font-medium text-gray-700 flex-shrink-0 mr-2">Broker:</span>
                           <div className="flex items-center space-x-1 min-w-0 flex-1">
                             <span className="font-mono text-gray-800 break-all">{credentials.broker}</span>
                             <button
                               onClick={() => copyToClipboard(credentials.broker)}
                               className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                               title="Copy to clipboard"
                             >
                               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                               </svg>
                             </button>
                           </div>
                         </div>
                         <div className="flex justify-between items-start">
                           <span className="font-medium text-gray-700 flex-shrink-0 mr-2">Port:</span>
                           <div className="flex items-center space-x-1 min-w-0 flex-1">
                             <span className="font-mono text-gray-800 break-all">1883</span>
                             <button
                               onClick={() => copyToClipboard('1883')}
                               className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                               title="Copy to clipboard"
                             >
                               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                               </svg>
                             </button>
                           </div>
                         </div>
                         <div className="flex justify-between items-start">
                           <span className="font-medium text-gray-700 flex-shrink-0 mr-2">Username:</span>
                           <div className="flex items-center space-x-1 min-w-0 flex-1">
                             <span className="font-mono text-gray-800 break-all">{deviceCreds.rabbitmqUsername}</span>
                             <button
                               onClick={() => copyToClipboard(deviceCreds.rabbitmqUsername)}
                               className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                               title="Copy to clipboard"
                             >
                               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                               </svg>
                             </button>
                           </div>
                         </div>
                         <div className="flex justify-between items-start">
                           <span className="font-medium text-gray-700 flex-shrink-0 mr-2">Password:</span>
                           <div className="flex items-center space-x-1 min-w-0 flex-1">
                             <span className="font-mono text-gray-800 break-all">{deviceCreds.rabbitmqPassword}</span>
                             <button
                               onClick={() => copyToClipboard(deviceCreds.rabbitmqPassword)}
                               className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                               title="Copy to clipboard"
                             >
                               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                               </svg>
                             </button>
                           </div>
                         </div>
                         <div className="flex justify-between items-start">
                           <span className="font-medium text-gray-700 flex-shrink-0 mr-2">Topic Prefix:</span>
                           <div className="flex items-center space-x-1 min-w-0 flex-1">
                             <span className="font-mono text-gray-800 break-all">{deviceCreds.topicPrefix}</span>
                             <button
                               onClick={() => copyToClipboard(deviceCreds.topicPrefix)}
                               className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                               title="Copy to clipboard"
                             >
                               <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                               </svg>
                             </button>
                           </div>
                         </div>
                      </div>
                    </div>
                  )}

                  {credentialsLoading && (
                    <div className="mt-2 text-xs text-gray-500 flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading credentials...
                    </div>
                  )}
                </div>
              );
            })}
            
            {devices.length === 0 && (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No devices</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by registering your first device.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 