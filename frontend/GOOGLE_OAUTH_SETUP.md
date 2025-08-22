# Google OAuth Setup Guide

This guide explains how to properly implement Google OAuth authentication in the Flux Trader application.

## Current Implementation

The application currently has a placeholder Google OAuth implementation that shows "Google authentication coming soon!" messages. The UI is fully prepared with:

- Google sign-in buttons in both login and registration forms
- Proper styling and icons
- Error handling structure
- Component separation for reusability

## Steps to Implement Full Google OAuth

### 1. Set up Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure the OAuth consent screen
6. Add your domain to authorized origins
7. Note down your Client ID and Client Secret

### 2. Install Required Dependencies

```bash
npm install @react-oauth/google
```

### 3. Update the GoogleOAuth Component

Replace the placeholder implementation in `src/components/HomePage/GoogleOAuth.tsx`:

```tsx
import { useGoogleLogin } from "@react-oauth/google";

const GoogleOAuth: React.FC<GoogleOAuthProps> = ({
  onSuccess,
  onError,
  mode,
}) => {
  const login = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        // Send the access token to your backend
        const result = await api.post("/api/auth/google/", {
          access_token: response.access_token,
          mode: mode,
        });

        if (mode === "login") {
          // Handle login success
          localStorage.setItem("accessToken", result.data.access);
          localStorage.setItem("refreshToken", result.data.refresh);
          window.location.reload();
        } else {
          // Handle registration success
          onSuccess(result.data);
        }
      } catch (error) {
        onError(error);
      }
    },
    onError: (error) => {
      onError(error);
    },
  });

  return (
    <button
      className="google-signin-button"
      onClick={() => login()}
      type="button"
    >
      <svg className="google-icon" viewBox="0 0 24 24">
        {/* Google icon SVG paths */}
      </svg>
      Continue with Google
    </button>
  );
};
```

### 4. Wrap Your App with GoogleOAuthProvider

In your main App component or index file:

```tsx
import { GoogleOAuthProvider } from "@react-oauth/google";

function App() {
  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      {/* Your app components */}
    </GoogleOAuthProvider>
  );
}
```

### 5. Backend Implementation

You'll need to implement the `/api/auth/google/` endpoint in your Django backend:

```python
# In your Django views
from google.oauth2 import id_token
from google.auth.transport import requests

@api_view(['POST'])
def google_auth(request):
    token = request.data.get('access_token')
    mode = request.data.get('mode')

    try:
        # Verify the Google token
        idinfo = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            'YOUR_GOOGLE_CLIENT_ID'
        )

        # Extract user information
        google_id = idinfo['sub']
        email = idinfo['email']
        name = idinfo['name']

        if mode == 'register':
            # Create new user
            user = User.objects.create_user(
                username=email,
                email=email,
                first_name=name
            )
        else:
            # Find existing user
            user = User.objects.get(email=email)

        # Generate JWT tokens
        access_token = generate_access_token(user)
        refresh_token = generate_refresh_token(user)

        return Response({
            'access': access_token,
            'refresh': refresh_token,
            'user': UserSerializer(user).data
        })

    except Exception as e:
        return Response({'error': str(e)}, status=400)
```

### 6. Environment Variables

Add to your `.env` file:

```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

## Security Considerations

1. **Token Verification**: Always verify Google tokens on the backend
2. **HTTPS Only**: Use HTTPS in production
3. **Token Storage**: Store tokens securely (httpOnly cookies recommended)
4. **CSRF Protection**: Implement CSRF protection for your forms
5. **Rate Limiting**: Add rate limiting to prevent abuse

## Testing

1. Test with both valid and invalid Google accounts
2. Test error scenarios (network failures, invalid tokens)
3. Test the complete flow from login to dashboard
4. Test token refresh mechanisms

## Troubleshooting

- **CORS Issues**: Ensure your backend allows requests from your frontend domain
- **Token Expiry**: Implement proper token refresh logic
- **User Creation**: Handle cases where users might already exist
- **Error Handling**: Provide meaningful error messages to users

## Next Steps

Once Google OAuth is implemented:

1. Add other OAuth providers (GitHub, Facebook, etc.)
2. Implement social login profile completion
3. Add account linking features
4. Implement OAuth account disconnection
5. Add audit logging for OAuth events
