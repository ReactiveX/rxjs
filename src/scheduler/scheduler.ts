
import Task from './task';

interface Scheduler {
	schedule(delay:Number, state:any, work:Function) : Task
	now(state:any, work:Function) : Task
}

export default Scheduler;