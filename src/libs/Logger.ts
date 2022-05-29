export class Logger {
  protected logPrefix: string;
  protected logPrefixColor: string;
  protected logColor: string;

  constructor(logPrefix: string, logPrefixColor: string, logColor: string) {
    this.logPrefix = logPrefix;
    this.logPrefixColor = logPrefixColor;
    this.logColor = logColor;
  }

  public log(...messages) {
    console.log(`%c[${this.logPrefix}] %c${messages.join(' ')}`, `color: ${this.logPrefixColor};`, `color: ${this.logColor}`);
  }

  public warn(...messages) {
    console.warn(`%c[${this.logPrefix}] %c${messages.join(' ')}`, `color: ${this.logPrefixColor};`, `color: ${this.logColor}`);
  }
  
  public error(...messages) {
    console.error(`%c[${this.logPrefix}] %c${messages.join(' ')}`, `color: ${this.logPrefixColor};`, `color: ${this.logColor}`);
  }
  
  public info(...messages) {
    console.info(`%c[${this.logPrefix}] %c${messages.join(' ')}`, `color: ${this.logPrefixColor};`, `color: ${this.logColor}`);
  }
}