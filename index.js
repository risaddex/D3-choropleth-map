//! CONSTS
const WIDTH = window.screen.availWidth * .85
const HEIGHT = window.screen.availHeight * .85
const PADDING = 60;
const EDUCATION_DATA = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json';
const COUNTY_DATA = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json';

//! SVG
const svg = d3.select('.chart-container')
  .append('svg')
  .attr('width', WIDTH)
  .attr('height', HEIGHT);

const path = d3.geoPath();
let edu, county, filt;
//! DATA SCALE

// Load external data and boot
d3.queue()
  .defer(d3.json, COUNTY_DATA)
  .defer(d3.json, EDUCATION_DATA)
  .await(ready);

function ready(error, usa, data) {
  if(error) throw new Error(error)
  const bachelor = data.map((d, i) => d.bachelorsOrHigher);

  edu = data
  county = topojson.feature(usa, usa.objects.counties).features
  
  //! CONSTS
  const max = d3.max(bachelor)
  const min = d3.min(bachelor) 

  // !COLOR SCALE
  const colors = d3.scaleThreshold()
    .domain(d3.range(min, max, (max - min)/8))
    .range(d3.schemeBlues[9]);
  // filt = colors
  // const colorScale = d3.scaleLinear()
  //   .domain(colors.range())
  //   .range(bachelor);

  // Draw the map
  svg.append("g")
    .attr('class', "counties")
    .selectAll("path")
    .data(topojson.feature(usa, usa.objects.counties).features)
    .enter()
    .append("path")
    // draw each state  
    .attr('class', 'county')
    .attr("d", d3.geoPath())
    .attr('data-fips', (d) => d.id)
    .attr('data-education', (d) => {
      let result = edu.filter((obj) => obj.fips === d.id)

      return result[0] ? result[0].bachelorsOrHigher : 0;
    })
    // set the color of each country
    .attr("fill", (county, i) => {
      let result = data.filter((obj) => obj.fips === county.id);

      return result[0] ? colors(result[0].bachelorsOrHigher) : colors(0) //handle undefined
    });

  svg.append('path')
    .datum(topojson.mesh(usa, usa.objects.states, (a, b) => a!== b))
    .attr('class', 'states')
    .attr('d', path);
}