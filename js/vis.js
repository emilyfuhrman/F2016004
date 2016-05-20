var init = function(){

	return {

		//CODES
		//C: City Ownership
		//M: Mixed City & Private Ownership
		//O: Other – Public Authority, State or Federal Ownership
		//P: Private Ownership
		//X: Mixed

		w:window.innerWidth,
		h:window.innerHeight,

		data:null,
		data_comp:{},
		data_shells:{},

		padding:{
			'l':200,
			'r':30,
			'b':90,
			't':450
		},

		getData:function(_callback){
			var self = vis;

			d3.csv('data/buildings.csv',function(e,d){
				if(!e){ 
					self.data = d;
					_callback();
				}
			});
		},
		processData:function(){
			var self = vis;

			self.data.forEach(function(d){
				if(!self.data_comp[d.Block]){
					self.data_comp[d.Block] = [];
				}
				self.data_comp[d.Block].push(d);
			});

			var temp_range = d3.range(300),
				temp_shells = d3.entries(self.data_comp);

			for(var i=0; i<temp_range.length; i++){
				var cutoff = Math.ceil(d3.keys(self.data_comp).length/temp_range.length);
				for(j=0; j<cutoff; j++){
					var ct = i+j,
						ct_str = '_' +ct;
					if(!self.data_shells[ct_str]){
						self.data_shells[ct_str] = [];
					}
					if(temp_shells[ct]){
						temp_shells[ct].value.forEach(function(_d){
							self.data_shells[ct_str].push(_d);
						});
					}
				}
			}
			self.draw();
		},
		generate:function(){
			var self = vis;
			self.getData(self.processData);
		},
		draw:function(){
			var self = vis;

			self.svg = d3.select('svg#vis');

			var data_shells = d3.entries(self.data_shells);
				data_shells_max = d3.max(data_shells,function(d){ return d.value.length });
			/*data_shells.sort(function(a,b){
				return b.length -a.length
			});*/

			data_shells.forEach(function(d,i){
				var len = d.value.length,
					idx = i;
				d.value.rand = 0;
				d.value.forEach(function(_d){
					_d.parentLength = len;
					_d.parentRand = 0;
					_d.idx = idx;
				});
			});

			var scale_h = d3.scale.linear()
					.domain([0,data_shells.length])
					.range([self.padding.l,(self.w -self.padding.r)]),
				scale_v = d3.scale.linear()
					.domain([0,data_shells_max])
					.range([self.padding.t,(self.h -self.padding.b)]),
				scale_vt = d3.scale.linear()
					.domain([0,data_shells_max])
					.range([self.padding.t/2,self.padding.b/3]);

			//define all shape variables
			var linesG,
				lines;

			var dots_lower,
				dots_lower_w = 2,
				dots_lower_h = 2,

				dots_higherG,
				dots_higher,
				dots_higher_w = 1,
				dots_higher_h = 8,
				dots_higher_spacing = 0.5
				;

			//plot lines first
			linesG = self.svg.selectAll('g.linesG')
				.data(data_shells);
			linesG.enter().append('g')
				.classed('linesG',true);
			linesG
				.attr('class',function(d){
					return d.key +' linesG';
				});
			linesG
				.on('mouseover',function(d){
					d3.selectAll('.focus').classed('focus',false);
					d3.selectAll('.' +d.key).classed('focus',true);
				})
				.on('mouseout',function(d){
					d3.selectAll('.focus').classed('focus',false);
				})
			linesG.exit().remove();
			lines = linesG.selectAll('line.connectors')
				.data(function(d){ return d.value; });
			lines.enter().append('line')
				.classed('connectors',true);
			lines
				.attr('class',function(d){
					return d.Borough +' connectors';
				})
				.attr('x1',function(d){
					return scale_h(d.idx) -dots_lower_w/2 +dots_lower_w/2;
				})
				.attr('y1',function(d){
					return scale_v(d.parentLength);
				})
				.attr('x2',function(d,i){
					var dim = dots_higher_w+dots_higher_spacing,
						pos = i*dim,
						offset = (d.parentLength*dim)/2;
					return scale_h(d.idx) +pos -offset;
				})
				.attr('y2',function(d){
					return scale_vt(d.parentLength) +d.parentRand;
				});
			lines.exit().remove();

			//plot buildings; cluster by number of buildings that are owned by the same owner
			dots_higherG = self.svg.selectAll('g.dots_higherG')
				.data(data_shells);
			dots_higherG.enter().append('g')
				.classed('dots_higherG',true);
			dots_higherG
				.attr('class',function(d){
					return d.key +' dots_higherG';
				})
				.attr('transform',function(d,i){
					var x = scale_h(i),
						y = 0;
					return 'translate(' +x +',' +y +')';
				});
			dots_higherG.exit().remove();
			dots_higher = dots_higherG.selectAll('rect.dots_higher')
				.data(function(d){ return d.value; });
			dots_higher.enter().append('rect')
				.classed('dots_higher',true);
			dots_higher
				.attr('x',function(d,i){
					var dim = dots_higher_w+dots_higher_spacing,
						pos = i*dim,
						offset = (d.parentLength*dim)/2;
					return pos -offset;
				})
				.attr('y',function(d){
					return scale_vt(d.parentLength) +d.parentRand;
				})
				.attr('width',dots_higher_w)
				.attr('height',dots_higher_h)
				;
			dots_higher.exit().remove();
			
			//plot shells by height (lower)
			dots_lower = self.svg.selectAll('rect.dots_lower')
				.data(data_shells);
			dots_lower.enter().append('rect')
				.classed('dots_lower',true);
			dots_lower
				.attr('class',function(d){
					return d.key +' dots_lower';
				})
				.attr('x',function(d,i){
					return scale_h(i) -dots_lower_w/2;
				})
				.attr('y',function(d){
					return scale_v(d.value.length);
				})
				.attr('width',dots_lower_w)
				.attr('height',dots_lower_h);
			dots_lower.exit().remove();
		}
	}
}

var vis = init();
vis.generate();