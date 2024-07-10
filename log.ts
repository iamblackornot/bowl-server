import fs from 'fs';

const logFilePath = 'app.log';

export function log(message: string): void 
{
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${message}\n`;

  process.stdout.write(logMessage);
  
  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error('Error writing to log file:', err);
    }
  });
}

export function initLogger(): void {
  console.log = (...args: any[]) => {
    const message = args.map(arg => typeof arg === 'string' ? arg : JSON.stringify(arg)).join(' ');
    log(message);
  };

  console.error = console.log;
}
