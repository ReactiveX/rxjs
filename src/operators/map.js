var Observable = require("src/Observable");
var Subscriber = require("src/Subscriber");

var MapSubscriber = Subscriber.template(
    function _init(project) {
        this.project = project;
    },
    function _next(x) {
        return this.destination.next(this.project(x));
    }
);

var MapObservable = Observable.template(MapSubscriber);

module.exports = function(project) {
    return new MapObservable(this, project);
};
