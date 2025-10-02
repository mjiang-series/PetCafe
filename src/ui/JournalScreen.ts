import { UnifiedBaseScreen } from './UnifiedBaseScreen';
import { ScreenHeaderConfig } from './components/ScreenHeader';
import { Memory } from '../models';
import { GameState } from '../systems/GameState';
import { EventSystem } from '../systems/EventSystem';
import { getAssetPath, AssetPaths } from '../utils/assetPaths';
import { getNPCById } from '../utils/NPCData';

interface FilterState {
  section: 'all' | 'bakery' | 'playground' | 'salon';
  area: 'all' | 'bakery' | 'playground' | 'salon';
  mood: 'all' | string;
  special: 'all' | 'unviewed' | 'shared' | 'favorited';
}

export class JournalScreen extends UnifiedBaseScreen {
  private memories: Memory[] = [];
  private filteredMemories: Memory[] = [];
  private filters: FilterState = {
    section: 'all',
    area: 'all',
    mood: 'all',
    special: 'all'
  };
  private calendarData: Map<string, number> = new Map();
  private currentMonth: Date = new Date();
  private isLoading = false;
  private memoryContainer: HTMLElement | null = null;

  constructor(id: string, eventSystem: EventSystem, gameState: GameState) {
    super(id, eventSystem, gameState);
  }

  protected getScreenHeaderConfig(): ScreenHeaderConfig | null {
    return {
      title: 'Memory Journal',
      showBack: false
    };
  }

  protected createContent(): string {
    return `
      <div class="journal-screen">
        <div class="journal-header">
          <div class="journal-stats">
            <div class="stat-item">
              <span class="stat-label">Today</span>
              <span class="stat-value" id="memories-today">0</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">This Week</span>
              <span class="stat-value" id="memories-this-week">0</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Total</span>
              <span class="stat-value" id="total-memories">0</span>
            </div>
          </div>
        </div>

        <div class="calendar-widget">
          <div class="calendar-header">
            <button class="calendar-nav" id="prev-month">
              <span class="material-icons">chevron_left</span>
            </button>
            <h3 class="calendar-month" id="current-month">January 2024</h3>
            <button class="calendar-nav" id="next-month">
              <span class="material-icons">chevron_right</span>
            </button>
          </div>
          <div class="calendar-grid" id="calendar-grid">
            <!-- Calendar days will be generated here -->
          </div>
        </div>

        <div class="collection-filters">
          <button class="filter-btn area-filter active" data-npc="all">
            <div class="filter-content">
              <span class="filter-label">All</span>
              <span class="filter-progress memory-count">${this.memories.length}</span>
            </div>
          </button>
          
          <button class="filter-btn area-filter" data-npc="bakery">
            <div class="filter-image">
              <img src="${AssetPaths.scenePlaceholder('bakery')}" alt="Bakery" />
            </div>
            <div class="filter-content">
              <span class="filter-label">Bakery</span>
              <span class="filter-progress memory-count">0</span>
            </div>
          </button>
          
          <button class="filter-btn area-filter" data-npc="playground">
            <div class="filter-image">
              <img src="${AssetPaths.scenePlaceholder('playground')}" alt="Playground" />
            </div>
            <div class="filter-content">
              <span class="filter-label">Playground</span>
              <span class="filter-progress memory-count">0</span>
            </div>
          </button>
          
          <button class="filter-btn area-filter" data-npc="salon">
            <div class="filter-image">
              <img src="${AssetPaths.scenePlaceholder('salon')}" alt="Salon" />
            </div>
            <div class="filter-content">
              <span class="filter-label">Salon</span>
              <span class="filter-progress memory-count">0</span>
            </div>
          </button>
        </div>

        <div class="memory-timeline" id="memory-timeline">
          <div class="timeline-content" id="timeline-content">
            <!-- Memory cards will be generated here -->
          </div>
          <div class="loading-indicator" id="loading-indicator">
            <div class="spinner"></div>
          </div>
        </div>
      </div>
    `;
  }

