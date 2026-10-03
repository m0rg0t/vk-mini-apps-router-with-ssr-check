import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fillParamsIntoPath, getParamKeys } from '../src/utils/pathParams.ts';

test('inserts replacement tokens literally', () => {
  for (const value of ['$&', '$`', "$'", '$$', '$1', 'Привет мир', 'a/b']) {
    assert.equal(fillParamsIntoPath('/user/:id', { id: value }), `/user/${value}`);
  }
});

test('fills repeated parameters without replacing text inside earlier values', () => {
  assert.equal(fillParamsIntoPath('/:id/:id', { id: ':id' }), '/:id/:id');
  assert.equal(fillParamsIntoPath('/:id/:id', { id: '$&' }), '/$&/$&');
  assert.equal(fillParamsIntoPath('/:id/:id2', { id: ':id2', id2: 'next' }), '/:id2/next');
});

test('retains missing and empty parameter validation', () => {
  for (const params of [{}, { id: undefined }, { id: '' }]) {
    assert.throws(() => fillParamsIntoPath('/user/:id', params), /Missing parameter id/);
  }
  assert.equal(fillParamsIntoPath('/static', {}), '/static');
  assert.deepEqual(getParamKeys(undefined), []);
  assert.deepEqual(getParamKeys('/user/:id/:tab'), [':id', ':tab']);
});

