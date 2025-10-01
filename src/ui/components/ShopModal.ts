// Shop Modal - Premium currency purchases
import { EventSystem } from '../../systems/EventSystem';
import { GameStateManager } from '../../systems/GameState';

export interface ShopOffer {
  id: string;
  diamonds: number;
  price: number;
  bestValue?: boolean;
}

export class ShopModal {
  private element: HTMLElement | null = null;
  private eventSystem: EventSystem;
  private gameState: GameStateManager;

  private offers: ShopOffer[] = [
    { id: 'small', diamonds: 150, price: 1.99 },
    { id: 'medium', diamonds: 380, price: 4.99 },
    { id: 'large', diamonds: 980, price: 9.99, bestValue: true },
    { id: 'xlarge', diamonds: 1980, price: 19.99 },
    { id: 'mega', diamonds: 4980, price: 49.99 },
    { id: 'ultra', diamonds: 9980, price: 99.99 }
  ];

  constructor(eventSystem: EventSystem, gameState: GameStateManager) {
    this.eventSystem = eventSystem;
    this.gameState = gameState;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.eventSystem.on('shop:open', () => {
      this.show();
    });
  }

  public show(): void {
    this.create();
    document.body.appendChild(this.element!);

    // Animate in
    requestAnimationFrame(() => {
      this.element?.classList.add('show');
    });
  }

  public hide(): void {
    if (!this.element) return;

    this.element.classList.remove('show');
    setTimeout(() => {
      this.element?.remove();
      this.element = null;
    }, 300);
  }

  private create(): void {
    if (this.element) {
      this.element.remove();
    }

    const container = document.createElement('div');
    container.className = 'shop-modal';

    container.innerHTML = `
      <div class="modal__backdrop" id="shop-backdrop"></div>
      <div class="modal__content shop-modal__content">
        <div class="shop-header">
          <h2 class="shop-title">
            <span class="material-icons">storefront</span>
            Diamond Shop
          </h2>
          <button class="btn-icon shop-close" id="shop-close">
            <span class="material-icons">close</span>
          </button>
        </div>

        <div class="shop-body">
          <div class="shop-offers">
            ${this.offers.map(offer => this.renderOffer(offer)).join('')}
          </div>
        </div>

        <div class="shop-footer">
          <p class="shop-disclaimer">
            <span class="material-icons icon-sm">info</span>
            Purchases are simulated in this demo
          </p>
        </div>
      </div>
    `;

    this.element = container;
    this.attachEventHandlers();
  }

  private renderOffer(offer: ShopOffer): string {
    const diamondsPerDollar = offer.diamonds / offer.price;
    const isPopular = offer.id === 'medium';

    return `
      <div class="shop-offer ${offer.bestValue ? 'shop-offer--best-value' : ''} ${isPopular ? 'shop-offer--popular' : ''}" data-offer-id="${offer.id}">
        ${offer.bestValue ? '<div class="shop-badge shop-badge--best">BEST VALUE</div>' : ''}
        ${isPopular ? '<div class="shop-badge shop-badge--popular">POPULAR</div>' : ''}
        
        <div class="shop-offer__content">
          <div class="shop-offer__icon">
            <span class="material-icons">diamond</span>
          </div>
          <div class="shop-offer__diamonds">
            <span class="diamonds-amount">${offer.diamonds.toLocaleString()}</span>
            <span class="diamonds-label">Diamonds</span>
          </div>
          ${!offer.bestValue && !isPopular ? `
            <div class="shop-offer__bonus">
              <span class="bonus-value">${Math.round(diamondsPerDollar)}</span>
              <span class="bonus-label">per $</span>
            </div>
          ` : ''}
        </div>
        
        <button class="shop-offer__button" data-offer-id="${offer.id}">
          <span class="price-value">$${offer.price.toFixed(2)}</span>
        </button>
      </div>
    `;
  }

  private attachEventHandlers(): void {
    // Close button
    const closeBtn = this.element?.querySelector('#shop-close');
    closeBtn?.addEventListener('click', () => this.hide());

    // Backdrop click
    const backdrop = this.element?.querySelector('#shop-backdrop');
    backdrop?.addEventListener('click', () => this.hide());

    // Offer buttons
    const offerButtons = this.element?.querySelectorAll('.shop-offer__button');
    offerButtons?.forEach(button => {
      button.addEventListener('click', (e) => {
        const offerId = (e.currentTarget as HTMLElement).dataset.offerId;
        if (offerId) {
          this.handlePurchase(offerId);
        }
      });
    });
  }

  private handlePurchase(offerId: string): void {
    const offer = this.offers.find(o => o.id === offerId);
    if (!offer) return;

    // In a real game, this would integrate with payment processing
    // For now, we'll simulate the purchase
    console.log(`[Shop] Simulating purchase of ${offer.diamonds} diamonds for $${offer.price}`);

    // Award diamonds
    const player = this.gameState.getPlayer();
    player.currencies.premiumCurrency += offer.diamonds;
    this.gameState.updatePlayer(player);

    // Show success notification
    this.eventSystem.emit('alert:show', {
      title: 'Purchase Successful!',
      message: `+${offer.diamonds} diamonds added to your account.`,
      duration: 3000
    });

    // Update header currency display
    this.eventSystem.emit('player:currencies_updated', {});

    this.hide();
  }
}

