import { Params} from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { LogReader } from '../../logio/logreader';

interface Data { text: string }


export class Tail {
  app: Application;
  logReader: LogReader;

  constructor(
    app: Application,
    logReader: LogReader) {
    this.app = app;
    this.logReader = logReader;
  }


  async find(params?: Params): Promise<Data[]> {
    return this.logReader.getTailAsArray();
  }


  async create(data: Data, params?: Params): Promise<Data> {
    return data;
  }

  setup(app: Application, path: string) {
    this.logReader.setLogObserver();
  }

}
