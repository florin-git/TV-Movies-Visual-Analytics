var margin_top= 5, 
margin_right= 2, 
margin_bottom= 1, 
margin_left= 2

var width = 500 
var height = 400




var sky = ['Sky Cinema Drama', 'Sky Cinema Due',  'Sky Cinema Suspense', 'Sky Cinema Comedy', 'Sky Cinema Action'];
var mediaset = ['Italia 1', 'Iris', 'Rete 4', 'Cine34'];

d3.csv("./dataset/mds_with_titles.csv", function (data) {

  //tooltip and zoom
  var tooltip = d3.select("body")
   .append("div")
   .attr("id", "tooltip1")
   .style("background-color", "#636363")
   .style("color", "white")
   .style("position", "absolute")
   .style("z-index", "10")
   .style("visibility", "hidden")
   .style("font-size", "20px")
   .text("");
  ///


  var svg = d3.select("#area_6")
  .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .classed("svg-content", true)

    // "d[0] 57 e min -39  per d[1] min è -57 e max + 36+


  var x = d3.scaleLinear()
  .domain([-50, 40])  
  .range([0, width]);

  var y = d3.scaleLinear().domain([-58, 38])
  .range([ height, 0 ]);

  var xAxis = svg.append("g")
    .attr("class", "axis-x")
    .attr("transform", "translate(10," + height + ")")
    .call(d3.axisBottom(x).tickValues([]))
    .attr("font-size", "6px")
    
  var yAxis = svg.append("g")
    .attr("class", "axis axis--y lightfill")
    .attr("transform", "translate(10," + 0 + ")")
    .call(d3.axisLeft(y).tickValues([]))
    .attr("font-size", "6px")
  
  // Add circles
  svg
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "bubble")
    .attr("cx", function (d) { 
      return x(d.mds_x) } )
    .attr("cy", function (d) { 
      return y(d.mds_y) } )
    .attr("r", 2)
    .style("stroke", "black")
    .style("stroke-width", "0.2") 
    .style("opacity", 0.8)
    .style("pointer-events", "all")
    .style("cursor", "pointer")
    .style("fill", function(d){
      if(sky.includes(d.channel)){
        return "#7fc97f"
      }
      else if(mediaset.includes(d.channel)) {
        return "#beaed4"
      }
      else{
        return "#fdc086"
      }
    })
    .on("mouseover", function(d) {
      tooltip.html(d.title);
      return tooltip.style("visibility", "visible");
    })
    .on("mousemove", function() {
      return tooltip.style("top",
      (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
    })
    .on("mouseout", function() {
      return tooltip.style("visibility", "hidden");
    
    })

    





      //legend


    svg.append("circle").attr("cx",width - 0.05 * width).attr("cy",80).attr("r", 6).style("fill", "#7fc97f")
    svg.append("circle").attr("cx",width - 0.05 * width).attr("cy",110).attr("r", 6).style("fill","#beaed4")
    svg.append("circle").attr("cx",width - 0.05 * width).attr("cy",140).attr("r", 6).style("fill","#fdc086")
    svg.append("text").attr("x", width - 0.03 * width).attr("y", 80).text("Sky ").style("font-size", "15px").attr("alignment-baseline","middle")
    svg.append("text").attr("x", width - 0.03 * width).attr("y", 110).text("Mediaset").style("font-size", "15px").attr("alignment-baseline","middle")
    svg.append("text").attr("x", width - 0.03 * width).attr("y", 140).text("Cielo").style("font-size", "15px").attr("alignment-baseline","middle")


})
