import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

// Configure WebBrowser for AuthSession
WebBrowser.maybeCompleteAuthSession();

// Google OAuth configuration
export const googleAuthConfig = {
  clientId:
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
    'your-web-client-id.apps.googleusercontent.com',
  scopes: ['openid', 'profile', 'email'],
  redirectUri: AuthSession.makeRedirectUri(),
};

// Create auth request
export const createGoogleAuthRequest = () => {
  return AuthSession.useAuthRequest(
    {
      clientId: googleAuthConfig.clientId,
      scopes: googleAuthConfig.scopes,
      redirectUri: googleAuthConfig.redirectUri,
      responseType: AuthSession.ResponseType.IdToken,
      extraParams: {
        // Ensure we get an ID token
        include_granted_scopes: 'true',
      },
    },
    {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    }
  );
};

export default createGoogleAuthRequest;
