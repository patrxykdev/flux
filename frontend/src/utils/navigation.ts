// frontend/src/utils/navigation.ts

// Navigation utility for handling redirects consistently
export const navigateToHome = () => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // Use window.location.href for non-React contexts (like API interceptors)
    // This will trigger a full page reload and reset the React Router state
    window.location.href = '/';
  }
};

// Alternative navigation method that preserves React Router state when possible
export const navigateToHomePreserveState = () => {
  if (typeof window !== 'undefined') {
    // Try to use history.pushState if available, fallback to href
    if (window.history && window.history.pushState) {
      window.history.pushState({}, '', '/');
      // Trigger a popstate event to notify React Router
      window.dispatchEvent(new PopStateEvent('popstate'));
    } else {
      window.location.href = '/';
    }
  }
};
