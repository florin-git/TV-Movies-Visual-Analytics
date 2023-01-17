// var margin = { top: 5, right : 0, bottom :  0, left :  1}

// var width = 750 - margin.left - margin.right
// // var width = d3.select("#area_2").innerWidth;
// var height = 380  - margin.bottom


// var div= d3.select("#area_2")
// console.log(div.style("width"))

// // append the svg object to the body of the page
// var svg = d3.select("#area_2")
// .append("svg")
// .attr("preserveAspectRatio", "xMinYMin meet")
//     .attr("width", width + margin.left + margin.right)
//     // .attr("width", width)
//     .attr("height", height + margin.top + margin.bottom + 30)
//   .append("g")
//     .attr("transform",
//           "translate(" + margin.left + "," + margin.top + ")");

// //Read the data
// d3.csv("./dataset/Kaggle/df_final_with_additional_info.csv", function(data) {

//     var x = d3.scaleLinear()
//     // .domain([0,300]) 
//     .domain([40, d3.max(data, function (d) {
//       return Math.max(d.duration);
//     })])  
//     .range([0, width-150]);    

//     // Draw the axis
//     svg
//     .append("g")
//     .attr("transform", "translate(20," + (height+0) + ")")
//         .style("text-anchor", "end")
//         .style("font-size", 10)
//         .style("fill", "#00000")
//         .call(d3.axisBottom(x))


//     // Add Y axis
//     var y = d3.scaleLinear()
//         .domain([1,30])
//         .range([ height, 0]);

//     var y_axis = d3.axisLeft().scale(y).ticks(30); 

//     svg.append("g")
//     .attr("transform", "translate(20,0)")

//         .call(y_axis);


//       var radiusNumberMovies = d3
//         .scaleLinear()
//         .domain(
//           d3.extent(data, function (d) {
//             return Math.max(d.rating);
//           })
//         )
//         .range([1, 10]);

//     var myColor = d3.scaleOrdinal()
//         .domain(["mattina", "pomeriggio", "sera", "notte"])
//         .range(d3.schemeSet2);

//         var tooltip = d3.select("body")
//           .append("div")
//           .attr("id", "tooltip2")
//           .style("background-color", "rgb(0, 0, 0)")
//           .style("position", "absolute")
//           .style("z-index", "10")
//           .style("visibility", "hidden")
//           .style("font-size", "20px")
//           .style("color", "white")
//           .text("a simple tooltip");

//     svg.append('g')
//         .selectAll("circle")
//         .data(data).enter()
//         .append("circle")
//         .attr("class", "bubble")
//         // .filter(function(d) { return d.month == "gennaio" & d.channel == "Italia 1" })
//         .attr("cx", function (d) { return x(d.duration); } )
//         .attr("cy", function (d) { return y(d.day_number); } )
//         .attr("r",function (d) { return radiusNumberMovies(d.rating) })
//         .style("fill", function (d) { return myColor(d.daytime); } )
//         .style("opacity", "0.7")
//         .attr("stroke", "black")
//         .on("mouseover", function(d) {
//           tooltip.html(d.title +" Rating: " +  d.rating);
//           return tooltip.style("visibility", "visible");
//         })
//         .on("mousemove", function() {
//           return tooltip.style("top",
//           (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
//         })
//         .on("mouseout", function() {
//           return tooltip.style("visibility", "hidden");
        
//         })        ;

    
//         svg.data(data)
//         .append("text").attr("class","text_legend_month").attr("x", width - 0.18 * width).attr("y", 30).text(function(d) { 
//           return "Month : "
//         }).style("font-size", "15px").attr("alignment-baseline","middle")

//         svg.data(data)
//       .append("text").attr("class","text_legend_channel").attr("x", width - 0.18 * width).attr("y", 10).text(function(d) { 
//         return "Channel: "
//       }).style("font-size", "15px").attr("alignment-baseline","middle")



//       // svg
//       //     .append("text")
//       //     .attr("class", "legendTitle")
//       //     .attr("x", width - 0.18 * width)
//       //     .attr("y", 50)
//       //     .text("Sharing Percentage");
  


      
//     // Handmade legend
//     svg.append("circle").attr("cx",width - 0.15 * width).attr("cy",130).attr("r", 6).style("fill", d3.schemeSet2[0])
//     svg.append("circle").attr("cx",width - 0.15 * width).attr("cy",160).attr("r", 6).style("fill", d3.schemeSet2[1])
//     svg.append("circle").attr("cx",width - 0.15 * width).attr("cy",190).attr("r", 6).style("fill", d3.schemeSet2[2])
//     svg.append("circle").attr("cx",width - 0.15 * width).attr("cy",220).attr("r", 6).style("fill", d3.schemeSet2[3])
//     svg.append("text").attr("x", width - 0.14 * width).attr("y", 130).text("mattina ").style("font-size", "15px").attr("alignment-baseline","middle")
//     svg.append("text").attr("x", width - 0.14 * width).attr("y", 160).text("pomeriggio").style("font-size", "15px").attr("alignment-baseline","middle")
//     svg.append("text").attr("x", width - 0.14 * width).attr("y", 190).text("sera").style("font-size", "15px").attr("alignment-baseline","middle")
//     svg.append("text").attr("x", width - 0.14 * width).attr("y", 220).text("notte").style("font-size", "15px").attr("alignment-baseline","middle")
    






