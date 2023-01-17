
var margin={ top: 5, right: 2, bottom: 10, left: 60}
var width = 500 - margin.left - margin.right
var height = 320 - margin.top - margin.bottom

// append the svg object to the body of the page
var svg = d3.select("#area_1")
.append("svg")
  .attr("width", width + margin.left + margin.right + 400)
  .attr("height", height  + margin.top + margin.bottom)
.append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

//Read the data
d3.csv("../dataset/df_final_with_additional_info.csv", function(data) {

  var x = d3.scaleBand()
  .domain(['Cielo', 'Italia 1',"Iris", "Rete 4", "Cine34", "Sky Cinema Drama", "Sky Cinema Due", "Sky Cinema Comedy", "Sky Cinema Action"])     
  .range([0, 460]);        
  // Draw the axis
  svg
  .append("g")
  .attr("transform", "translate(0," + (height - 23 ) + ")")
  .call(d3.axisBottom(x))
  .selectAll("text")
      .attr("transform", "rotate(-10)")
      .style("text-anchor", "end")
      .style("font-size", 10)
      .style("fill", "#00000")

  // Add Y axis
  var y = d3.scaleBand()
      .domain(['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre'])
      .range([ height - 25 , 0]);

   var y_axis = d3.axisLeft().scale(y).ticks(11); 

  svg.append("g").attr("transform", "translate(0,0)")
    .call(y_axis);

  var z = d3.scaleLinear()
    .domain([0, 500])
    .range([ 0, 500]);

  // Add dots
  svg.append('g')
      .selectAll("circle")
      .data(data).enter()
      .append("circle")
      .filter(function(d) { return d.channel == "Cielo" || d.channel == "Italia 1" || d.channel == "Iris" || d.channel == "Rete 4" || d.channel == "Cine34" || d.channel == "Sky Cinema Drama" || d.channel == "Sky Cinema Due" || d.channel == "Sky Cinema Comedy" || d.channel == "Sky Cinema Action" })
      .attr("cx", function (d) { 
          return x(d.channel) + 29; } )
      .attr("cy", function (d) { return y(d.month) + 15; } )
      .attr("r",function (d) { 
        return z(d.number_movies/15.8); 
      })
      .style("fill", "#8dd3c7")
      .style("opacity", "0.7")
      .attr("stroke", "black")    

  })


