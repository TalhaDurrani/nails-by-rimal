import { test } from 'node:test';
import assert from 'node:assert/strict';
import { literalEmailPattern } from '../src/lib/email-pattern.ts';

test('literal email matching escapes SQL wildcard and escape characters', () => {
  assert.equal(literalEmailPattern('first_last%test@example.com'), 'first\\_last\\%test@example.com');
  assert.equal(literalEmailPattern('a\\b@example.com'), 'a\\\\b@example.com');
  assert.equal(literalEmailPattern('User+tag@example.com'), 'User+tag@example.com');
});
