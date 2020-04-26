import { Params } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { LogReader } from '../../logio/logreader';

interface Data { text: string }

/*Featherjs service that clients connect to usign websockets*/
export class Tail {
  app: Application;
  logReader: LogReader;

  constructor(
    app: Application,
    logReader: LogReader) {
    this.app = app;
    this.logReader = logReader;
  }

  /* Returns all the tail lines, 10 or less*/
  async find(params?: Params): Promise<Data[]> {
    return this.logReader.getTailAsArray();
  }

  /* Used as a placehodler for clients to listen to new line events*/
  async create(data: Data, params?: Params): Promise<Data> {
    return data;
  }

  /* Setup method to initalize serviec, invoked when app.listen is invoked*/
  async setup(app: Application, path: string) {
    await this.logReader.preReadLogTail();
    this.logReader.setLogObserver((length: number, position: number) => {
      this.logReader.readFileChanges(length, position);
    });
  }

}
