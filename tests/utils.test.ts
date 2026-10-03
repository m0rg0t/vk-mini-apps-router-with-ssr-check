import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createSearchParams, getSearchParamsForLocation } from '../src/utils/createSearchParams';

test('query helpers preserve repeated values, Unicode and location precedence', () => {
  const defaults = createSearchParams({ sort: ['name', 'price'], q: 'кот & dog' });
  assert.deepEqual(defaults.getAll('sort'), ['name', 'price']);
  assert.equal(createSearchParams(defaults.toString()).get('q'), 'кот & dog');
  const merged = getSearchParamsForLocation('?sort=date', defaults);
  assert.deepEqual(merged.getAll('sort'), ['date']);
  assert.equal(merged.get('q'), 'кот & dog');
  assert.deepEqual(defaults.getAll('sort'), ['name', 'price']);
});
