# Private GitHub Contributions Support

## Overview

IndieClock uses a hybrid authentication approach to provide access to private GitHub contributions while maintaining the security and simplicity of GitHub App authentication.

## How It Works

### 1. GitHub App Authentication (Primary)
- **Purpose**: User authentication, profile data, and public contributions
- **Scopes**: `user`, `user:email`, `read:user`, `read:org`
- **Data Access**: Public profile, public contributions only
- **Security**: OAuth flow handled by NextAuth.js

### 2. Personal Access Token (Optional)
- **Purpose**: Access to private contributions (gray squares on GitHub calendar)
- **Scopes**: `read:user`, `user:email`
- **Data Access**: Private contributions in addition to public ones
- **Security**: User manually provides token, stored encrypted in database

## User Experience

### For Users with Public Contributions Only
1. Sign in with GitHub (GitHub App)
2. View public contributions immediately
3. See status: "📊 Public contributions only"

### For Users Wanting Private Contributions
1. Sign in with GitHub (GitHub App)
2. See the "🔒 Access Private Contributions" section
3. Follow instructions to create a Personal Access Token
4. Enter the token in the dashboard
5. View both public and private contributions
6. See status: "🔒 Private contributions included"

## Technical Implementation

### Database Schema
```sql
-- User table includes both authentication methods
personalAccessToken String?   -- Encrypted Personal Access Token
patUpdatedAt        DateTime? -- When PAT was last updated
```

### API Endpoints
- `POST /api/github/pat` - Update Personal Access Token
- `DELETE /api/github/pat` - Remove Personal Access Token
- `GET /api/github/contributions` - Fetch contributions (uses appropriate token)

### Token Priority
1. **Personal Access Token** (if available) → Private + Public contributions
2. **GitHub App Token** (fallback) → Public contributions only

## Security Considerations

- Personal Access Tokens are stored encrypted in the database
- Tokens are validated before storage
- Users can remove their PAT at any time
- GitHub App tokens are automatically managed by NextAuth.js
- No tokens are exposed in client-side code

## Benefits of This Approach

✅ **Maintains GitHub App benefits**: Automated token refresh, secure OAuth flow
✅ **Enables private contributions**: Users can opt-in to share private data
✅ **User control**: Users decide whether to provide additional access
✅ **Graceful degradation**: Works with public data if PAT not provided
✅ **Security**: Minimal token exposure, encrypted storage

## Migration Path

This approach allows for a smooth transition:
1. Start with GitHub App only (public contributions)
2. Add Personal Access Token support for private contributions
3. Users can gradually opt-in to private data access
4. No breaking changes to existing functionality 