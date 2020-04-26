import '@feathersjs/transport-commons';
import { HookContext } from '@feathersjs/feathers';
import { Application } from './declarations';

export default function(app: Application) {
  if(typeof app.channel !== 'function') {
    // If no real-time functionality has been configured just return
    return;
  }

  app.on('connection', (connection: any) => {
    // On a new real-time connection, add it to the anonymous channel
    app.channel('everyone').join(connection);
  });

  // eslint-disable-next-line no-unused-vars
  app.publish((data: any, hook: HookContext) => {
    return app.channel('everyone');
  });


  // Here you can also add service specific event publishers
  // e.g. the publish the `users` service `created` event to the `admins` channel
  // app.service('users').publish('created', () => app.channel('admins'));
  
  // With the userid and email organization from above you can easily select involved users
  // app.service('messages').publish(() => {
  //   return [
  //     app.channel(`userIds/${data.createdBy}`),
  //     app.channel(`emails/${data.recipientEmail}`)
  //   ];
  // });
};
