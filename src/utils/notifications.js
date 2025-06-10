// Utility functions for handling browser notifications
// Import sound effects
import { playNotificationSound as playSound } from './soundEffects';

// Request notification permission
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
};

// Send a notification
export const sendNotification = (title, options = {}) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }
  
  // Default options
  const defaultOptions = {
    icon: '/notification-icon.svg',
    badge: '/notification-badge.svg',
    silent: true
  };
  
  // Create and show notification
  const notification = new Notification(title, { ...defaultOptions, ...options });
  
  // Handle notification click
  notification.onclick = function(event) {
    event.preventDefault();
    window.focus();
    notification.close();
  };
  
  return notification;
};

// Send a message notification
export const sendMessageNotification = (message, showNotifications) => {
  if (!showNotifications || document.hasFocus()) {
    return; // Don't show notifications if the window is focused
  }
  
  sendNotification(`New message from ${message.username}`, {
    body: message.text.length > 50 ? message.text.substring(0, 50) + '...' : message.text,
    tag: 'chat-message',
    data: { messageId: message.id }
  });
  
  // Play notification sound
  playNotificationSound();
};

// Play notification sound
export const playNotificationSound = () => {
  playSound();
};
