/**
 * UEN Validator Tests
 * Tests for the UEN validation logic
 */

import {
  validateUEN,
  validateFormatA,
  validateFormatB,
  validateFormatC,
  getEntityType,
  getFormatExamples
} from '../../lib/uen-validator.js';

describe('UEN Validator', () => {
  describe('validateFormatA', () => {
    test('validates correct Format A UEN', () => {
      expect(validateFormatA('12345678A')).toBe(true);
      expect(validateFormatA('98765432Z')).toBe(true);
      expect(validateFormatA('11111111B')).toBe(true);
    });

    test('rejects incorrect Format A UEN', () => {
      expect(validateFormatA('1234567A')).toBe(false); // Too short
      expect(validateFormatA('123456789')).toBe(false); // No letter
      expect(validateFormatA('12345678AA')).toBe(false); // Too long
      expect(validateFormatA('1234567!A')).toBe(false); // Invalid character
    });

    test('handles edge cases', () => {
      expect(validateFormatA('')).toBe(false);
      expect(validateFormatA(null)).toBe(false);
      expect(validateFormatA(undefined)).toBe(false);
    });
  });

  describe('validateFormatB', () => {
    test('validates correct Format B UEN', () => {
      expect(validateFormatB('200912345A')).toBe(true);
      expect(validateFormatB('202199999Z')).toBe(true);
      expect(validateFormatB('199812345C')).toBe(true);
    });

    test('rejects incorrect Format B UEN', () => {
      expect(validateFormatB('99912345A')).toBe(false); // Invalid year
      expect(validateFormatB('300012345A')).toBe(false); // Future year
      expect(validateFormatB('20091234A')).toBe(false); // Too short
      expect(validateFormatB('200912345')).toBe(false); // No letter
    });

    test('validates year range', () => {
      expect(validateFormatB('190012345A')).toBe(true); // Min year
      expect(validateFormatB('209912345A')).toBe(true); // Max year
      expect(validateFormatB('189912345A')).toBe(false); // Below min
      expect(validateFormatB('210012345A')).toBe(false); // Above max
    });
  });

  describe('validateFormatC', () => {
    test('validates correct Format C UEN', () => {
      expect(validateFormatC('T09LL0001B')).toBe(true);
      expect(validateFormatC('S21AB1234C')).toBe(true);
      expect(validateFormatC('R20CD5678D')).toBe(true);
    });

    test('rejects incorrect Format C UEN', () => {
      expect(validateFormatC('X09LL0001B')).toBe(false); // Invalid entity type
      expect(validateFormatC('T9LL0001B')).toBe(false); // Invalid year format
      expect(validateFormatC('T09L0001B')).toBe(false); // Missing character
      expect(validateFormatC('T09LL001B')).toBe(false); // Too short
    });

    test('validates entity type indicators', () => {
      const validTypes = ['T', 'S', 'R', 'M', 'N', 'C', 'F', 'G', 'D', 'P', 'L'];
      validTypes.forEach(type => {
        expect(validateFormatC(`${type}09LL0001B`)).toBe(true);
      });
    });
  });

  describe('validateUEN', () => {
    test('validates Format A UEN', () => {
      const result = validateUEN('12345678A');
      expect(result.isValid).toBe(true);
      expect(result.format).toBe('A');
      expect(result.formatDescription).toBe('Businesses registered with ACRA');
    });

    test('validates Format B UEN', () => {
      const result = validateUEN('200912345A');
      expect(result.isValid).toBe(true);
      expect(result.format).toBe('B');
      expect(result.formatDescription).toBe('Local companies registered with ACRA');
    });

    test('validates Format C UEN', () => {
      const result = validateUEN('T09LL0001B');
      expect(result.isValid).toBe(true);
      expect(result.format).toBe('C');
      expect(result.formatDescription).toBe('All other entities with new UEN');
    });

    test('rejects invalid UEN', () => {
      const result = validateUEN('invalid');
      expect(result.isValid).toBe(false);
      expect(result.format).toBe(null);
      expect(result.error).toContain('does not match any valid format');
    });

    test('handles empty input', () => {
      const result = validateUEN('');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('cannot be empty');
    });

    test('handles null input', () => {
      const result = validateUEN(null);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('UEN is required');
    });

    test('normalizes input case', () => {
      const result = validateUEN('12345678a');
      expect(result.isValid).toBe(true);
      expect(result.uen).toBe('12345678A');
    });

    test('trims whitespace', () => {
      const result = validateUEN('  12345678A  ');
      expect(result.isValid).toBe(true);
      expect(result.uen).toBe('12345678A');
    });
  });

  describe('getEntityType', () => {
    test('returns correct entity type for known codes', () => {
      expect(getEntityType('LP')).toBe('Limited Partnership');
      expect(getEntityType('LL')).toBe('Limited Liability Partnership');
      expect(getEntityType('RF')).toBe('Representative Office');
    });

    test('returns null for unknown codes', () => {
      expect(getEntityType('XX')).toBe(null);
      expect(getEntityType('YY')).toBe(null);
    });

    test('handles edge cases', () => {
      expect(getEntityType('')).toBe(null);
      expect(getEntityType(null)).toBe(null);
      expect(getEntityType(undefined)).toBe(null);
    });
  });

  describe('getFormatExamples', () => {
    test('returns format examples', () => {
      const examples = getFormatExamples();
      expect(examples).toHaveProperty('formatA');
      expect(examples).toHaveProperty('formatB');
      expect(examples).toHaveProperty('formatC');
      
      expect(examples.formatA.examples).toContain('12345678A');
      expect(examples.formatB.examples).toContain('200912345A');
      expect(examples.formatC.examples).toContain('T09LL0001B');
    });
  });
});