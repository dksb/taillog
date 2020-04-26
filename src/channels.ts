import '@feathersjs/transport-commons';
import { HookContext } from '@feathersjs/feathers';
import { Application } from './declarations';

export default function(app: Application) {
  if(typeof app.channel !== 'function') {
    // If no real-time functionality has been configured just return
    return;
  }

  // When a new connection is created, add them to 'everyone' channel
  app.on('connection', (connection: any) => {
    // On a new real-time connection, add it to the anonymous channel
    app.channel('everyone').join(connection);
  });

  // Global event publisher, publishes all events to 'everyone' channel
  app.publish((data: any, hook: HookContext) => {
    return app.channel('everyone');
  });

};
