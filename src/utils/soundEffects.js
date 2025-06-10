// Audio context for playing sounds
let audioContext = null;

// Initialize audio context
const initAudioContext = () => {
  if (!audioContext) {
    try {
      // Modern browsers
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContext = new AudioContext();
    } catch (e) {
      console.error('Web Audio API not supported in this browser', e);
    }
  }
  return audioContext;
};

// Generate notification sound
export const playNotificationSound = () => {
  const context = initAudioContext();
  if (!context) return;
  
  // Create oscillator for the beep sound
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  
  // Configure sound
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(880, context.currentTime); // A5 note
  
  // Configure volume envelope
  gainNode.gain.setValueAtTime(0, context.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.3, context.currentTime + 0.05);
  gainNode.gain.linearRampToValueAtTime(0, context.currentTime + 0.3);
  
  // Connect nodes
  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  
  // Play sound
  oscillator.start(context.currentTime);
  oscillator.stop(context.currentTime + 0.3);
};

// Generate message sent sound
export const playMessageSentSound = () => {
  const context = initAudioContext();
  if (!context) return;
  
  // Create oscillator for the beep sound
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  
  // Configure sound
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(440, context.currentTime); // A4 note
  oscillator.frequency.linearRampToValueAtTime(660, context.currentTime + 0.1); // E5 note
  
  // Configure volume envelope
  gainNode.gain.setValueAtTime(0, context.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.2, context.currentTime + 0.05);
  gainNode.gain.linearRampToValueAtTime(0, context.currentTime + 0.2);
  
  // Connect nodes
  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  
  // Play sound
  oscillator.start(context.currentTime);
  oscillator.stop(context.currentTime + 0.2);
};
