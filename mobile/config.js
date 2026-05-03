import Constants from 'expo-constants';

/**
 * Dynamically resolves the backend API URL based on the Expo host.
 *
 * HOW IT WORKS:
 *  - When a developer runs `npx expo start`, Expo injects the host machine's
 *    LAN IP into `Constants.expoConfig.hostUri` (e.g. "192.168.1.42:8081").
 *  - We strip the port and replace it with the backend port (5000).
 *  - This means NO ONE ever needs to hardcode an IP address — it just works
 *    on any machine, for any teammate, automatically.
 *
 * REQUIREMENTS:
 *  - The backend must be running on the SAME machine that ran `npx expo start`.
 *  - The backend port must be 5000 (or change PORT below to match your .env).
 *  - Your firewall must allow inbound connections on port 5000
 *    (run open_firewall.ps1 as Administrator if needed).
 */

const BACKEND_PORT = 5000;

const getBaseUrl = () => {
  // Expo SDK 49+ stores the host in expoConfig.hostUri
  const hostUri =
    Constants.expoConfig?.hostUri ||
    // Older SDK / EAS update manifest fallback
    Constants.manifest2?.extra?.expoClient?.hostUri ||
    Constants.manifest?.debuggerHost;

  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:${BACKEND_PORT}/api`;
  }

  // Production standalone build — update this to your deployed server URL
  console.warn(
    '⚠️  FitTrack: Could not auto-detect the backend IP.\n' +
    '   Make sure you are running via `npx expo start` on the same machine as the backend.\n' +
    '   For production builds, set a real server URL here.'
  );
  return `http://localhost:${BACKEND_PORT}/api`;
};

export const API_URL = getBaseUrl();

if (__DEV__) {
  console.log(`🔗 FitTrack API_URL: ${API_URL}`);
}
