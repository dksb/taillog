import { Application } from '../declarations';
import tail from './tail/tail.service';
// Don't remove this comment. It's needed to format import lines nicely.

export default function(app: Application) {
    app.configure(tail);
}
