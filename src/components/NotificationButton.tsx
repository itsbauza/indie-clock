"use client"

import { useState } from 'react';

interface NotificationButtonProps {
  className?: string;
}

export default function NotificationButton({ className = "" }: NotificationButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [notificationText, setNotificationText] = useState('');
  const [notificationIcon, setNotificationIcon] = useState('bell');
  const [notificationColor, setNotificationColor] = useState('#ffffff');
  const [notificationDuration, setNotificationDuration] = useState(5);

  const handleSendNotification = async () => {
    if (!notificationText.trim()) {
      alert('Please enter a notification message');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: notificationText,
          icon: notificationIcon,
          color: notificationColor,
          duration: notificationDuration,
          effect: 'scroll'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert('Notification sent successfully!');
        setNotificationText('');
        setShowForm(false);
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to send notification'}`);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Failed to send notification. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={className}>
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full text-left p-3 rounded-md border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
        >
          <div className="flex items-center">
            <svg className="w-5 h-5 text-indigo-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M9 11h.01M12 11h.01M15 11h.01M12 8h.01M9 8h.01M15 8h.01M12 5h.01M9 5h.01M15 5h.01M12 2h.01M9 2h.01M15 2h.01" />
            </svg>
            <span className="text-gray-700">Send Notification</span>
          </div>
        </button>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Send Notification</h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Message *
              </label>
              <input
                type="text"
                value={notificationText}
                onChange={(e) => setNotificationText(e.target.value)}
                placeholder="Enter your notification message..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Icon
              </label>
              <select
                value={notificationIcon}
                onChange={(e) => setNotificationIcon(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="bell">Bell</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="success">Success</option>
                <option value="error">Error</option>
                <option value="github">GitHub</option>
                <option value="heart">Heart</option>
                <option value="star">Star</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={notificationColor}
                  onChange={(e) => setNotificationColor(e.target.value)}
                  className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={notificationColor}
                  onChange={(e) => setNotificationColor(e.target.value)}
                  placeholder="#ffffff"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Duration (seconds)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={notificationDuration}
                onChange={(e) => setNotificationDuration(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSendNotification}
                disabled={isLoading || !notificationText.trim()}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
              >
                {isLoading ? 'Sending...' : 'Send'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 