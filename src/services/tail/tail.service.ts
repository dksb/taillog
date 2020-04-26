// Initializes the `tail` service on path `/tail`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Tail } from './tail.class';
import { LogReader } from '../../logio/logreader';
import path = require('path');

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'tail': Tail & ServiceAddons<any>;
  }
}

export default function (app: Application) {
  const options = {
    paginate: app.get('paginate'),
    events: ['logEvent']
  };

  var logFile = path.join(__dirname, "../../logs/log.txt");
  var logReader = new LogReader(app, logFile);
  // Initialize our service with any options it requires
  app.use('/tail', new Tail(app, logReader));

  // Get our initialized service so that we can register hooks
  const service = app.service('tail');

}
