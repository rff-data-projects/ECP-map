/*  */
/*  */
/*  Setup */
/*  */
/*  */

/*  */
/* SVG */
/*  */

var width = 674;
    height = 283;

// Responsive SVG, see https://stackoverflow.com/questions/16265123/resize-svg-when-window-is-resized-in-d3-js 
const svg = d3.select('#vis')
            .style("position", "relative")
            .append("div")
            .attr("class", 'svg-container')
            .style("padding-bottom", (height/width)*100 + "%") /* Make bottom padding match aspect ratio */
            .append('svg')
            // Responsive SVG needs these 2 attributes and no width and height attr.
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0 0 " + width + " " + height)
            // Class to make it responsive.
            .classed("svg-content-responsive", true)
            /* .style("transform-origin", "50% 50% 0"); */ // To prevent stroke width from scaling
 
const path = d3.geoPath() 

// Zoom
var zoom_level = 1
let zoom = d3.zoom()
.scaleExtent([1, 8]) // 
.translateExtent([[0, 0], [width, height]])
.extent([[0, 0], [width, height]])
/* Together, .translateExtent and .extent reset zoom to central as user de-zooms and avoid runaway zooms */
/* downside: limits recentering on edge landmasses like America or Oceania, even after zoom */
.duration(300)
.on("zoom", function(){
  svg
    .selectAll('path') 
    .filter(function() {
      if(d3.select(this).attr("class") === null){
        return true
      } else {
        return !d3.select(this).attr("class").includes("no-zoom")
      }
    })
    .attr('transform', d3.event.transform);

    zoom_level = d3.event.transform.k

    /* Pan cursors */
    if(zoom_level > 1){
      d3.select("#vis").style("cursor", "move"); 
    } else {
      d3.select("#vis").style("cursor", "default"); 
    }
});

svg.call(zoom)
  .on("wheel.zoom", null)

// Color schemes
let col_scheme = ["#FFFFFF", "#C3E1F9", "#B3C7E8", "#A4ADD8", "#9492C7", "#8578B7", "#755EA6"]

const colorScale = d3.scaleThreshold()
.domain([0.00001,1,5,10,15,20])
.range(col_scheme);

const legend_colorScale = d3.scaleThreshold()
.domain([0,0.5,5,10,15,20])
.range(col_scheme);

//Legend
const custom_legend_helper = function({
  i,
  genLength,
  generatedLabels,
  labelDelimiter
}) {
  if (i === 0) {
    return generatedLabels[i].split(' ')[2]
  } else if (i === genLength - 1) {
    return ' '
  }
    return generatedLabels[i].split(' ')[2]
}

var legend = d3.legendColor()
    .titleWidth(240)
    .shapeWidth(30)
    .shapeHeight(15)
    .shapePadding(0)
    .labelOffset(5)
    .labelAlign("end")
    .labelFormat(d3.format(".00f"))
    .labels(custom_legend_helper)
    .orient('horizontal')
    .scale(legend_colorScale);

/*  */
/* Configure and format Tooltip */
/*  */

