import { Plugins, showToast } from 'betterdiscord/bdapi';
import { Banners } from '@/libs/Banners';
import { Logger } from '@/libs/Logger';
import semver from 'semver';

export interface UpdaterInterface {
  isUpdateAvailable(): Promise<boolean>;
  installUpdate(): Promise<boolean>;
  showUpdateBanner(): void;
}

interface PluginInfo {
  name?: string;
  version?: string;
  fileName?: string;
  content?: string;
}

interface UpdaterOptions {
  updatePath: string;
  currentVersion: string;
  showToasts?: boolean;
}

export class Updater implements UpdaterInterface {
  protected updatePath: string;
  protected currentVersion: string;
  protected remotePluginInfo: PluginInfo;
  protected banners: Banners;
  protected logger: Logger;
  protected showToasts: boolean;
  
  constructor(options: UpdaterOptions) {
    this.updatePath = options.updatePath;
    this.currentVersion = options.currentVersion;
    this.remotePluginInfo = {};
    this.showToasts = options.showToasts ?? false;
    this.banners = new Banners();
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

      return semver.gt(this.remotePluginInfo.version, this.currentVersion);
    } catch (err) {
      this.logger.log('Failed to check for updates', (err as Error).message);

      return false;
    }
  }

  public showUpdateBanner(): void {
    this.banners.createBanner(`Update available for ${this.remotePluginInfo.name}`, {
      acceptCallback: this.installUpdate.bind(this),
    });
  }

  public async installUpdate(): Promise<boolean> {
    try {
      const fs: any = require('fs');

      if (!fs) throw new Error('Unable to load `fs` module');

      await new Promise((resolve, reject): void => {
        fs.writeFile(`${Plugins.folder}/${this.remotePluginInfo.fileName}`, this.remotePluginInfo.content, (err: Error): void => {
          if (err) reject(err);

          resolve(true);
        });
      });

      if (this.showToasts) {
        showToast(`${this.remotePluginInfo.name} updated`, { type: 'success'});
      }

      return true;
    } catch (err) {
      if (this.showToasts) {
        showToast(`Failed to download and install update for ${this.remotePluginInfo.name}`, { type: 'error'});
      }

      return false;
    }
  }
}
