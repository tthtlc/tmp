/**
 * UEN (Unique Entity Number) Validator
 * Validates Singapore UEN formats according to official specifications
 */

// Entity type mappings based on issuing agencies
const ENTITY_TYPE_MAPPINGS = {
  // ACRA (Accounting and Corporate Regulatory Authority)
  'LP': 'Limited Partnership',
  'LL': 'Limited Liability Partnership',
  'LC': 'Local Company',
  'PF': 'Public Accounting Firm',
  
  // ESG (Enterprise Singapore)
  'RF': 'Representative Office',
  
  // IRAS (Inland Revenue Authority of Singapore)
  'MQ': 'Mosque',
  'MM': 'Madrasah',
  
  // MCI (Ministry of Communications and Information)
  'NB': 'News Bureau',
  
  // MCCY (Ministry of Culture, Community and Youth)
  'CC': 'Charity and Institution of a Public Character',
  'CS': 'Cooperative Society',
  'MB': 'Mutual Benefit Organisation',
  
  // Mindef (Ministry of Defence)
  'FM': 'Foreign Military Unit',
  
  // MOE (Ministry of Education)
  'GS': 'Government and Government-Aided School',
  
  // MFA (Ministry of Foreign Affairs)
  'DP': 'Diplomatic Mission',
  'CP': 'Consulate',
  'NR': 'International Organisation',
  
  // MOH (Ministry of Health)
  'CM': 'Clinic',
  'MC': 'Medical Clinic',
  'MD': 'Dental Clinic',
  'HS': 'Hospital',
  'VH': 'Voluntary Welfare Home',
  'CH': 'Commercial Home',
  'MH': 'Medical Home',
  'CL': 'Clinical Laboratory',
  'XL': 'X-ray Laboratory',
  'CA': 'Clinical and X-ray Laboratory',
  'HC': 'Healthcare Service Provider',
  
  // MOM (Ministry of Manpower)
  'TU': 'Trade Union',
  
  // MND (Ministry of National Development)
  'TC': 'Town Council',
  
  // MAS (Monetary Authority of Singapore)
  'FB': 'Financial Representative Office',
  'FN': 'Bank Representative Office',
  
  // PA (People\'s Association)
  'PA': 'PA Service',
  'PB': 'Grassroot Unit',
  
  // ROS (Registry of Societies)
  'SS': 'Society',
  
  // SLA (Singapore Land Authority)
  'MC': 'Management Corporation',
  'SM': 'Subsidiary Management Corporation',
  
  // SNDGO (Smart Nation and Digital Government Office)
  'GA': 'Government Agency',
  'GB': 'Statutory Board'
};

// Valid entity type indicators for Format C
const VALID_ENTITY_TYPE_INDICATORS = Object.keys(ENTITY_TYPE_MAPPINGS).map(key => key.charAt(0));

/**
 * Validates UEN Format A: nnnnnnnX (9 digits)
 * For businesses registered with ACRA
 */
function validateFormatA(uen) {
  if (!uen || typeof uen !== 'string') return false;
  
  // Must be exactly 9 characters
  if (uen.length !== 9) return false;
  
  // First 8 characters must be digits
  const digits = uen.substring(0, 8);
  if (!/^\d{8}$/.test(digits)) return false;
  
  // Last character must be a letter
  const lastChar = uen.charAt(8);
  if (!/^[A-Z]$/.test(lastChar)) return false;
  
  return true;
}

/**
 * Validates UEN Format B: yyyynnnnnX (10 digits)
 * For local companies registered with ACRA
 */
function validateFormatB(uen) {
  if (!uen || typeof uen !== 'string') return false;
  
  // Must be exactly 10 characters
  if (uen.length !== 10) return false;
  
  // First 4 characters must be year (1900-2099)
  const year = uen.substring(0, 4);
  if (!/^\d{4}$/.test(year)) return false;
  
  const yearNum = parseInt(year, 10);
  if (yearNum < 1900 || yearNum > 2099) return false;
  
  // Next 5 characters must be digits
  const digits = uen.substring(4, 9);
  if (!/^\d{5}$/.test(digits)) return false;
  
  // Last character must be a letter
  const lastChar = uen.charAt(9);
  if (!/^[A-Z]$/.test(lastChar)) return false;
  
  return true;
}

/**
 * Validates UEN Format C: TyyPQnnnnnX (10 digits)
 * For all other entities with new UEN
 */
