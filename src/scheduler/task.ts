import Scheduler from './scheduler';

export default class Task {
	constructor(public delay:Number, public state:any, public work:Function, public scheduler:Scheduler) {
		
	}
}