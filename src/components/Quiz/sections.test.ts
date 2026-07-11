import {describe, it, expect} from 'vitest';
import {sectionFromContextKey, sectionLabel, orderedSections} from './sections';

describe('sectionFromContextKey', () => {
  it('derives the section key from a require.context key', () => {
    expect(sectionFromContextKey('./manual-qa.json')).toBe('manual-qa');
    expect(sectionFromContextKey('./automation-qa.json')).toBe('automation-qa');
  });
});

describe('sectionLabel', () => {
  it('maps known sections to human labels', () => {
    expect(sectionLabel('manual-qa')).toBe('Manual QA — теория');
    expect(sectionLabel('sql')).toBe('Лайвкодинг SQL');
  });
  it('falls back to the key for unknown sections', () => {
    expect(sectionLabel('unknown-x')).toBe('unknown-x');
  });
});

describe('orderedSections', () => {
  it('returns known sections in canonical order regardless of input order', () => {
    expect(orderedSections(['hr', 'manual-qa', 'automation-qa', 'sql']))
      .toEqual(['manual-qa', 'automation-qa', 'sql', 'hr']);
  });
  it('appends unknown sections after known ones, alphabetically', () => {
    expect(orderedSections(['zeta', 'manual-qa', 'alpha']))
      .toEqual(['manual-qa', 'alpha', 'zeta']);
  });
});
