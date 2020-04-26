import assert from 'assert';
import app from '../../src/app';

describe('\'tail\' service', () => {
  it('registered the service', () => {
    const service = app.service('tail');

    assert.ok(service, 'Registered the service');
  });
});
