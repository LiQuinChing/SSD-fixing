// ...existing code...

// ...existing code...
const formatSafeDate = (date) => {
  if (!date) return null;
  try {
    const dateObj = new Date(date);
    return dateObj.toISOString().split('T')[0]; // YYYY-MM-DD format only
  } catch (error) {
    return null;
  }
};

// ...existing code...
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  // ...existing code...
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  // ...existing code...
  if (obj instanceof Date) {
    return obj.toISOString().split('T')[0];
  }
  
  // ...existing code...
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
  // ...existing code...
    if (value == null) {
      result[key] = value;
      continue;
    }
    
  // ...existing code...
    if (typeof value === 'object') {
      result[key] = sanitizeObject(value);
      continue;
    }
    
  // ...existing code...
    if (typeof value === 'number' && 
        value > 1000000000 && 
        value < 9999999999 &&
        key.toLowerCase().includes('time')) {
  // ...existing code...
      result[key] = formatSafeDate(new Date(value * 1000));
      continue;
    }
    
  // ...existing code...
    if ((key === 'createdAt' || key === 'updatedAt') && typeof value === 'string') {
      result[key] = formatSafeDate(value);
      continue;
    }
    
  // ...existing code...
    result[key] = value;
  }
  
  return result;
};

// ...existing code...
export const timestampSanitizer = (req, res, next) => {
  // Store the original res.json method
  const originalJson = res.json;
  
  // Override the res.json method
  res.json = function(data) {
    // Process the response data to sanitize timestamps
    const sanitizedData = sanitizeObject(data);
    
    // Call the original json method with sanitized data
    return originalJson.call(this, sanitizedData);
  };
  
  next();
};

export default timestampSanitizer;
