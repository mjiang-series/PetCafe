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
      <!-- Welcome Section -->
      <section class="relationship-spotlight" id="relationship-spotlight">
        <div class="spotlight-body">
          <div class="npc-summary">
            <img id="spotlight-portrait" class="npc-portrait" src="art/ui/placeholder_icon.svg" alt="NPC portrait" />
            <div>
              <h3 id="spotlight-name">Your Helpers</h3>
              <p id="spotlight-status">Build bonds with shifts, pets, and memories.</p>
            </div>
          </div>
          <div class="bond-progress">
            <span id="spotlight-level" class="bond-level">Lv 1</span>
            <div class="bond-progress-bar">
              <div id="spotlight-fill" class="bond-progress-fill" style="width: 0%"></div>
            </div>
            <span id="spotlight-points" class="bond-points">0 / 100</span>
          </div>
          <div id="spotlight-highlight" class="spotlight-highlight"></div>
        </div>
        <button class="spotlight-cta" id="go-to-dm">
          <span class="material-icons">chat_bubble</span>
          Chat
        </button>
      </section>

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

      <!-- Cafe Stories Section -->
      <section class="sections-grid cafe-stories-section">
        <h3 class="section-title">Café Stories</h3>
        
        <div class="section-card" data-section="blog">
          <div class="section-card__image">
            <img src="${getAssetPath('art/ui/blog_placeholder.png')}" alt="Cafe Moments" />
          </div>
          <div class="section-card__content">
            <h4>Cafe Moments</h4>
            <p>Share special moments</p>
            <span class="status-badge status--blog">Ready to Post</span>
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
        if (section === 'blog') {
          this.eventSystem.emit('ui:show_screen', { screenId: 'blog' });
        } else if (section) {
          this.navigateToSection(section);
        }
      });
    });

    // CTA navigation buttons
    this.element.querySelectorAll('.cta-card').forEach(card => {
      card.addEventListener('click', () => {
        const nav = card.getAttribute('data-nav');
        if (nav === 'dm-list') {
          this.eventSystem.emit('ui:show_screen', { screenId: 'dm-list' });
        } else if (nav === 'section') {
          this.eventSystem.emit('ui:show_screen', { screenId: 'section' });
        } else if (nav === 'pets') {
          this.eventSystem.emit('ui:show_screen', { screenId: 'pet-collection' });
        }
      });
    });

    const dmButton = this.element.querySelector('#go-to-dm');
    dmButton?.addEventListener('click', () => {
      const npcId = dmButton.getAttribute('data-npc');
      if (npcId) {
        this.eventSystem.emit('ui:show_screen', { 
          screenId: 'dm', 
          params: { npcId } 
        });
      } else {
        this.eventSystem.emit('ui:show_screen', { screenId: 'dm-list' });
      }
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
    const player = state.player;

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

    // Update blog status
    this.updateBlogStatus();
    
    this.updateSpotlight(player);
  }

  private updateSpotlight(player: any): void {
    const bonds = player.npcBonds || [];
    if (!bonds.length) return;

    const sorted = [...bonds].sort((a, b) => (b.bondPoints || 0) - (a.bondPoints || 0));
    const topBond = sorted[0];
    const npcId = topBond?.npcId;

    const npc = npcId ? this.gameState.getNpcConfig?.(npcId) : null;
    const portrait = npc?.artRefs?.portrait || 'art/ui/placeholder_icon.svg';

    const level = topBond?.bondLevel || 1;
    const points = topBond?.bondPoints || 0;
    const maxPoints = topBond?.maxBondPoints || 100;

    const nameEl = this.element.querySelector('#spotlight-name');
    const statusEl = this.element.querySelector('#spotlight-status');
    const portraitEl = this.element.querySelector('#spotlight-portrait') as HTMLImageElement;
    const levelEl = this.element.querySelector('#spotlight-level');
    const pointsEl = this.element.querySelector('#spotlight-points');
    const fillEl = this.element.querySelector('#spotlight-fill') as HTMLElement;
    const highlightEl = this.element.querySelector('#spotlight-highlight');
    const dmButton = this.element.querySelector('#go-to-dm');

    if (portraitEl) portraitEl.src = portrait.startsWith('/') ? portrait.substring(1) : portrait;
    if (nameEl) nameEl.textContent = npc?.name || 'Your Helpers';
    if (statusEl) {
      const recentActivity = this.getRecentRelationshipHighlight(player, npcId);
      statusEl.textContent = recentActivity || 'Complete shifts and share memories to grow closer.';
    }
    if (levelEl) levelEl.textContent = `Lv ${level || 1}`;
    if (pointsEl) pointsEl.textContent = `${points} / ${maxPoints}`;
    if (fillEl) {
      const percentage = Math.min(100, Math.round((points / maxPoints) * 100));
      fillEl.style.width = `${percentage}%`;
    }
    if (dmButton) dmButton.setAttribute('data-npc', npcId || '');
    if (highlightEl) {
      highlightEl.innerHTML = this.buildHighlightList(player, npcId);
    }
  }

  private updateSectionStatuses(): void {
    const sections = this.gameState.getCafeSections();
    const activeShifts = this.gameState.getActiveShifts();
    
    sections.forEach(section => {
      const sectionCard = this.element.querySelector(`.section-card[data-section="${section.sectionType}"]`);
      if (!sectionCard) return;
      
      const statusBadge = sectionCard.querySelector('.status-badge');
      if (!statusBadge) return;
      
      // Check for active shift
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

  private buildHighlightList(player: any, npcId?: string): string {
    const highlights: string[] = [];

    const recentMemory = (player.memories || []).slice().reverse().find((memory: any) => memory.taggedNpcs?.includes(npcId));
    if (recentMemory) {
      highlights.push(`<span class="highlight-item"><span class="material-icons">auto_stories</span> Shared memory: ${recentMemory.location}</span>`);
    }

    const recentPet = player.recentPetAcquisitions?.find((entry: any) => entry.npcId === npcId);
    if (recentPet) {
      highlights.push(`<span class="highlight-item"><span class="material-icons">pets</span> Adopted ${recentPet.petId}</span>`);
    }

    const pendingScene = this.gameState.getNextUnlockableScene?.(npcId);
    if (pendingScene) {
      highlights.push(`<span class="highlight-item"><span class="material-icons">movie</span> Scene ready: ${pendingScene.title}</span>`);
    }

    if (!highlights.length) {
      highlights.push(`<span class="highlight-item"><span class="material-icons">favorite_border</span> Spend time together to unlock new scenes.</span>`);
    }

    return highlights.slice(0, 3).join('');
  }

  private getRecentRelationshipHighlight(player: any, npcId?: string): string | null {
    if (!npcId) return null;

    if (player.recentPetAcquisitions?.some((entry: any) => entry.npcId === npcId)) {
      return 'New pet affinity unlocked a closer connection!';
    }

    return null;
  }

  private getHelperMapping(section: string): string {
    switch (section) {
      case 'bakery':
        return 'aria';
      case 'playground':
        return 'kai';
      case 'salon':
        return 'elias';
      default:
        return 'aria';
    }
  }
  
  private updateBlogStatus(): void {
    const blogCard = this.element.querySelector('.section-card[data-section="blog"]');
    if (!blogCard) return;
    
    const statusBadge = blogCard.querySelector('.status-badge');
    if (!statusBadge) return;
    
    const player = this.gameState.getPlayer();
    const memories = player.memories || [];
    const unpublishedMemories = memories.filter(m => !m.isPublished);
    const recentPosts = player.blogPosts?.filter((postId: string) => {
      // Check if posted today (simplified - just check if any posts exist)
      return true;
    }) || [];
    
    // Determine blog status
    if (unpublishedMemories.length > 0) {
      statusBadge.className = 'status-badge status--blog status--ready';
      statusBadge.textContent = `${unpublishedMemories.length} to Share`;
    } else if (recentPosts.length > 0) {
      statusBadge.className = 'status-badge status--blog status--posted';
      statusBadge.textContent = 'Posted Today';
    } else {
      statusBadge.className = 'status-badge status--blog';
      statusBadge.textContent = 'No Memories';
    }
  }
}