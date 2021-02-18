//! CONSTS
const WIDTH = window.screen.availWidth * .85
const HEIGHT = window.screen.availHeight * .85
const PADDING = 60;
const EDUCATION_DATA =
  'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json';
const COUNTY_DATA =
  'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json';

//! SVG
const svg = d3.select('.chart-container')
  .append('svg')
  .attr('width', WIDTH)
  .attr('height', HEIGHT);

const path = d3.geoPath();
  

//! DATA SCALE

// Load external data and boot
d3.queue()
  .defer(d3.json, COUNTY_DATA)
  .defer(d3.json, EDUCATION_DATA)
  .await(ready);

function ready(error, usa, data) {
  if(error) throw new Error(error)
  const bachelor =  data.map((d, i) => d.bachelorsOrHigher)

  //! CONSTS
  const max = d3.max(bachelor)
  const min = d3.min(bachelor) 

  console.log(usa, data)
  // !COLOR SCALE
  const colors = d3.scaleThreshold()
    .domain(d3.range(min, max, (max - min)/8))
    .range(d3.schemeBlues[9]);

  // const colorScale = d3.scaleLinear()
  //   .domain(colors.range())
  //   .range(bachelor);
console.log(data, usa)
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
    .attr('data-fips', (d) => d)
    // set the color of each country
    .attr("fill", (countie, i) => {
      return colors(bachelor[i])
    });

  svg.append('path')
    .datum(topojson.mesh(usa, usa.objects.states, (a, b) => a!== b))
    .attr('class', 'states')
    .attr('d', path);
}