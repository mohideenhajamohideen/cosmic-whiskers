// Input Handler - Manages touch, mouse, and keyboard inputs
export class InputHandler {
  private canvas: HTMLCanvasElement;
  private onFlapCallback: () => void;
  private lastInputTime: number = 0;
  private readonly DEBOUNCE_MS = 100; // Prevent double-taps

  constructor(canvas: HTMLCanvasElement, onFlap: () => void) {
    this.canvas = canvas;
    this.onFlapCallback = onFlap;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Touch input for mobile
    this.canvas.addEventListener('touchstart', this.handleTouch, { passive: false });

    // Mouse click for desktop
    this.canvas.addEventListener('click', this.handleClick);

    // Keyboard input for desktop
    document.addEventListener('keydown', this.handleKeyDown);
  }

  private handleTouch = (event: TouchEvent): void => {
    event.preventDefault(); // Prevent default touch behavior
    this.triggerFlap();
  };

  private handleClick = (event: MouseEvent): void => {
    this.triggerFlap();
  };

  private handleKeyDown = (event: KeyboardEvent): void => {
    // Spacebar or Enter key
    if (event.code === 'Space' || event.code === 'Enter') {
      event.preventDefault(); // Prevent page scroll
      this.triggerFlap();
    }
  };

  private triggerFlap(): void {
    const currentTime = Date.now();

    // Debounce to prevent double-taps
    if (currentTime - this.lastInputTime < this.DEBOUNCE_MS) {
      return;
    }

    this.lastInputTime = currentTime;
    this.onFlapCallback();
  }

  public destroy(): void {
    // Remove event listeners
    this.canvas.removeEventListener('touchstart', this.handleTouch);
    this.canvas.removeEventListener('click', this.handleClick);
    document.removeEventListener('keydown', this.handleKeyDown);
  }
}
