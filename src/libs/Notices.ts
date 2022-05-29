import {
  Tween,
  Easing as TweenEasings,
  update as TweenUpdate
} from "@tweenjs/tween.js";

export type NoticePosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
export type NoticeButtonType = 'default' | 'success' | 'warning' | 'info' | 'danger';
export type NoticeButtonPosition = 'left' | 'center' | 'right';
export type NoticeTypes = 'default' | 'success' | 'warning' | 'danger';

export interface NoticeButtonOptions {
  text: string;
  type?: NoticeButtonType;
  position?: NoticeButtonPosition;
  callback?: () => void;
}

export interface NoticeOptions {
  position?: NoticePosition;
  timeout?: number;
  icon?: string;
  buttons?: NoticeButtonOptions[];
  text: string;
  type?: NoticeTypes;
}

export interface NoticeInterface {
  noticeContainer: HTMLDivElement;
  notices: HTMLDivElement[];
  createNotice(options: NoticeOptions): void;
  dismissNotice(noticeId: number): void;
}

export class Notices implements NoticeInterface {
  public noticeContainer: HTMLDivElement;
  protected noticeContainerTopLeft: HTMLDivElement;
  protected noticeContainerTopCenter: HTMLDivElement;
  protected noticeContainerTopRight: HTMLDivElement;
  protected noticeContainerBottomLeft: HTMLDivElement;
  protected noticeContainerBottomCenter: HTMLDivElement;
  protected noticeContainerBottomRight: HTMLDivElement;
  protected noticeTimers: Tween<any>[];
  public notices: HTMLDivElement[];

  constructor(noticeContainerId: string) {
    this.animationLoop = this.animationLoop.bind(this);

    this.notices = [];
    this.noticeTimers = [];
    this.noticeContainer = this.createNoticeContainer(noticeContainerId ?? 'plugin-notice-container');
    this.noticeContainerTopLeft = this.createAreaContainer(this.noticeContainer, 'top-left');
    this.noticeContainerTopCenter = this.createAreaContainer(this.noticeContainer, 'top-center');
    this.noticeContainerTopRight = this.createAreaContainer(this.noticeContainer, 'top-right');
    this.noticeContainerBottomLeft = this.createAreaContainer(this.noticeContainer, 'bottom-left');
    this.noticeContainerBottomCenter = this.createAreaContainer(this.noticeContainer, 'bottom-center');
    this.noticeContainerBottomRight = this.createAreaContainer(this.noticeContainer, 'bottom-right');
    
    this.animationLoop();
  }

  protected animationLoop(): void {
    if (this.noticeTimers.length > 0) {
      TweenUpdate(performance.now());
    }
    
    requestAnimationFrame(this.animationLoop);
  }

  protected createNoticeContainer(noticeContainerId: string): HTMLDivElement {
    const existingNoticeContainer: HTMLDivElement = document.querySelector('#' + noticeContainerId);
    let noticeContainer: HTMLDivElement | null = null;

    if (existingNoticeContainer) {    
      noticeContainer = existingNoticeContainer;
    } else {  
      noticeContainer = document.createElement('div');

      noticeContainer.style.cssText = `
          display: block;
          position: absolute;
          z-index: 5000;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          width: 100%;
          height: 100%;
          background-color: transparent;
        `;
      
      noticeContainer.id = noticeContainerId;

      document.querySelector('#app-mount > div[class^="app"] > div[class^="app"]').prepend(noticeContainer);
    }

    return noticeContainer;
  }

  protected createAreaContainer(noticeContainer: HTMLDivElement, position: NoticePosition): HTMLDivElement {
    const existingContainer: HTMLDivElement = this.noticeContainer.querySelector(`#notice-container-${position}`);
    let positionContainer: HTMLDivElement | null = null;

    if (existingContainer) {
      positionContainer = existingContainer;
    } else {
      positionContainer = document.createElement('div');

      positionContainer.style.position = 'absolute';
      positionContainer.style.pointerEvents = 'all';
      positionContainer.style.width = '300px';
      positionContainer.style.maxWidth = '300px';
      positionContainer.style.cursor = 'default';
      positionContainer.style.overflowY = 'auto';
      positionContainer.style.maxHeight = '100%';

      switch (position) {
        case 'top-left':
          positionContainer.style.top = '5px';
          positionContainer.style.left = '15px';
          break;
        case 'top-center':
          positionContainer.style.top = '5px';
          positionContainer.style.left = '50%';
          positionContainer.style.transform = 'translateX(-50%)';
          break;
        case 'top-right':
          positionContainer.style.top = '5px';
          positionContainer.style.right = '15px';
          break;
        case 'bottom-left':
          positionContainer.style.bottom = '15px';
          positionContainer.style.left = '15px';
          break;
        case 'bottom-center':
          positionContainer.style.bottom = '15px';
          positionContainer.style.left = '50%';
          positionContainer.style.transform = 'translateX(-50%)';
          break;
        case 'bottom-right':
          positionContainer.style.bottom = '15px';
          positionContainer.style.right = '15px';
          break;
      }

      positionContainer.id = 'notice-container-' + position;
      
      noticeContainer.append(positionContainer);
    }

    return positionContainer;
  }

