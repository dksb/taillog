import { strict as assert } from 'assert';
import app from '../../src/app';

describe('\'tail\' service', () => {
  it('registered the service', () => {
    const service = app.service('tail');
    assert.ok(service, 'Registered the service');
  });

  it('should return the log tail with 10 lines', () => {
    const service = app.service('tail');
    service.find().then( messages => {
    	assert.equal(messages.length, 10);
    })
  });

});
