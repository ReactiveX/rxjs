const isArray = Array.isArray || (x => x && typeof x.length === 'number');

export default isArray;