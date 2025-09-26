import { EventSystem } from '../../systems/EventSystem';
import { getNPCById } from '../../utils/npcData';

export class VoiceCallOverlay {
  private eventSystem: EventSystem;
  private overlay: HTMLElement | null = null;

  constructor(eventSystem: EventSystem) {
    this.eventSystem = eventSystem;
    this.setupListeners();
  }

  private setupListeners(): void {
    this.eventSystem.on('voice-call:start', ({ npcId }) => this.show(npcId));
    this.eventSystem.on('voice-call:end', () => this.hide());
  }

  private show(npcId: string): void {
    const npc = getNPCById(npcId);
    if (!this.overlay) {
      this.overlay = document.createElement('div');
      this.overlay.className = 'voice-call-overlay';
      this.overlay.innerHTML = `
        <div class="voice-call-card">
          <div class="voice-call-header">
            <span class="material-icons">phone_in_talk</span>
            <h3 id="voice-call-npc"></h3>
          </div>
          <p class="voice-call-caption" id="voice-call-caption"></p>
          <div class="voice-call-controls">
            <button class="btn btn--primary" data-action="call-end">
              <span class="material-icons">call_end</span> End
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(this.overlay);

      this.overlay.querySelector('[data-action="call-end"]')?.addEventListener('click', () => {
        this.eventSystem.emit('voice-call:end');
      });
    }

    const nameEl = this.overlay.querySelector('#voice-call-npc');
    const captionEl = this.overlay.querySelector('#voice-call-caption');

    if (nameEl) nameEl.textContent = `${npc?.name || 'Helper'} is calling...`;
    if (captionEl) captionEl.textContent = this.getCallCaption(npcId);

    this.overlay.classList.add('visible');
    document.body.classList.add('voice-call-active');
  }

  private hide(): void {
    if (!this.overlay) return;
    this.overlay.classList.remove('visible');
    document.body.classList.remove('voice-call-active');
  }

  private getCallCaption(npcId: string): string {
    const captions: Record<string, string> = {
      aria: 'Aria wants to share a late-night baking story.',
      kai: 'Kai is buzzing with playground gossip!',
      elias: 'Elias has a quiet moment to share.'
    };
    return captions[npcId] || 'Let’s chat!';
  }
}