  protected setupEventListeners(): void {
    super.setupEventListeners();

    // Calendar navigation
    this.addClickHandler('#prev-month', () => this.navigateMonth(-1));
    this.addClickHandler('#next-month', () => this.navigateMonth(1));

    // Area filter options
    this.element.querySelectorAll('.filter-btn').forEach(option => {
      option.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const areaValue = target.dataset.npc || 'all'; // Still using data-npc attribute for backward compatibility
        
        // Update active state
        this.element.querySelectorAll('.filter-btn').forEach(opt => {
          opt.classList.remove('active');
        });
        target.classList.add('active');
        
        // Update filter
        this.filters.area = areaValue as any;
        this.applyFilters();
        this.updateMemoryDisplay();
      });
    });

    // Memory timeline scroll
    const timeline = this.element.querySelector('#memory-timeline');
    if (timeline) {
      timeline.addEventListener('scroll', () => this.handleScroll());
    }

    // Listen for memory updates
    this.eventSystem.on('memory:created', () => this.loadMemories());
    this.eventSystem.on('memory:shared', () => this.loadMemories());
    this.eventSystem.on('memory:viewed', () => this.updateStats());
  }

  onShow(): void {
    this.loadMemories();
    this.updateCalendar();
    this.updateStats();
    
    // Mark this screen as opened
    this.eventSystem.emit('journal:opened', {});
  }

  private loadMemories(): void {
    const player = this.gameState.getPlayer();
    this.memories = player.memories || [];
    
    // Build calendar data
    this.buildCalendarData();
    
    // Apply filters
    this.applyFilters();
    
    // Update display
    this.updateMemoryDisplay();
  }

  private buildCalendarData(): void {
    this.calendarData.clear();
    
    this.memories.forEach(memory => {
      const date = new Date(memory.timestamp);
      const dateKey = this.getDateKey(date);
      
      const count = this.calendarData.get(dateKey) || 0;
      this.calendarData.set(dateKey, count + 1);
    });
  }

  private getDateKey(date: Date): string {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  }

  private updateFilter(filterType: keyof FilterState, value: string): void {
    // Update filter state
    this.filters[filterType] = value as any;
    
    // Update UI
    const filterGroup = this.element.querySelector(`[data-filter="${filterType}"]`)?.parentElement;
    if (filterGroup) {
      filterGroup.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.remove('active');
      });
      
      const activeChip = filterGroup.querySelector(`[data-value="${value}"]`);
      if (activeChip) {
        activeChip.classList.add('active');
      }
    }
    
    // Apply filters and update display
    this.applyFilters();
    this.updateMemoryDisplay();
  }

  private applyFilters(): void {
    this.filteredMemories = this.memories.filter(memory => {
      // Area filter (based on location)
      if (this.filters.area !== 'all') {
        const memoryLocation = memory.location?.toLowerCase();
        if (memoryLocation !== this.filters.area) {
          return false;
        }
      }
      
      // Special filters
      if (this.filters.special !== 'all') {
        switch (this.filters.special) {
          case 'unviewed':
            if (memory.viewed) return false;
            break;
          case 'shared':
            if (!memory.isPublished) return false;
            break;
          case 'favorited':
            if (!memory.favorited) return false;
            break;
        }
      }
      
      return true;
    });
    
    // Sort by timestamp (newest first)
    this.filteredMemories.sort((a, b) => b.timestamp - a.timestamp);
  }

  private updateMemoryDisplay(): void {
    const container = this.element.querySelector('#timeline-content');
    if (!container) return;
    
    if (this.filteredMemories.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <span class="material-icons">photo_camera</span>
          <p>No memories found</p>
          <p class="empty-hint">Complete shifts to create new memories!</p>
        </div>
      `;
      return;
    }
    
    // Group memories by date
    const memoryGroups = new Map<string, Memory[]>();
    
    this.filteredMemories.forEach(memory => {
      const date = new Date(memory.timestamp);
      const dateKey = this.formatDateHeader(date);
      
      if (!memoryGroups.has(dateKey)) {
        memoryGroups.set(dateKey, []);
      }
      memoryGroups.get(dateKey)!.push(memory);
    });
    
    // Build HTML
    let html = '';
    
    memoryGroups.forEach((memories, dateHeader) => {
      html += `
        <div class="date-group">
          <h3 class="date-header">${dateHeader}</h3>
          <div class="memory-cards">
      `;
      
      memories.forEach(memory => {
        html += this.createMemoryCard(memory);
      });
      
      html += `
          </div>
        </div>
      `;
    });
    
    container.innerHTML = html;
    
    // Setup click handlers for memory cards
    container.querySelectorAll('.memory-preview-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const memoryId = (e.currentTarget as HTMLElement).dataset.memoryId;
        if (memoryId) {
          this.viewMemory(memoryId);
        }
      });
    });
  }

  private createMemoryCard(memory: Memory): string {
    const date = new Date(memory.timestamp);
    const timeStr = date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
    
    // Truncate content for snippet
    const contentText = memory.snippet || memory.content || '';
    const snippet = contentText.length > 80 
      ? contentText.substring(0, 80) + '...' 
      : contentText;
    
    return `
      <div class="memory-preview-card ${!memory.viewed ? 'unviewed' : ''}" data-memory-id="${memory.id || memory.memoryId}">
        <div class="memory-preview-image">
          <img src="${getAssetPath(memory.imageUrl || 'art/memories_image_placeholder.png')}" alt="Memory" />
          <span class="memory-mood-badge mood--${memory.mood}">${memory.mood}</span>
          ${!memory.viewed ? '<span class="new-badge">NEW</span>' : ''}
        </div>
        <div class="memory-preview-content">
          <div class="memory-timestamp">
            <span class="material-icons">schedule</span>
            <span>${timeStr}</span>
          </div>
          <p class="memory-snippet">${snippet}</p>
        </div>
      </div>
    `;
  }

  private formatDateHeader(date: Date): string {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const dateStr = date.toDateString();
    const todayStr = today.toDateString();
    const yesterdayStr = yesterday.toDateString();
    
    if (dateStr === todayStr) {
      return 'Today';
    } else if (dateStr === yesterdayStr) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  }

  private navigateMonth(direction: number): void {
    this.currentMonth.setMonth(this.currentMonth.getMonth() + direction);
    this.updateCalendar();
  }

  private updateCalendar(): void {
    const monthElement = this.element.querySelector('#current-month');
    if (monthElement) {
      monthElement.textContent = this.currentMonth.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
    }
    
    const grid = this.element.querySelector('#calendar-grid');
    if (!grid) return;
    
    // Clear existing calendar
    grid.innerHTML = '';
    
    // Add day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
      const header = document.createElement('div');
      header.className = 'calendar-day-header';
      header.textContent = day;
      grid.appendChild(header);
    });
    
    // Get first day of month and number of days
    const firstDay = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
    const lastDay = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      const emptyDay = document.createElement('div');
      emptyDay.className = 'calendar-day empty';
      grid.appendChild(emptyDay);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), day);
      const dateKey = this.getDateKey(date);
      const memoryCount = this.calendarData.get(dateKey) || 0;
      
      const dayElement = document.createElement('div');
      dayElement.className = 'calendar-day';
      if (memoryCount > 0) {
        dayElement.classList.add('has-memories');
        dayElement.dataset.count = memoryCount.toString();
      }
      
      // Check if it's today
      const today = new Date();
      if (date.toDateString() === today.toDateString()) {
        dayElement.classList.add('today');
      }
      
      dayElement.innerHTML = `
        <span class="day-number">${day}</span>
        ${memoryCount > 0 ? `<span class="memory-dot">${memoryCount}</span>` : ''}
      `;
      
      // Add click handler
      if (memoryCount > 0) {
        dayElement.addEventListener('click', () => {
          this.jumpToDate(date);
        });
      }
      
      grid.appendChild(dayElement);
    }
  }

  private jumpToDate(date: Date): void {
    // Find first memory from this date
    const dateKey = this.formatDateHeader(date);
    const dateGroup = this.element.querySelector(`.date-header`);
    
    // Find the matching date header and scroll to it
    this.element.querySelectorAll('.date-header').forEach(header => {
      if (header.textContent === dateKey) {
        header.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  private updateStats(): void {
    // Total memories
    const totalElement = this.element.querySelector('#total-memories');
    if (totalElement) {
      totalElement.textContent = this.memories.length.toString();
    }
    
    // Memories today (start of today to now)
    const todayElement = this.element.querySelector('#memories-today');
    if (todayElement) {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const memoriesToday = this.memories.filter(m => 
        new Date(m.timestamp) >= startOfToday
      ).length;
      todayElement.textContent = memoriesToday.toString();
    }
    
    // Memories this week (last 7 days)
    const weekElement = this.element.querySelector('#memories-this-week');
    if (weekElement) {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const memoriesThisWeek = this.memories.filter(m => 
        new Date(m.timestamp) >= oneWeekAgo
      ).length;
      weekElement.textContent = memoriesThisWeek.toString();
    }
    
    // Update area filter counts
    this.updateAreaFilterCounts();
  }

  private updateAreaFilterCounts(): void {
    const areaCounts: Record<string, number> = {
      bakery: 0,
      playground: 0,
      salon: 0
    };
    
    this.memories.forEach(memory => {
      const location = memory.location?.toLowerCase();
      if (location && areaCounts[location] !== undefined) {
        areaCounts[location]++;
      }
    });
    
    // Update UI
    Object.entries(areaCounts).forEach(([area, count]) => {
      const element = this.element.querySelector(`.filter-btn[data-npc="${area}"] .memory-count`);
      if (element) {
        element.textContent = count.toString();
      }
    });
    
    // Update "All" count
    const allElement = this.element.querySelector('.filter-btn[data-npc="all"] .memory-count');
    if (allElement) {
      allElement.textContent = this.memories.length.toString();
    }
  }

  private handleScroll(): void {
    // Implement infinite scroll loading if needed in the future
    // For now, all memories are loaded at once
  }

  private viewMemory(memoryId: string): void {
    const memory = this.memories.find(m => m.id === memoryId || m.memoryId === memoryId);
    if (!memory) return;
    
    // Mark as viewed
    if (!memory.viewed) {
      memory.viewed = true;
      this.gameState.updatePlayer({
        memories: this.memories
      });
      
      // Update badge count
      this.eventSystem.emit('memory:viewed', { memoryId });
      
      // Update display
      this.updateMemoryDisplay();
    }
    
    // Navigate to detail view
    this.eventSystem.emit('ui:show_screen', {
      screenId: 'memory-detail',
      data: { memoryId }
    });
  }
}
