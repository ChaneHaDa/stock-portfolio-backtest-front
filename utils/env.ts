export const getRequiredEnvVar = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    console.error(`Required environment variable ${name} is not set`);
    throw new Error(`Environment variable ${name} is required`);
  }
  return value;
};

export const getOptionalEnvVar = (name: string, defaultValue: string = ''): string => {
  return process.env[name] || defaultValue;
};

export const validateApiConfig = (): void => {
  try {
    getRequiredEnvVar('NEXT_PUBLIC_API_BASE_URL');
  } catch (error) {
    console.warn('API_BASE_URL not configured, using default');
  }
};
