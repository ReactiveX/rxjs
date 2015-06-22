(function(root, factory){
		root.RxNext = factory();
}(window || global || this, function(){
	return require('../dist/cjs/RxNext');	
}));