//     })


var margin = { top: 5, right : 0, bottom :  0, left :  30}

var width = 1000 - margin.left - margin.right
// var width = d3.select("#area_2").innerWidth;
var height = 380  - margin.bottom


var div= d3.select("#area_2")
console.log(div.style("width"))

// append the svg object to the body of the page
var svg = d3.select("#area_2")
.append("svg")
.attr("preserveAspectRatio", "xMinYMin meet")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom + 30)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

//Read the data
d3.csv("./dataset/Kaggle/df_final_with_additional_info.csv", function(data) {

    var y = d3.scaleLinear()
    .domain([40, d3.max(data, function (d) {
      return Math.max(d.duration);
    })])  
    .range([height,0]); 
    
    
    // Add x axis
    var x = d3.scaleLinear()
        .domain([1,31])
        .range([0,width-120]); 

    // Draw the axis
    svg
    .append("g")
    .attr("transform", "translate(0," + (height+0) + ")")
        .style("text-anchor", "end")
        .style("font-size", 10)
        .style("fill", "#00000")
        .call(d3.axisBottom(x).scale(x).ticks(31))


    

    var y_axis = d3.axisLeft(y); 

    svg.append("g")
    .attr("transform", "translate(0,0)").call(y_axis);


      var radiusNumberMovies = d3
        .scaleLinear()
        .domain(
          d3.extent(data, function (d) {
            return Math.max(d.rating);
          })
        )
        .range([1, 10]);

    var myColor = d3.scaleOrdinal()
        .domain(["mattina", "pomeriggio", "sera", "notte"])
        .range(d3.schemeSet2);

        var tooltip = d3.select("body")
          .append("div")
          .attr("id", "tooltip2")
          .style("background-color", "rgb(0, 0, 0)")
          .style("position", "absolute")
          .style("z-index", "10")
          .style("visibility", "hidden")
          .style("font-size", "20px")
          .style("color", "white")
          .text("a simple tooltip");

    svg.append('g')
        .selectAll("circle")
        .data(data).enter()
        .append("circle")
        .attr("class", "bubble")
        // .filter(function(d) { return d.month == "gennaio" & d.channel == "Italia 1" })
        .attr("cx", function (d) { return x(d.day_number)+0; } )
        .attr("cy", function (d) { return y(d.duration); } )
        .attr("r",function (d) { return radiusNumberMovies(d.rating) })
        .style("fill", function (d) { return myColor(d.daytime); } )
        .style("opacity", "0.7")
        .attr("stroke", "black")
        .on("mouseover", function(d) {
          tooltip.html(d.title +" Rating: " +  d.rating);
          return tooltip.style("visibility", "visible");
        })
        .on("mousemove", function() {
          return tooltip.style("top",
          (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
        })
        .on("mouseout", function() {
          return tooltip.style("visibility", "hidden");
        
        })        ;

    
        svg.data(data)
        .append("text").attr("class","text_legend_month").attr("x", width - 0.18 * width).attr("y", 30).text(function(d) { 
          return "Month : "
        }).style("font-size", "15px").attr("alignment-baseline","middle")

        svg.data(data)
      .append("text").attr("class","text_legend_channel").attr("x", width - 0.18 * width).attr("y", 10).text(function(d) { 
        return "Channel: "
      }).style("font-size", "15px").attr("alignment-baseline","middle")



      // svg
      //     .append("text")
      //     .attr("class", "legendTitle")
      //     .attr("x", width - 0.18 * width)
      //     .attr("y", 50)
      //     .text("Sharing Percentage");
  


      
    // Handmade legend
    svg.append("circle").attr("cx",width - 0.09 * width).attr("cy",130).attr("r", 6).style("fill", d3.schemeSet2[0])
    svg.append("circle").attr("cx",width - 0.09 * width).attr("cy",160).attr("r", 6).style("fill", d3.schemeSet2[1])
    svg.append("circle").attr("cx",width - 0.09 * width).attr("cy",190).attr("r", 6).style("fill", d3.schemeSet2[2])
    svg.append("circle").attr("cx",width - 0.09 * width).attr("cy",220).attr("r", 6).style("fill", d3.schemeSet2[3])
    svg.append("text").attr("x", width - 0.08 * width).attr("y", 130).text("mattina ").style("font-size", "15px").attr("alignment-baseline","middle")
    svg.append("text").attr("x", width - 0.08 * width).attr("y", 160).text("pomeriggio").style("font-size", "15px").attr("alignment-baseline","middle")
    svg.append("text").attr("x", width - 0.08 * width).attr("y", 190).text("sera").style("font-size", "15px").attr("alignment-baseline","middle")
    svg.append("text").attr("x", width - 0.08 * width).attr("y", 220).text("notte").style("font-size", "15px").attr("alignment-baseline","middle")
    0
0





    })

    