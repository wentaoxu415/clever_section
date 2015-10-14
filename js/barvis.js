
/*----------------------- BEGIN BARVIS OBJECT ------------------------------*/ 
BarVis = function(_parentElement, data){
  this.parentElement = _parentElement;
  this.originalData = data;
  this.displayData = []
  this.statsData = []
  this.currentTab = 'Section';
  this.initVis();
}
/*----------------------- END BARVIS OBJECT --------------------------------*/ 

/*----------------------- BEGIN DATA METHODS -------------------------------*/ 

// Purpose: Creates a dataset corresponding to the selected tab 
// Argument: None
// Returns: None
BarVis.prototype.getDisplayData = function(){
  var that = this;
  var data_dict, format, temp, key, data, val;
  data_dict = {};
  format = d3.format('.2f')
  temp = []

  this.originalData.data.forEach(function(d, i){
    data = d.data;
    switch(that.currentTab){
      case 'Section':
        key = data.id
        break;
      case 'School':
        key = data.school
        break;
      case 'Subject':
        key = data.subject
        break;
      case 'Grade':
        key = data.grade
        break;
    }
    val = data.students.length
    that.statsData.push(val);
    if (key in data_dict){
      data_dict[key].push(val);
    }
    else{
      data_dict[key] = []
      data_dict[key].push(val);
    }
  });

  for (key in data_dict){
    temp.push({key: key, value: parseFloat(format(d3.mean(data_dict[key])))})
  }

  this.displayData = temp.sort(function(a, b){
    return d3.descending(a.value, b.value);
  });

  this.statsData = this.statsData.sort(function(a, b){
    return d3.ascending(a.value, b.value);
  });
}

// Purpose: Calculate section data's statistics
// Argument: None
// Returns: Section data's statistics in the table
BarVis.prototype.getStats = function(){
  var that = this;
  var avg, min, percent_25, percent_50, percent_75, max, format, quantile;
  
  format = d3.format('.2f');
  avg = format(d3.mean(this.statsData));
  min = format(d3.min(this.statsData));
  max = format(d3.max(this.statsData));
  quantile = d3.scale.linear()
    .domain([0, 100])
    .range([min, max])
  percent_25 = format(quantile(25))
  percent_50 = format(quantile(50))
  percent_75 = format(quantile(75))
  
  // Display statistics on the table
  d3.select('#average').text(avg);
  d3.select('#min').text(min);
  d3.select('#percent_25').text(percent_25);
  d3.select('#percent_50').text(percent_50);
  d3.select('#percent_75').text(percent_75);
  d3.select('#max').text(max);
}

/*----------------------- END DATA METHODS ---------------------------------*/ 

/*----------------------- BEGIN EVENT HANDLER ------------------------------*/ 
// Purpose: Handles the tab change and calls updateVis()
// Argument: Currently selected tab id 
// Returns: Calls updateVis()
BarVis.prototype.onTabChange = function(tab_id){
  this.currentTab = tab_id;
  this.updateVis();
}
/*----------------------- END EVENT HANDLER --------------------------------*/ 

/*----------------------- BEGIN UPDATE METHODD -----------------------------*/ 
// Purpose: Updates the bar chart with new data when different tab is clicked
// Argument: None
// Returns: Updated bar chart
BarVis.prototype.updateVis = function(){
  var that = this;
  
  this.getDisplayData();
  
  this.svg.selectAll('.bar')
    .remove();

  this.tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d){
      var label_key = that.currentTab + ': '
      return '<strong>' + label_key + '</strong><span>' + d.key + '</span><br>'
      + '<strong> Average: </strong><span>'+ d.value + '</span>'
    })

  this.svg.call(this.tip);

  this.color.domain(this.displayData.map(function(d){return d.key}))
  this.x.domain(this.displayData.map(function(d){return d.key}));
  this.y.domain([0, d3.max(this.displayData, function(d){return d.value})+10]);

  this.svg.select('.x.axis')
    .transition()
    .duration(500)
    .call(this.xAxis)

  this.svg.select('.y.axis')
    .transition()
    .duration(500)
    .call(this.yAxis)

  this.bar = this.svg.selectAll('.bar')
    .data(this.displayData)
    .enter().append('rect')
    .attr('class', 'bar')
    .attr('x', function(d){return that.x(d.key)})
    .attr('width', that.x.rangeBand())
    .attr('y', function(d){return that.y(d.value)})
    .attr('height', function(d){return that.height-that.y(d.value)})
    .on('mouseover', this.tip.show)
    .on('mouseout', this.tip.hide)
    .style('fill', function(d){return that.color(d.key)})
}
/*----------------------- END UPDATE METHODD -------------------------------*/ 

/*----------------------- BEGIN INIT METHODD -------------------------------*/ 
// Purpose: Initialize the bar chart when called for the first time
// Argument: None
// Returns: First completed bar chart and its framework
BarVis.prototype.initVis = function(){
  var that = this;
  this.margin = {top: 10, right: 0, bottom: 30, left: 50}
  
  this.width = parseInt(d3.select("#charts").style("width")) 
    - this.margin.left - this.margin.right;

  this.height = parseInt(d3.select("#charts").style("height")) 
    - this.margin.top - this.margin.bottom;

  this.x = d3.scale.ordinal()
      .rangeRoundBands([0, this.width], 0.1)

  this.y = d3.scale.linear()
      .rangeRound([this.height, 0]);

  this.xAxis = d3.svg.axis()
    .scale(this.x)
    .orient('bottom')
    .tickFormat("")

  this.yAxis = d3.svg.axis()
    .scale(this.y)
    .orient('left')
    
  this.color = d3.scale.category20c();

  this.svg = d3.select('#charts')
    .append('div')
    .classed('svg-container', true)
    .append('svg')
    .attr('preserveAspectRatio', 'xMinYMin meet')
    .attr("viewBox", "0 0 " + (this.width + this.margin.left + 
      this.margin.right) + " " + (this.height + this.margin.top + 
      this.margin.bottom))
    .classed("svg-content-responsive", true)
    .append('g')
    .attr("transform", "translate(" + this.margin.left + "," + 
      this.margin.top + ")")

  this.svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + this.height + ')')

  this.svg.append('g')
    .attr('class', 'y axis')
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 0 - this.margin.left)
    .attr('x', 0 - (this.height/2))
    .attr('dy', '.71em')
    .style('text-anchor', 'middle')
    .text('Class Size')
  
  this.updateVis();
  this.getStats();
  
}
/*----------------------- END INIT METHODD ---------------------------------*/ 


