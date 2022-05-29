type RGB = `rgb(${number}, ${number}, ${number})`;
type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;
type HEX = `#${string}`;
type Color = RGB | RGBA | HEX;

export interface BannerOptions {
  acceptCallback?: any;
  dismissCallback?: any;
  acceptButtonString?: string;
  dismissButtonString?: string;
  backgroundColor?: Color;
  acceptButtonBorderColor?: Color;
  dismissButtonBorderColor?: Color;
  acceptButtonBackgroundColor?: Color;
  dismissButtonBackgroundColor?: Color;
  acceptButtonFontColor?: Color;
  dismissButtonFontColor?: Color;
  fontColor?: Color;
}

export interface BannerInterface {
  bannerContainer: HTMLDivElement;
  banners: HTMLDivElement[];
  createBanner(content: string, options: BannerOptions): number;
  dismissBanner(bannerId: number): void;
}

export class Banners implements BannerInterface {
  public bannerContainer: HTMLDivElement;
  public banners: HTMLDivElement[];

  constructor(bannerContainerId: string = 'plugin-banner-container') {
    this.banners = [];

    const existingBannerContainer: HTMLDivElement = document.querySelector('#' + bannerContainerId);

    if (!existingBannerContainer) {
      const bannerContainer: HTMLDivElement = document.createElement('div');
      
      this.bannerContainer = bannerContainer;
      this.bannerContainer.style.cssText = `
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 1;
          align-items: center;
          justify-content: center;
        `;
      this.bannerContainer.id = bannerContainerId;

      document.querySelector('#app-mount > div[class^="app"] > div[class^="app"]').prepend(this.bannerContainer);
    } else {
      this.bannerContainer = existingBannerContainer;
    }
  }

  public createBanner(content: string, options: BannerOptions): number {
    const banner: HTMLDivElement = document.createElement('div');
    const bannerText: HTMLSpanElement = document.createElement('span');
    const bannerApprove: HTMLButtonElement = document.createElement('button');
    const bannerDismiss: HTMLButtonElement = document.createElement('button');
    const bannerIndex: number = this.banners.length;

    banner.style.cssText = `
      display: flex;
      flex: 1;
      background-color: ${options.backgroundColor ?? 'var(--info-help-background)'};
      color: ${options.fontColor ?? 'var(--info-help-text)'};
      padding: 6px 0;
      font-size: 12px;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      width: 100%;
      margin: 0 15px;
    `;

    bannerApprove.style.cssText = `
      color: ${options.acceptButtonFontColor ?? '#ffffff'};
      background-color: ${options.acceptButtonBackgroundColor ?? 'var(--button-positive-background)'};
      border: 1px solid ${options.acceptButtonBorderColor ?? 'var(--button-positive-border)'};
      outline: none;
      margin: 0 15px;
    `;

    bannerDismiss.style.cssText = `
      color: ${options.dismissButtonFontColor ?? '#ffffff'};
      background-color: ${options.dismissButtonBackgroundColor ?? 'var(--button-danger-background)'};
      border: 1px solid ${options.dismissButtonBorderColor ?? 'var(--button-danger-border)'};
      outline: none;
    `;

    bannerApprove.textContent = options.acceptButtonString ?? 'Accept';
    bannerDismiss.textContent = options.dismissButtonString ?? 'Dismiss';
    bannerText.textContent = content;

    bannerApprove.addEventListener('pointerup', () => {
      this.dismissBanner(bannerIndex);

      if (options.acceptCallback) {
        options.acceptCallback();
      }
    });

    bannerDismiss.addEventListener('pointerup', () => {
      this.dismissBanner(bannerIndex);

      if (options.dismissCallback) {
        options.dismissCallback();
      }
    });

    banner.append(bannerText, bannerApprove, bannerDismiss);

    this.bannerContainer.append(banner);

    this.banners.push(banner);

    return bannerIndex;
  }

  public dismissBanner(bannerIndex): void {
    if (this.banners[bannerIndex]) {
      this.banners[bannerIndex].remove();
    }
  }
}
