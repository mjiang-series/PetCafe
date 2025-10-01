// Unified Cafe Overview Screen - Works for both mobile and desktop
import { UnifiedBaseScreen } from './UnifiedBaseScreen';
import { EventSystem } from '../systems/EventSystem';
import { GameStateManager } from '../systems/GameState';
import { AssetPaths, getAssetPath } from '../utils/assetPaths';
import { ScreenHeaderConfig } from './components/ScreenHeader';

export class UnifiedCafeScreen extends UnifiedBaseScreen {
  protected getScreenHeaderConfig(): ScreenHeaderConfig | null {
    // No screen header for cafe overview - it's the main screen
    return null;
  }

  protected createContent(): string {
    return `
      <!-- Cafe Sections -->
      <section class="sections-grid">
        <h3 class="section-title">Café Areas</h3>
        
        <div class="section-card" data-section="bakery">
          <div class="section-card__image">
            <img src="${AssetPaths.scenePlaceholder('bakery')}" alt="Bakery" />
          </div>
          <div class="section-card__content">
            <h4>Bakery</h4>
            <p>Warm treats with Aria</p>
            <span class="status-badge status--ready">Ready</span>
          </div>
        </div>

        <div class="section-card" data-section="playground">
          <div class="section-card__image">
            <img src="${AssetPaths.scenePlaceholder('playground')}" alt="Playground" />
          </div>
          <div class="section-card__content">
            <h4>Playground</h4>
            <p>Fun times with Kai</p>
            <span class="status-badge status--ready">Ready</span>
          </div>
        </div>

        <div class="section-card" data-section="salon">
          <div class="section-card__image">
            <img src="${AssetPaths.scenePlaceholder('salon')}" alt="Styling Salon" />
          </div>
          <div class="section-card__content">
            <h4>Styling Salon</h4>
            <p>Beauty sessions with Elias</p>
            <span class="status-badge status--ready">Ready</span>
          </div>
        </div>
      </section>

    `;
  }

  onShow(): void {
    this.updateDisplay();
    this.updateSectionStatuses();
  }

  onHide(): void {
    // Cleanup if needed
  }

  protected override setupEventListeners(): void {
    super.setupEventListeners();
    
    // Listen for shift updates
    this.eventSystem.on('shift:timer_update', () => {
      this.updateSectionStatuses();
    });
    
    this.eventSystem.on('shift:completed', () => {
      this.updateSectionStatuses();
    });
    
    this.eventSystem.on('shift:started', () => {
      this.updateSectionStatuses();
    });
    
    this.eventSystem.on('shift:ready_to_collect', () => {
      this.updateSectionStatuses();
    });
    
    // Section cards
    this.element.querySelectorAll('.section-card:not(.section-card--locked)').forEach(card => {
      card.addEventListener('click', () => {
        const section = card.getAttribute('data-section');
        if (section) {
          this.navigateToSection(section);
        }
      });
    });
 
    // Listen for state updates
    this.eventSystem.on('game:state_updated', () => this.updateDisplay());
    this.eventSystem.on('shift:completed', () => {
      setTimeout(() => this.updateDisplay(), 100);
    });
    this.eventSystem.on('memory:created', () => this.updateDisplay());
    this.eventSystem.on('rewards:applied', () => this.updateDisplay());
  }

  private navigateToSection(sectionType: string): void {
    this.eventSystem.emit('ui:show_screen', { 
      screenId: 'section',
      data: { sectionType }
    });
  }

  private updateDisplay(): void {
    const state = this.gameState.getState();

    // Update section statuses
    state.cafeLayout?.forEach(section => {
      const sectionCard = this.element.querySelector(`[data-section="${section.sectionType}"]`);
      if (!sectionCard) return;

      const statusBadge = sectionCard.querySelector('.status-badge');
      if (statusBadge) {
        if (section.currentShift) {
          if (section.currentShift.status === 'running') {
            statusBadge.textContent = 'In Progress';
            statusBadge.className = 'status-badge status--active';
          } else if (section.currentShift.status === 'complete') {
            statusBadge.textContent = 'Complete!';
            statusBadge.className = 'status-badge status--complete';
          }
        } else {
          statusBadge.textContent = 'Ready';
          statusBadge.className = 'status-badge status--ready';
        }
      }
    });
  }


  private updateSectionStatuses(): void {
    const sections = this.gameState.getCafeSections();
    const activeShifts = this.gameState.getActiveShifts();
    const player = this.gameState.getPlayer();
    
    sections.forEach(section => {
      const sectionCard = this.element.querySelector(`.section-card[data-section="${section.sectionType}"]`);
      if (!sectionCard) return;
      
      const statusBadge = sectionCard.querySelector('.status-badge');
      if (!statusBadge) return;
      
      // For Bakery (with quest system), show quest-based status
      if (section.sectionType === 'bakery') {
        const questIds = ['bakery_taste_test', 'bakery_temperature_check', 'bakery_cookie_art'];
        
        if (!player.activeQuests) {
          // No quests started yet
          statusBadge.className = 'status-badge status--ready';
          statusBadge.textContent = `${questIds.length} Cafe Tasks Available`;
          return;
        }
        
        const activeQuests = questIds.filter(id => player.activeQuests![id]);
        const activeCount = activeQuests.filter(id => player.activeQuests![id]?.status === 'active').length;
        const completeCount = activeQuests.filter(id => player.activeQuests![id]?.status === 'complete').length;
        
        if (completeCount > 0) {
          statusBadge.className = 'status-badge status--complete';
          statusBadge.textContent = `${completeCount} Cafe Task${completeCount !== 1 ? 's' : ''} Complete!`;
        } else if (activeCount > 0) {
          statusBadge.className = 'status-badge status--busy';
          statusBadge.textContent = `${activeCount} Cafe Task${activeCount !== 1 ? 's' : ''} in Progress`;
        } else {
          statusBadge.className = 'status-badge status--ready';
          statusBadge.textContent = `${questIds.length} Cafe Tasks Available`;
        }
        return;
      }
      
      // For other sections (old shift system)
      const activeShift = activeShifts.find(shift => shift.sectionType === section.sectionType);
      
      if (activeShift) {
        if (activeShift.status === 'complete') {
          // Shift is complete, rewards ready to collect
          statusBadge.className = 'status-badge status--complete';
          statusBadge.textContent = 'Collect Rewards!';
        } else if (activeShift.status === 'running') {
          // Shift is in progress
          const remainingTime = this.getRemainingTime(activeShift);
          if (remainingTime <= 0) {
            // Timer finished but status not yet updated
            statusBadge.className = 'status-badge status--complete';
            statusBadge.textContent = 'Collect Rewards!';
          } else {
            statusBadge.className = 'status-badge status--busy';
            statusBadge.textContent = this.formatTime(remainingTime);
          }
        }
      } else {
        // No active shift
        statusBadge.className = 'status-badge status--ready';
        statusBadge.textContent = 'Ready';
      }
    });
  }
  
  private getRemainingTime(shift: any): number {
    if (!shift.startedAt) return 0;
    const elapsed = Date.now() - shift.startedAt;
    return Math.max(0, shift.duration - elapsed);
  }
  
  private formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }


}