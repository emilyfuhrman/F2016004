window.onload = function(){

	return {

		data:null,

		getData:function(_callback){
			d3.csv('data/buildings.csv',function(e,d){
				if(!e){ 
					self.data = d; 
					_callback();
				}
			});
		},
		generate:function(){
			var self = this;
			self.getData(self.draw);
		},
		draw:function(){
			var self = this;
			debugger;
		}
	}
}().generate();