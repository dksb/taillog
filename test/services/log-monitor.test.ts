import assert from 'assert';
import app from '../../src/app';

describe('\'LogMonitor\' service', () => {
  it('registered the service', () => {
    const service = app.service('log-monitor');

    assert.ok(service, 'Registered the service');
  });
});
