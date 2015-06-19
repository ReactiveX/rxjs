import Observable from '../Observable';

const NEVER = new Observable((observer) => {});

export default function never() {
	return NEVER; // NEVER!!!!
}