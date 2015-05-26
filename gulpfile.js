var gulp = require('gulp');

gulp.task('build.cjs', [], function(){ 
	return Promise.resolve('wat');
});

gulp.task('build.amd', [], function(){ 
	return Promise.resolve('wat');
});

gulp.task('build.global', [], function(){ 
	return Promise.resolve('wat');
});

gulp.task('build.all', ['build.global', 'build.amd', 'build.cjs'], function(){
	return Promise.resolve('wat');
});