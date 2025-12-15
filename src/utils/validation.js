// src/utils/validation.js
// Zod-like validation untuk entry types (minimal implementation, bisa upgrade ke Zod later)

/**
 * Validate entry data dengan schema
 * Returns { valid: boolean, errors: string[] }
 * 
 * Note: id dan createdAt tidak divalidasi karena akan di-generate otomatis oleh addEntry()
 */
export function validateEntry(entry, formType) {
  const errors = []

  // Note: id dan createdAt tidak perlu divalidasi karena auto-generated
  // oleh addEntry() function

  // Weight validation (common untuk banyak form types)
  if (entry.weightKg !== undefined) {
    if (typeof entry.weightKg !== 'number' || isNaN(entry.weightKg)) {
      errors.push('weightKg harus berupa number')
    } else if (entry.weightKg < 0) {
      errors.push('weightKg tidak boleh negatif')
    } else if (entry.weightKg > 1000) {
      errors.push('weightKg tidak boleh lebih dari 1000 kg')
    }
  }

  // Form-specific validations
  switch (formType || entry.formType) {
    case 'sampah_masuk':
      if (!entry.locationId) errors.push('locationId harus ada')
      if (!entry.wasteType) errors.push('wasteType harus ada')
      if (!entry.shift) errors.push('shift harus ada')
      if (!entry.weightKg || entry.weightKg <= 0) {
        errors.push('weightKg harus lebih dari 0')
      }
      break

    case 'sampah_terpilah':
      if (entry.organicKg !== undefined) {
        if (typeof entry.organicKg !== 'number' || entry.organicKg < 0) {
          errors.push('organicKg harus >= 0')
        }
      }
      if (entry.inorganicKg !== undefined) {
        if (typeof entry.inorganicKg !== 'number' || entry.inorganicKg < 0) {
          errors.push('inorganicKg harus >= 0')
        }
      }
      break

    case 'telur_harian':
      if (!entry.layingCages || !Array.isArray(entry.layingCages)) {
        errors.push('layingCages harus berupa array')
      }
      break

    case 'panen_maggot':
      if (!entry.locationId) errors.push('locationId harus ada')
      if (!entry.harvestType) errors.push('harvestType harus ada')
      if (!entry.weightKg || entry.weightKg <= 0) {
        errors.push('weightKg harus lebih dari 0')
      }
      break

    case 'panen_kohei':
      if (!entry.weightKg || entry.weightKg <= 0) {
        errors.push('weightKg harus lebih dari 0')
      }
      break

    case 'panen_kasgot':
      if (!entry.weightKg || entry.weightKg <= 0) {
        errors.push('weightKg harus lebih dari 0')
      }
      if (!entry.source) {
        errors.push('source harus ada')
      }
      break

    case 'bsf_pakan':
      if (!entry.bsfBoxId) {
        errors.push('bsfBoxId harus ada')
      }
      if (entry.feedWeightGram !== undefined) {
        if (typeof entry.feedWeightGram !== 'number' || entry.feedWeightGram < 0) {
          errors.push('feedWeightGram harus >= 0')
        }
      }
      break

    case 'pupuk_sisa_organik':
      if (!entry.weightKg || entry.weightKg <= 0) {
        errors.push('weightKg harus lebih dari 0')
      }
      if (!entry.place) {
        errors.push('place harus ada')
      }
      break

    // Add more form types as needed
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Sanitize string untuk prevent XSS
 * Minimal implementation - bisa upgrade ke DOMPurify later
 */
export function sanitizeString(str) {
  if (typeof str !== 'string') return str
  
  // Remove potentially dangerous characters
  return str
    .replace(/[<>]/g, '') // Remove < and >
    .trim()
    .slice(0, 1000) // Limit length
}

/**
 * Sanitize entry object
 */
export function sanitizeEntry(entry) {
  const sanitized = { ...entry }
  
  // Sanitize string fields
  if (sanitized.locationName) {
    sanitized.locationName = sanitizeString(sanitized.locationName)
  }
  if (sanitized.userName) {
    sanitized.userName = sanitizeString(sanitized.userName)
  }
  if (sanitized.wasteType) {
    sanitized.wasteType = sanitizeString(sanitized.wasteType)
  }
  
  // DON'T modify synced field here - it will be set by addEntry()
  // Remove synced from sanitized if present (will be set explicitly)
  delete sanitized.synced
  
  return sanitized
}
