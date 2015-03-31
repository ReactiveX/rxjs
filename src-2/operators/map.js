export default (project, dest) => {
    return dest.create((x) => {
        return dest.onNext(project(x));
    });
};