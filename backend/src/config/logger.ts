import winston from 'winston';

const { combine, timestamp, errors, json, printf, colorize } = winston.format;

// Custom format for console output
const consoleFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

// Create logger instance
const isProduction = process.env.NODE_ENV === 'production';
const isVercel = process.env.VERCEL === '1';

// Configure transports based on environment
const transports: winston.transport[] = [];

// Only add file transports in development or when not on Vercel
if (!isVercel) {
  const logDir = isProduction ? '/tmp/logs' : 'logs';
  
  transports.push(
    // Write all logs with importance level of 'error' or less to error.log
    new winston.transports.File({ 
      filename: `${logDir}/error.log`, 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 10
    }),
    // Write all logs to combined.log
    new winston.transports.File({ 
      filename: `${logDir}/combined.log`,
      maxsize: 5242880, // 5MB
      maxFiles: 10
    })
  );
}

export const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    json()
  ),
  defaultMeta: {
    service: 'spacify-backend'
  },
  transports
});

// Add console transport for non-production environments
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: combine(
      colorize(),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      consoleFormat
    )
  }));
}

// Create logs directory if it doesn't exist (only in development)
if (!isVercel) {
  import('fs').then(({ mkdirSync }) => {
    try {
      const logDir = isProduction ? '/tmp/logs' : 'logs';
      mkdirSync(logDir, { recursive: true });
    } catch (error) {
      // Directory already exists or permission error
      console.warn('Could not create logs directory:', error);
    }
  }).catch(() => {
    // Ignore import errors
  });
}

export default logger; 