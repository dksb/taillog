import assert from 'assert';
import app from '../../src/app';

describe('\'logio\' service', () => {
  it('registered the service', () => {
    const service = app.service('logio');

    assert.ok(service, 'Registered the service');
  });
});
