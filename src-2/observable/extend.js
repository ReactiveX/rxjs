export default (transform) => {
    var len = transform.length - 1;
    return function(...args) {
        return this.lift((destination) => {
            return transform.apply(destination, (args[len] = destination) && args);
        });
    };
};