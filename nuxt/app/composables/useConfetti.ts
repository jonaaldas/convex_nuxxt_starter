import confetti from 'canvas-confetti';

const CONFETTI_TRIGGER_KEY = 'trigger_confetti';

export function useConfetti() {
  function fireConfetti() {
    const duration = 3000;
    const end = Date.now() + duration;

    const colors = ['#a786ff', '#fd8bbc', '#eca184', '#f8deb1'];

    function frame() {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }

    frame();
  }

  function fireBurst() {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }

  function fireStars() {
    const defaults = {
      spread: 360,
      ticks: 50,
      gravity: 0,
      decay: 0.94,
      startVelocity: 30,
      colors: ['#FFE400', '#FFBD00', '#E89400', '#FFCA6C', '#FDFFB8'],
    };

    function shoot() {
      confetti({
        ...defaults,
        particleCount: 40,
        scalar: 1.2,
        shapes: ['star'],
      });

      confetti({
        ...defaults,
        particleCount: 10,
        scalar: 0.75,
        shapes: ['circle'],
      });
    }

    setTimeout(shoot, 0);
    setTimeout(shoot, 100);
    setTimeout(shoot, 200);
  }

  function scheduleConfetti() {
    if (import.meta.server) return;
    localStorage.setItem(CONFETTI_TRIGGER_KEY, 'true');
  }

  function checkAndFireConfetti() {
    if (import.meta.server) return false;

    const shouldFire = localStorage.getItem(CONFETTI_TRIGGER_KEY);
    if (shouldFire) {
      localStorage.removeItem(CONFETTI_TRIGGER_KEY);
      setTimeout(() => {
        fireConfetti();
      }, 500);
      return true;
    }
    return false;
  }

  return {
    fireConfetti,
    fireBurst,
    fireStars,
    scheduleConfetti,
    checkAndFireConfetti,
  };
}
