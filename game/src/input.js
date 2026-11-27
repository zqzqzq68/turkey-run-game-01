// input.js — keyboard and mouse, kept apart from the game so the controls
// are easy to find and change. Keys: Space / ArrowUp / W jump, ArrowDown /
// S slide, P pause, M mute, R restart, Enter start. Clicks jump too, and
// buttons on the screens are hit-tested by the game from the same clicks.
export class Input {
  constructor(canvas, handlers) {
    this.handlers = handlers;
    this.keys = new Set();
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onPointer = this.onPointer.bind(this);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    canvas.addEventListener('pointerdown', this.onPointer);
  }

  isDown(code) {
    return this.keys.has(code);
  }

  onKeyDown(event) {
    if (event.repeat) return;
    this.keys.add(event.code);
    const h = this.handlers;
    if (event.code === 'Space' || event.code === 'ArrowUp' || event.code === 'KeyW') {
      event.preventDefault();
      h.onJump();
    } else if (event.code === 'ArrowDown' || event.code === 'KeyS') {
      event.preventDefault();
      h.onSlide();
    } else if (event.code === 'KeyP' || event.code === 'Escape') {
      h.onPause();
    } else if (event.code === 'KeyM') {
      h.onMute();
    } else if (event.code === 'KeyR') {
      h.onRestart();
    } else if (event.code === 'Enter') {
      h.onConfirm();
    }
  }

  onKeyUp(event) {
    this.keys.delete(event.code);
  }

  onPointer(event) {
    const rect = event.target.getBoundingClientRect();
    const scaleX = 960 / rect.width;
    const scaleY = 540 / rect.height;
    this.handlers.onClick((event.clientX - rect.left) * scaleX, (event.clientY - rect.top) * scaleY);
  }

  detach() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }
}
