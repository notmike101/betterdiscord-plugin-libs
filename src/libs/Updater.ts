import { Logger } from '@/libs/Logger';
import semverGt from 'semver/functions/gt';

export interface UpdaterInterface {
  isUpdateAvailable(): Promise<boolean>;
  installUpdate(): Promise<boolean>;
}

interface PluginInfo {
  name?: string;
  version?: string;
  fileName?: string;
  content?: string;
}

export interface UpdaterOptions {
  updatePath: string;
  storagePath: string;
  currentVersion: string;
}

export class Updater implements UpdaterInterface {
  protected updatePath: string;
  protected storagePath: string;
  protected currentVersion: string;
  protected remotePluginInfo: PluginInfo;
  protected logger: Logger;

  constructor(options: UpdaterOptions) {
    this.updatePath = options.updatePath;
    this.storagePath = options.storagePath;
    this.currentVersion = options.currentVersion;
    this.remotePluginInfo = {};
    this.logger = new Logger('PluginUpdater', 'lightblue', 'white');
  }

  protected async downloadPluginFile(): Promise<void> {
    try {
      const res: Response = await fetch(this.updatePath);
      const pluginText: string = await res.text();

      this.remotePluginInfo.fileName = this.updatePath.split('/').slice(-1)[0];
      this.remotePluginInfo.name = pluginText.match(/@name (.*)/)![1];
      this.remotePluginInfo.version = pluginText.match(/@version (.*)/)![1];
      this.remotePluginInfo.content = pluginText;
    } catch (err) {
      this.logger.log('Failed to download plugin file', (err as Error).message);
    }
  }

  public async isUpdateAvailable(): Promise<boolean> {
    try {
      if (!this.updatePath) throw new Error('No update path defined for this plugin');
      if (!this.currentVersion) throw new Error('Current version of plugin unknown');

      await this.downloadPluginFile();

      return semverGt(this.remotePluginInfo.version, this.currentVersion);
    } catch (err) {
      this.logger.log('Failed to check for updates', (err as Error).message);

      return false;
    }
  }

  public async installUpdate(): Promise<boolean> {
    try {
      // @ts-ignore
      const fs: any = require('fs');

      if (!fs) throw new Error('Unable to load `fs` module');

      await new Promise((resolve, reject): void => {
        fs.writeFile(`${this.storagePath}/${this.remotePluginInfo.fileName}`, this.remotePluginInfo.content, (err: Error): void => {
          if (err) reject(err);

          resolve(true);
        });
      });

      return true;
    } catch (err) {
      this.logger.log('Failed to install update', (err as Error).message);

      return false;
    }
  }
}