let tip = d3.tip()
      .attr('class', 'd3-tip')
      .style('background-color', 'white')
      .style("border-color", "#C3E1F9")
      .html(function(d) { 
        
        if(region === "world"){
          var head_name = d.properties.name
         } else if (region === "canada"){
          var head_name = d.properties.name
         } else if (region === "china"){
           if(d.properties.NAME_1 == "Tibet Autonomous Region"){
            var head_name = "Tibet Aut. Reg."
           } else if (d.properties.NAME_1 == "Xinjiang Uyghur Autonomous Region"){
            var head_name = "Xinjiang Uyghur Aut. Reg."
           } else if (d.properties.NAME_1 == "Inner Mongolia Autonomous Region"){
            var head_name = "Inner Mongolia Aut. Reg."
           } else if (d.properties.NAME_1 == "Guangxi Zhuang Autonomous Region"){
            var head_name = "Guangxi Zhuang Aut. Reg."
           } else {
            var head_name = d.properties.NAME_1
           }
         } else if (region === "us"){
           var head_name = d.properties.NAME
         };
        
        if(d.total.length > 0){

        if($("#selector :selected").val() === "tax"){
          var price = d.total[0]["ecp_tax"]
          var cov = d.total[0]["cov_tax"]
          if(price > 0){
            var policy = "Carbon Tax"
          } else {
            var policy = "No Tax"
          }
          
        } else if (($("#selector :selected").val() === "ets")) { 
          var price = d.total[0]["ecp_ets"]
          var cov = d.total[0]["cov_ets"]
          if(price > 0){
            var policy = "Cap and Trade"
          } else {
            var policy = "No Cap and Trade"
          }
        } else {
          var price = d.total[0]["ecp_all"]
          var cov = d.total[0]["cov_all"]

          if(d.total[0]["ecp_tax"] > 0 && d.total[0]["ecp_ets"]){
            var policy = "Tax + Cap and Trade"
          } else if (d.total[0]["ecp_tax"] > 0) {
            var policy = "Tax"
          } else if (d.total[0]["ecp_ets"] > 0) {
            var policy = "Cap and Trade"
          } else {
            var policy = "None"
          }

          
        }
        
        let width_c2 = '70px; text-align: center;">';
        s_year = $("#myRange").val()

                                        return "<div class = 'tool_head'>" +
                                                head_name +
                                               "</div>"+
                                              '<div class="grid-container"> \
                                        <div class="grid-item"> Emission-Weighted Carbon Price (2019$)</div>\
                                        <div class="grid-item" style = "max-width:' + width_c2 + '$' + Number(price).toFixed(2) +  '</div>\
                                        <div class="grid-item"> Share of CO₂ Emissions</div>\
                                        <div class="grid-item" style = "max-width:' + width_c2 + Number(cov*100).toFixed(2) + '%'+ '</div>\
                                        <div class="grid-item"> Pricing Instrument</div>\
                                        <div class="grid-item" style = "max-width:' + width_c2 + policy +'</div>\
                                        <div class="grid-last-item"> Year </div>\
                                        <div class="grid-last-item" style = "max-width:' + width_c2 + s_year + '</div>\
                                        </div>'
                                      } else {
                                        return ("<div class = 'tool_head'>" +
                                        head_name +
                                        "</div>"+
                                      '<div class="grid-container-no_data">' +
                                      '<div class="grid-item-no_data"> No data</div>')
                                      }
                    });
                    
svg.call(tip)

/*  */
/* Projections  */
/*  */

const world_projection = d3.geoRobinson()
                          .scale(105)
                          .translate([610 / 2, 335 / 2]);

const canada_projection = d3.geoConicEqualArea()
                            .center([30, 44.5])
                            .rotate([95, 0, 0]) 
                            .scale(435)                    

const china_projection = d3.geoAzimuthalEquidistant()
                              .rotate([-125, 0, 0]) 
                              .center([0, 22])
                              .scale(450)

const us_projection = d3.geoAlbersUsa()
                        .scale(610)
                        .translate([340,138])

/*  */
/* Data import */
/*  */

d3.queue()
.defer(d3.json, "./data/custom.geo-50m.json")
.defer(d3.json, "./data/canada.geojson")
.defer(d3.json, "./data/gadm36_CHN_1_upnames.json")
.defer(d3.json, "./data/gz_2010_us_040_00_20m.json")
.defer(d3.csv, "./data/processed_data.csv")
.await(ready);


/*  */
/*  */
/* Draw map 
Arguments of d3.queue passed to "ready" function as 'topo' and 'priced_data' */
/*  */
/*  */