function validateFormatC(uen) {
  if (!uen || typeof uen !== 'string') return false;
  
  // Must be exactly 10 characters
  if (uen.length !== 10) return false;
  
  // First character must be a valid entity type indicator
  const entityTypeIndicator = uen.charAt(0);
  if (!VALID_ENTITY_TYPE_INDICATORS.includes(entityTypeIndicator)) return false;
  
  // Next 2 characters must be year (00-99)
  const year = uen.substring(1, 3);
  if (!/^\d{2}$/.test(year)) return false;
  
  // 4th character must be alphabetical
  const fourthChar = uen.charAt(3);
  if (!/^[A-Z]$/.test(fourthChar)) return false;
  
  // 5th character must be alphanumeric
  const fifthChar = uen.charAt(4);
  if (!/^[A-Z0-9]$/.test(fifthChar)) return false;
  
  // Next 5 characters must be digits
  const digits = uen.substring(5, 10);
  if (!/^\d{5}$/.test(digits)) return false;
  
  return true;
}

/**
 * Gets the entity type description based on entity type code
 */
function getEntityType(code) {
  return ENTITY_TYPE_MAPPINGS[code] || null;
}

/**
 * Extracts entity type from Format C UEN
 */
function extractEntityTypeFromFormatC(uen) {
  if (!uen || uen.length < 5) return null;
  
  const entityTypeCode = uen.substring(0, 2);
  return getEntityType(entityTypeCode);
}

/**
 * Main UEN validation function
 * Returns detailed validation result
 */
function validateUEN(uen) {
  if (!uen || typeof uen !== 'string') {
    return {
      isValid: false,
      format: null,
      formatDescription: null,
      entityType: null,
      error: 'UEN is required and must be a string',
      details: null
    };
  }
  
  // Remove whitespace and convert to uppercase
  const cleanUEN = uen.trim().toUpperCase();
  
  if (cleanUEN.length === 0) {
    return {
      isValid: false,
      format: null,
      formatDescription: null,
      entityType: null,
      error: 'UEN cannot be empty',
      details: null
    };
  }
  
  // Try Format A validation
  if (validateFormatA(cleanUEN)) {
    return {
      isValid: true,
      format: 'A',
      formatDescription: 'Businesses registered with ACRA',
      entityType: null,
      error: null,
      details: {
        length: cleanUEN.length,
        pattern: 'nnnnnnnX',
        example: '12345678A'
      }
    };
  }
  
  // Try Format B validation
  if (validateFormatB(cleanUEN)) {
    return {
      isValid: true,
      format: 'B',
      formatDescription: 'Local companies registered with ACRA',
      entityType: null,
      error: null,
      details: {
        length: cleanUEN.length,
        pattern: 'yyyynnnnnX',
        example: '200912345A'
      }
    };
  }
  
  // Try Format C validation
  if (validateFormatC(cleanUEN)) {
    const entityType = extractEntityTypeFromFormatC(cleanUEN);
    return {
      isValid: true,
      format: 'C',
      formatDescription: 'All other entities with new UEN',
      entityType: entityType,
      error: null,
      details: {
        length: cleanUEN.length,
        pattern: 'TyyPQnnnnnX',
        example: 'T09LL0001B'
      }
    };
  }
  
  // If none of the formats match
  return {
    isValid: false,
    format: null,
    formatDescription: null,
    entityType: null,
    error: 'UEN does not match any valid format (A, B, or C)',
    details: {
      providedLength: cleanUEN.length,
      validFormats: [
        { format: 'A', pattern: 'nnnnnnnX', length: 9, example: '12345678A' },
        { format: 'B', pattern: 'yyyynnnnnX', length: 10, example: '200912345A' },
        { format: 'C', pattern: 'TyyPQnnnnnX', length: 10, example: 'T09LL0001B' }
      ]
    }
  };
}

/**
 * Get all available entity types
 */
function getAllEntityTypes() {
  return ENTITY_TYPE_MAPPINGS;
}

/**
 * Get format examples for help/documentation
 */
function getFormatExamples() {
  return {
    formatA: {
      description: 'Businesses registered with ACRA',
      pattern: 'nnnnnnnX (9 digits)',
      examples: ['12345678A', '98765432B', '11111111C']
    },
    formatB: {
      description: 'Local companies registered with ACRA',
      pattern: 'yyyynnnnnX (10 digits)',
      examples: ['200912345A', '202199999B', '199812345C']
    },
    formatC: {
      description: 'All other entities with new UEN',
      pattern: 'TyyPQnnnnnX (10 digits)',
      examples: ['T09LL0001B', 'S21AB1234C', 'R20CD5678D']
    }
  };
}

module.exports = {
  validateUEN,
  validateFormatA,
  validateFormatB,
  validateFormatC,
  getEntityType,
  extractEntityTypeFromFormatC,
  getAllEntityTypes,
  getFormatExamples,
  ENTITY_TYPE_MAPPINGS,
  VALID_ENTITY_TYPE_INDICATORS
};