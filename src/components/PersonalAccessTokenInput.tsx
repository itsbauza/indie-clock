'use client';

import { useState } from 'react';

interface PersonalAccessTokenInputProps {
  onTokenSubmit: (token: string) => void;
  isLoading?: boolean;
}

export default function PersonalAccessTokenInput({ onTokenSubmit, isLoading = false }: PersonalAccessTokenInputProps) {
  const [token, setToken] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) {
      onTokenSubmit(token.trim());
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">
            🔒 Access Private Contributions
          </h3>
          <p className="text-sm text-yellow-700 mb-3">
            To see your private contributions (gray squares), you need to provide a GitHub Personal Access Token.
          </p>
          
          {!isExpanded ? (
            <button
              onClick={() => setIsExpanded(true)}
              className="text-sm text-yellow-800 underline hover:text-yellow-900"
            >
              How to create a Personal Access Token?
            </button>
          ) : (
            <div className="text-sm text-yellow-700 space-y-2">
              <p><strong>To create a Personal Access Token:</strong></p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Go to <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="underline">GitHub Settings → Developer settings → Personal access tokens</a></li>
                <li>Click "Generate new token (classic)"</li>
                <li>Give it a name like "IndieClock Private Contributions"</li>
                <li>Select scopes: <code className="bg-yellow-100 px-1 rounded">repo</code> (for private contributions), <code className="bg-yellow-100 px-1 rounded">read:user</code>, and <code className="bg-yellow-100 px-1 rounded">user:email</code></li>
                <li>Click "Generate token" and copy the token</li>
              </ol>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-sm text-yellow-800 underline hover:text-yellow-900"
              >
                Hide instructions
              </button>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-4">
        <div className="flex gap-2">
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            className="flex-1 px-3 py-2 border border-yellow-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!token.trim() || isLoading}
            className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Updating...' : 'Update'}
          </button>
        </div>
        <p className="text-xs text-yellow-600 mt-2">
          Your token is stored securely and only used to fetch your private contribution data.
        </p>
      </form>
    </div>
  );
} 