function ready(error, topo_world, topo_canada, topo_china, topo_us, price_data) {

/*  */
/* Selectors */
/*  */

s_year = $("#myRange").val()
region = $("#region_selector").val()

if(region === "world"){
  var topo = topo_world
  var projo = world_projection
} else if (region === "canada"){
  var topo = topo_canada
  var projo = canada_projection
} else if (region === "china"){
  var topo = topo_china
  var projo = china_projection
} else if (region === "us"){
  var topo = topo_us
  var projo = us_projection
}

if($("#selector :selected").val() === "tax"){
  var price = "ecp_tax"
} else if (($("#selector :selected").val() === "ets")) { 
  var price = "ecp_ets"
} else {
  var price = "ecp_all"
}

/*  */
/* Map (initialize) */
/*  */

var map = svg.append("g")
  .attr("class", "region")
  .selectAll("path")
  .data(topo.features.filter(function(d) {return d.id !== "ATA"; }))
  .enter()
  .append("path")
  .attr("class", "country")
  .attr("d", d3.geoPath().projection(projo))
  .style("stroke", "#C3E1F9")
  .style("stroke-width", "1px") 
  .attr("fill", function(d) {
    if(region === "world"){
      d.total = price_data.filter(function(e){return e.alpha_3 === d.properties["iso_a3"] && e.year === s_year});
    } else if (region === "canada"){
      d.total = price_data.filter(function(e){return e.region === d.properties["name"] && e.year === s_year});
    } else if (region === "china"){
      d.total = price_data.filter(function(e){
        return (d.properties["NAME_1"] === e.region && e.year === s_year)
              })
    } else if (region === "us"){
      d.total = price_data.filter(function(e){return e.region === d.properties["NAME"] && e.year === s_year});
    };
  if(d.total.length > 0){
    return colorScale(d.total[0][price]);
  } else {
    return ("#f2f2f2")
  }
      });


/*  */
/* Tooltip (initialize) */
/*  */

d3.selectAll(".country")
  .on('mouseover', function(d){

                        let wind_hei = $(window).height();
                        let pgX = d3.event.pageX;
                        let pgY = d3.event.pageY;

                        let extreme_left = pgX/$(window).width()<0.15;
                        let extreme_right = pgX/$(window).width()>0.85;

                        if(wind_hei > 600){
                            if(pgY/wind_hei < 0.70){
                                tip.show(d)
                                .style("left", (pgX - 80 + extreme_left * 50 - extreme_right * 50) + "px")
                                .style("top", (pgY + 60) + "px");
                            } else {
                                tip.show(d)
                                .style("left", (pgX - 80 + extreme_left * 50 - extreme_right * 50) + "px")
                                .style("top", (pgY - 200) + "px");
                            }
                        } else {
                            if(pgY/wind_hei < 0.53){
                              tip.show(d)
                              .style("left", (pgX - 40 + extreme_left * 60 - extreme_right * 60) + "px")
                              .style("top", (pgY + 20) + "px");
                          } else {
                              tip.show(d)
                              .style("left", (pgX - 40 + extreme_left * 60 - extreme_right * 60) + "px")
                              .style("top", (pgY - 180) + "px");
                          }
                        }

                        d3.select(this)
                              .raise()
                              .style("stroke", "black")
                        })
    .on('mouseout', function(d){
      tip.hide(d);
      d3.select(this)
        .style("stroke", "#C3E1F9")
    });

  /*  */
  /* Play button slider */
  /*  */

  // Initialize position
  let slider = $("#myRange")  
        let s_val = slider.val();
        let percent = (s_val - s_min) / (s_max - s_min);

  $("#slider_tool")
  .text(s_val)
  .css({'padding-left': percent*65 + 22 + "%", 'font-size': '13px'})

  // Interaction
  var myTimer;
  var playing = false;
  d3.select("#play_button").on("click", function() {

      if (!playing){
        clearInterval (myTimer);
      myTimer = setInterval (function() {
      var b= d3.select("#myRange");
        var t = (+b.property("value") + 1) % (+b.property("max") + 1);
        if (t == 0) { t = +b.property("min"); }
        b.property("value", t);
        update_color()
        
        let slider = $("#myRange")  
        let s_val = slider.val();
        let percent = (s_val - s_min) / (s_max - s_min);

        $("#slider_tool")
        .text(s_val)
        .css({'padding-left': percent*65 + 22 + "%"})

      }, 500);

      playing = true;
      $("#play-symbol").text('pause')

      } else {
        clearInterval (myTimer);
        playing = false;
        $("#play-symbol").text('play_arrow')
      }
      
  });

/*  */
/* Zoom buttons */
/*  */

function rounded_rect(x, y, w, h, r, tl, tr, bl, br) {
    var retval;
    retval  = "M" + (x + r) + "," + y;
    retval += "h" + (w - 2*r);
    if (tr) { retval += "a" + r + "," + r + " 0 0 1 " + r + "," + r; }
    else { retval += "h" + r; retval += "v" + r; }
    retval += "v" + (h - 2*r);
    if (br) { retval += "a" + r + "," + r + " 0 0 1 " + -r + "," + r; }
    else { retval += "v" + r; retval += "h" + -r; }
    retval += "h" + (2*r - w);
    if (bl) { retval += "a" + r + "," + r + " 0 0 1 " + -r + "," + -r; }
    else { retval += "h" + -r; retval += "v" + -r; }
    retval += "v" + (2*r - h);
    if (tl) { retval += "a" + r + "," + r + " 0 0 1 " + r + "," + -r; }
    else { retval += "v" + -r; retval += "h" + r; }
    retval += "z";
    return retval;
};

let zoom_svg = d3.select("#vis")
                 .append('div')
                 .style("position", "absolute")
                 .style('right', '3%')
                 .style('top', '3%')
                 .append("svg")
                 .attr("width", 35)
                 .attr('height', 67)

/* Surrounding rounded rectangle container with middle line */
zoom_svg
  .append("rect")
  .classed("zoom-frame", "true")
  .attr("width", "32")
  .attr("height", "64")
  .attr("x", 0)
  .attr("y", 0)
  .attr("rx", 6)
  .style("fill", "white")
  .style('stroke', '#C3E1F9')
  .style('stroke-width', '1px')
  .style("shape-rendering", "crisp-edges")
  .attr("transform", "translate(1,1)")
  .style('pointer-events', 'none');

zoom_svg
  .append('line')
  .classed("zoom-line", true)
  .attr('x1', "1")
  .attr('x2', "33")
  .attr('y1', "32")
  .attr('y2', "32")
  .style('stroke', '#C3E1F9')
  .style('pointer-events', 'none');

/* Zoom-out/minus-sign */
zoom_svg
  .append("rect")
  .classed("zoom-minus-sign", true)
  .attr("width", "12")
  .attr("height", "3")
  .attr("x", 11)
  .attr("y", 47)
  .attr("rx", 2)
  .style('pointer-events', 'none')

zoom_svg
  .append("path")
  .attr("d", rounded_rect(1.5, 32, 31, 32.5, 5.5, false, false, true, true))
  .style('fill', 'none')
  .style('stroke', 'none')
  .style('pointer-events', 'all')
  .attr('cursor', 'pointer')
  .on('click', function(d, i) {
    zoom.scaleBy(svg.transition().duration(250), 0.7);
  })
  .on('dblclick', function(d, i) {
    event.stopPropagation(); // prevents dbl-clicking on circle to trigger zoom
    zoom.scaleBy(svg.transition().duration(200), 0.5);
  })
  .on("mouseover", function(d){
    d3.select(this)
      .style("fill", "#f2f2f2")
      .style("cursor", "pointer")
      .style("stroke", "none");
      d3.select(".zoom-minus-sign").raise();
      d3.select(".zoom-line").raise();
  })
  .on("mouseout", function(d){
    d3.select(this)
      .style("fill", "none")
      .style("stroke", "none");
  })

/* Zoom-in/plus-sign */
zoom_svg
  .append("rect")
  .classed("zoom-plus-sign", true)
  .attr("width", "12")
  .attr("height", "3")
  .attr("x", 11)
  .attr("y", 16)
  .attr("rx", 2)
  .style('pointer-events', 'none');

  zoom_svg
  .append("rect")
  .classed("zoom-plus-sign", true)
  .attr("width", "3")
  .attr("height", "12")
  .attr("x", 15.5)
  .attr("y", 11.5)
  .attr("rx", 2)
  .style('pointer-events', 'none');

zoom_svg
  .append("path")
  .attr("d", rounded_rect(1.5, 1.5, 31, 31, 5.5, true, true, false, false))
  .style('fill', 'none')
  .style('stroke', 'none')
  .style('pointer-events', 'all')
  .attr('cursor', 'pointer')
  .on('click', function(d, i) {
        zoom.scaleBy(svg.transition().duration(250), 1.3);
      })
      .on('dblclick', function(d, i) {
        event.stopPropagation(); // prevents dbl-clicking on circle to trigger zoom
        zoom.scaleBy(svg.transition().duration(200), 1.6);
      })
  .on("mouseover", function(d){
    d3.select(this)
    .style("fill", "#f2f2f2")
    .style("cursor", "pointer");
    d3.selectAll(".zoom-plus-sign").raise();
    d3.select(".zoom-line").raise();
  })
  .on("mouseout", function(d){
    d3.select(this).style("fill", "none");
  })

/*  */
/* Legend */
/*  */

d3.select("#legend")
.append("svg")
.style("height", "50px")
.style("width", "230px")
.append("g")
.call(legend) 
.attr("transform", "translate(0,20)");

d3.select("g.cell:nth-child(1) > text:nth-child(2)") /* Further adjust labels below cell separators */
    .attr("transform", "translate(34,28)");
d3.select("g.cell:nth-child(2) > text:nth-child(2)") /* Further adjust labels below cell separators */
    .attr("transform", "translate(32,28)");
d3.select("g.cell:nth-child(3) > text:nth-child(2)") /* Further adjust labels below cell separators */
    .attr("transform", "translate(34,28)");
d3.select("g.cell:nth-child(4) > text:nth-child(2)") /* Further adjust labels below cell separators */
    .attr("transform", "translate(36,28)");
d3.select("g.cell:nth-child(5) > text:nth-child(2)") /* Further adjust labels below cell separators */
    .attr("transform", "translate(36,28)");
d3.select("g.cell:nth-child(6) > text:nth-child(2)") /* Further adjust labels below cell separators */
    .attr("transform", "translate(37,28)");

/*  */
/* Updates */
/*  */

$('#region_selector')
  .select2({ minimumResultsForSearch: Infinity // hides searchbar 
  })
  .on("change", update_region);

function update_region(){

  d3.select('#vis').selectAll("g").remove();

/* Data/map update */
  region = $("#region_selector").val()  
  if(region === "world"){
    var topo = topo_world
    var projo = world_projection
  } else if (region === "canada"){
    var topo = topo_canada
    var projo = canada_projection
  } else if (region === "china"){
    var topo = topo_china
    var projo = china_projection
  } else if (region === "us"){
    var topo = topo_us
    var projo = us_projection
  }

  if($("#selector :selected").val() === "tax"){
    var price = "ecp_tax"
  } else if (($("#selector :selected").val() === "ets")) { 
    var price = "ecp_ets"
  } else {
    var price = "ecp_all"
  }

  /* Zoom reset */
  zoom_level = 1;
  zoom.scaleBy(svg, 0.01);

  var map = svg.append("g")
    .attr("class", "region")
    .selectAll("path")
    .data(topo.features.filter (function(d) { return d.id !== "ATA"; }))
    .enter()
    .append("path")
    .attr("class", "country")
    .attr("d", d3.geoPath().projection(projo))
    .style("stroke", "#C3E1F9")
    .style("stroke-width", "1px") 
    .attr("fill", function(d) {
      if(region === "world"){
        d.total = price_data.filter(function(e){return e.alpha_3 === d.properties["iso_a3"] && e.year === s_year});
      } else if (region === "canada"){
        d.total = price_data.filter(function(e){return e.region === d.properties["name"] && e.year === s_year});
      } else if (region === "china"){
        d.total = price_data.filter(function(e){
          return (d.properties["NAME_1"] === e.region && e.year === s_year)
                })
      } else if (region === "us"){
        d.total = price_data.filter(function(e){return e.region === d.properties["NAME"] && e.year === s_year});
      };
    if(d.total.length > 0){
      return colorScale(d.total[0][price]);
    } else {
      return ("#f2f2f2")
    }
        })

  /* Re-initialize Tooltip */
  d3.selectAll(".country")
  .on('mouseover', function(d){

                        let wind_hei = $(window).height();
                        let pgX = d3.event.pageX;
                        let pgY = d3.event.pageY;

                        let extreme_left = pgX/$(window).width()<0.15;
                        let extreme_right = pgX/$(window).width()>0.85;

                        if(wind_hei > 600){
                          if(pgY/wind_hei < 0.70){
                              tip.show(d)
                              .style("left", (pgX - 80 + extreme_left * 50 - extreme_right * 50) + "px")
                              .style("top", (pgY + 60) + "px");
                          } else {
                              tip.show(d)
                              .style("left", (pgX - 80 + extreme_left * 50 - extreme_right * 50) + "px")
                              .style("top", (pgY - 200) + "px");
                          }
                      } else {
                          if(pgY/wind_hei < 0.53){
                              tip.show(d)
                              .style("left", (pgX - 40 + extreme_left * 60 - extreme_right * 60) + "px")
                              .style("top", (pgY + 20) + "px");
                          } else {
                              tip.show(d)
                              .style("left", (pgX - 40 + extreme_left * 60 - extreme_right * 60) + "px")
                              .style("top", (pgY - 180) + "px");
                          }
                      }

                        d3.select(this)
                          .raise()
                          .style("stroke", "black");
                        })
    .on('mouseout', function(d){
      tip.hide(d);
      d3.select(this)
        .style("stroke", "#C3E1F9");
    });

  }

$('#selector')
  .select2({ minimumResultsForSearch: Infinity // hides searchbar
  })
  .on("change", update_color);
d3.select("#myRange").on("change", update_color);

  function update_color(){

    if($("#selector :selected").val() === "tax"){
      var price = "ecp_tax"
    } else if (($("#selector :selected").val() === "ets")) { 
      var price = "ecp_ets"
    } else {
      var price = "ecp_all"
    }

    s_year = $("#myRange").val()

    d3.select('#vis')
      .selectAll("path")
      .attr("fill", function(d) {
        if (typeof d !== "undefined"){
          if(region === "world"){
            d.total = price_data.filter(function(e){return e.alpha_3 === d.properties["iso_a3"] && e.year === s_year});
          } else if (region === "canada"){
            d.total = price_data.filter(function(e){return e.region === d.properties["name"] && e.year === s_year});
          } else if (region === "china"){
            d.total = price_data.filter(function(e){
              return (d.properties["NAME_1"] === e.region && e.year === s_year)
                    })
          } else if (region === "us"){
            d.total = price_data.filter(function(e){return e.region === d.properties["NAME"] && e.year === s_year});
          };
          if(d.total.length > 0){
            return colorScale(d.total[0][price]);
          } else {
            return ("#f2f2f2")
          }
        }  
      })
  };


}