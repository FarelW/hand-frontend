export const getApiUrl = () => {
    // In browser, use relative path (will be proxied by Next.js)
    if (typeof window !== 'undefined') {
      return '/api';
    }
    // On server side, use full URL
    return 'http://202.10.48.195:8080/api';
  };