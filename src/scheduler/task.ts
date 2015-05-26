import Scheduler from './scheduler';

export default class Task {
	constructor(public delay:number, public state:any, public work:Function, public scheduler:Scheduler) {
		
	}
}