export const environment = {
  production: true,
  apiUrl: (window as any)['env']?.['apiUrl'] || 'http://109.221.224.84:5000/api',
};
