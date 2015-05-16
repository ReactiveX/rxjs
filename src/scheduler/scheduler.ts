
import Task from './task';

interface Scheduler {
	schedule(delay:Number, state:any, work:Function)
	now(state:any, work:Function)
}

export default Scheduler;