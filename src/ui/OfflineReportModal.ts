import { EventSystem } from '../systems/EventSystem';

export interface OfflineReportData {
  title: string;
  subtitle: string;
  rewards: Array<{
    icon: string;
    label: string;
    value: string;
  }>;
}

export class OfflineReportModal {
  private eventSystem: EventSystem;
  private modalElement?: HTMLDivElement;

  constructor(eventSystem: EventSystem) {
    this.eventSystem = eventSystem;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.eventSystem.on('ui:show_offline_report', this.show.bind(this));
  }

  show(data: OfflineReportData): void {
    // Remove any existing modal
    this.hide();

    // Create modal backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'modal__backdrop offline-report-backdrop';
    backdrop.onclick = () => this.hide();

    // Create modal content
    const modal = document.createElement('div');
    modal.className = 'modal__content offline-report';
    modal.onclick = (e) => e.stopPropagation();

    // Title
    const title = document.createElement('h2');
    title.className = 'offline-report__title';
    title.textContent = data.title;
    modal.appendChild(title);

    // Subtitle
    const subtitle = document.createElement('p');
    subtitle.className = 'offline-report__subtitle';
    subtitle.textContent = data.subtitle;
    modal.appendChild(subtitle);

    // Rewards container
    const rewardsContainer = document.createElement('div');
    rewardsContainer.className = 'offline-report__rewards';

    // Create reward items
    data.rewards.forEach(reward => {
      const rewardItem = document.createElement('div');
      rewardItem.className = 'offline-report__reward-item';

      const icon = document.createElement('div');
      icon.className = `offline-report__icon offline-report__icon--${reward.icon}`;
      icon.textContent = this.getIconEmoji(reward.icon);

      const label = document.createElement('span');
      label.className = 'offline-report__label';
      label.textContent = reward.label;

      const value = document.createElement('span');
      value.className = 'offline-report__value';
      value.textContent = reward.value;

      rewardItem.appendChild(icon);
      rewardItem.appendChild(label);
      rewardItem.appendChild(value);
      rewardsContainer.appendChild(rewardItem);
    });

    modal.appendChild(rewardsContainer);

    // Collect button
    const collectButton = document.createElement('button');
    collectButton.className = 'button button--primary offline-report__collect';
    collectButton.textContent = 'Collect Rewards';
    collectButton.onclick = () => {
      this.hide();
      this.eventSystem.emit('offline:rewards_collected');
    };
    modal.appendChild(collectButton);

    // Assemble and show
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);
    this.modalElement = backdrop;

    // Animate in
    requestAnimationFrame(() => {
      backdrop.classList.add('show');
      modal.classList.add('show');
    });
  }

  hide(): void {
    if (this.modalElement) {
      this.modalElement.classList.remove('show');
      setTimeout(() => {
        this.modalElement?.remove();
        this.modalElement = undefined;
      }, 300);
    }
  }

  private getIconEmoji(iconType: string): string {
    const iconMap: Record<string, string> = {
      coin: '🪙',
      shift: '⏰',
      memory: '📸',
      gem: '💎',
      token: '🎟️',
      pet: '🐾'
    };
    return iconMap[iconType] || '✨';
  }
}
