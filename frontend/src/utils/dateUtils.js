// ...existing code...

// ...existing code...
export const formatSafeDate = (date, useRelative = false) => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    
  // ...existing code...
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    
    if (useRelative) {
  // ...existing code...
      const now = new Date();
      const diffTime = Math.abs(now - dateObj);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays/7)} weeks ago`;
      return `${Math.floor(diffDays/30)} months ago`;
    }
    
  // ...existing code...
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Date error';
  }
};

/**
 * Formats a date with time for display
 * @param {Date|string|number} date - The date to format
 * @returns {string} A formatted date string with limited time info
 */
export const formatSafeDateTime = (date) => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    
  // ...existing code...
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Date error';
  }
};

/**
 * Formats a date for machine-readable contexts (like CSV)
 * without exposing exact Unix timestamps
 * @param {Date|string|number} date - The date to format
 * @returns {string} An ISO date string without milliseconds
 */
export const formatMachineReadableDate = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
  // ...existing code...
    const isoString = dateObj.toISOString();
    return isoString.split('.')[0];
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

// ...existing code...
export const formatHTMLDateValue = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error formatting HTML date value:', error);
    return '';
  }
};