  protected createNoticeButton(noticeId: number, options: NoticeButtonOptions) {
    const noticeButton: HTMLButtonElement = document.createElement('button');

    noticeButton.style.cssText = `
      display: inline-block;
      border: 0;
      outline: none;
      margin-left: 5px;
      padding: 3px ​15px;
    `;

    switch (options.type) {
      case 'default':
        noticeButton.style.backgroundColor = '#007bff';
        noticeButton.style.color = '#ffffff';
        break;
      case 'success':
        noticeButton.style.backgroundColor = '#28a745';
        noticeButton.style.color = '#ffffff';
        noticeButton.style.border = '1px solid #0cc637';
        break;
      case 'warning': 
        noticeButton.style.backgroundColor = '#ffc107';
        noticeButton.style.color = '#212529';
        noticeButton.style.border = '1px solid #b59a4a';
        break;
      case 'danger': 
        noticeButton.style.backgroundColor = '#dc3545';
        noticeButton.style.border = '1px solid #b21f2e';
        noticeButton.style.color = '#ffffff';
        break;
      default:
        noticeButton.style.backgroundColor = '#007bff';
        noticeButton.style.color = '#ffffff';
    }

    noticeButton.innerText = options.text;

    noticeButton.addEventListener('click', () => {
      this.dismissNotice(noticeId);
    });

    if (options.callback) {
      noticeButton.addEventListener('click', options.callback);
    }

    return noticeButton;
  }

  protected createNoticeTimeout(noticeId: number, duration: number) {
    const noticeTimeout: HTMLDivElement = document.createElement('div');
    const noticeTimeoutInner: HTMLSpanElement = document.createElement('span');
    const noticeTimerId = this.noticeTimers.length;
    const timeoutBarHeight = '3px';

    noticeTimeout.style.cssText = `
      display: block;
      width: 100%;
      height: ${timeoutBarHeight};
      margin-top: 5px;
    `;

    noticeTimeoutInner.style.cssText = `
      display: block;
      background-color: lightblue;
      height: ${timeoutBarHeight};
      width: 0%;
    `;

    noticeTimeout.append(noticeTimeoutInner);

    const noticeTimer = new Tween({ progress: 0 })
      .to({ progress: 100 }, duration)
      .easing(TweenEasings.Linear.None)
      .onUpdate(({ progress }) => {
        noticeTimeoutInner.style.width = `${progress}%`;
      })
      .onComplete(() => {
        this.dismissNotice(noticeId);
      });

    this.noticeTimers.push(noticeTimer);

    return {
      noticeTimeout,
      noticeTimerId,
    };
  }

  protected addNoticeToContainer(position: NoticePosition, notice: HTMLDivElement) {
    switch (position) {
      case 'top-left':
        this.noticeContainerTopLeft.append(notice);
        break;
      case 'top-center':
        this.noticeContainerTopCenter.append(notice);
        break;
      case 'top-right':
        this.noticeContainerTopRight.append(notice);
        break;
      case 'bottom-left':
        this.noticeContainerBottomLeft.append(notice);
        break;
      case 'bottom-center':
        this.noticeContainerBottomCenter.append(notice);
        break;
      case 'bottom-right':
        this.noticeContainerBottomRight.append(notice);
        break;
      default:
        this.noticeContainerBottomRight.append(notice);
    }
  }

  public createNotice(options: NoticeOptions): void {
    const notice: HTMLDivElement = document.createElement('div');
    const noticeContainer: HTMLDivElement = document.createElement('div');
    const noticeText: HTMLSpanElement = document.createElement('span');
    const noticeButtons: HTMLDivElement = document.createElement('div');
    const noticeId: number = this.notices.length;

    notice.style.cssText = `
      display: flex;
      flex-direction: column;
      flex: 1;
      margin-bottom: 5px;
    `;

    noticeContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      flex: 1;
      padding: 12px;
      font-size: 13px;
      align-items: flex-start;
      justify-content: center;
    `;

    switch (options.type) {
      case 'default':
        notice.style.backgroundColor = '#ffffff';
        notice.style.color = '#000000';
        break;
      case 'danger':
        notice.style.backgroundColor = '#dc3545';
        notice.style.color = '#ffffff';
        break;
      case 'warning':
        notice.style.backgroundColor = '#ffc107';
        notice.style.color = '#212529';
        break;
      case 'success':
        notice.style.backgroundColor = '#28a745';
        notice.style.color = '#ffffff';
        break;
      default: 
        notice.style.backgroundColor = '#ffffff';
        notice.style.color = '#000000';
    }

    noticeButtons.style.cssText = `
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      align-self: flex-end;
    `;

    // Add notice text
    noticeText.innerText = options.text;

    if (options.buttons) {
      // Create notice buttons
      options.buttons.forEach((button: NoticeButtonOptions) => {
        const noticeButton = this.createNoticeButton(noticeId, button);

        noticeButtons.append(noticeButton);
      });

      noticeContainer.append(noticeButtons);
    }

    const dismissButton = this.createNoticeButton(noticeId, {
      type: 'danger',
      text: 'Dismiss',
    });

    noticeButtons.append(dismissButton);
    noticeContainer.append(noticeText, noticeButtons);
    notice.append(noticeContainer);
    
    this.notices.push(notice);

    if (options.timeout) {
      const { noticeTimeout, noticeTimerId } = this.createNoticeTimeout(noticeId, options.timeout);
      
      notice.prepend(noticeTimeout);
      
      this.noticeTimers[noticeTimerId].start();
    }

    this.addNoticeToContainer(options.position, notice);
  }

  public dismissNotice(noticeId: number): void {
    const notice: HTMLDivElement = this.notices[noticeId];

    if (notice) {
      notice.remove();
    }
  }
}
