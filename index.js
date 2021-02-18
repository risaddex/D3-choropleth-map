//! CONSTS
const WIDTH = window.screen.availWidth * .85
const HEIGHT = window.screen.availHeight * .85
const PADDING = 60;
const EDUCATION_DATA = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json';
const COUNTY_DATA = 'https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json';

const BAR_SIZE = WIDTH /3;
//! SVG
const svg = d3.select('.chart-container')
  .append('svg')
  .attr('width', WIDTH)
  .attr('height', HEIGHT);

const path = d3.geoPath();

//! TOOLTIP
const tooltip = d3.select('.chart-container')
  .append('div')
  .attr('id', 'tooltip')
  .style('opacity', 0);

const buildWithData = (error, usa, data) => {
  if(error) throw new Error(error)
  const bachelor = data.map((d, i) => d.bachelorsOrHigher);

  const edu = data
  const county = topojson.feature(usa, usa.objects.counties).features
  
  //! CONSTS
  const max = d3.max(bachelor)
  const min = d3.min(bachelor) 

  // !COLOR SCALE
  const colors = d3.scaleThreshold()
    .domain(d3.range(min, max, (max - min)/8))
    .range(d3.schemeBlues[9]);

  // Draw the map
  const map = svg.append("g")
    .attr('class', "counties")
    .selectAll("path")
    .data(topojson.feature(usa, usa.objects.counties).features)
    .enter()
    .append("path")
    // draw each state  
    .attr('class', 'county')
    .attr("d", d3.geoPath())
    // add required custom props
    .attr('data-fips', (d) => d.id)
    .attr('data-education', (d) => {
      let result = edu.filter((obj) => obj.fips === d.id)

      return result[0] ? result[0].bachelorsOrHigher : 0;
    })
    // set the color of each country
    .attr("fill", (county, i) => {
      let result = data.filter((obj) => obj.fips === county.id);
      return result[0] ? colors(result[0].bachelorsOrHigher) : colors(0) //handle undefined
    })
    .on('mouseover', (d) => {
      tooltip
        .transition()
        .duration(200)
        .style('opacity', .9)
        .attr('data-education', () => {
          let result = edu.filter((obj) => obj.fips === d.id)

          return result[0] ? result[0].bachelorsOrHigher : 0;
        });
      tooltip
        .html( () => {
          let result = edu.filter((obj, i) => obj.fips === d.id)
          return result[0]
            ? `${result[0]['area_name']}, ${result[0]['state']}: ${result[0].bachelorsOrHigher}%`
            : 0;
          })  
        .style('left', `${d3.event.screenX - PADDING}px`)
        .style('top', `${d3.event.clientY - PADDING * 2}px`)
    })
    .on('mouseout', () => {
      tooltip
        .transition()
        .duration(200)
        .style('opacity', 0)
    });

  svg.append('path')
    .datum(topojson.mesh(usa, usa.objects.states, (a, b) => a!== b))
    .attr('class', 'states')
    .attr('d', path);
  
  const legendScale = d3.scaleLinear().domain([min, max]).range([BAR_SIZE * 2, BAR_SIZE * 3]);
  
  const legendX = d3.axisBottom()
    .scale(legendScale)
    .ticks(9)
    .tickSize(20, 0)
    .tickFormat(x => `${Math.floor(x)}%`);

  const legend = svg
    .append('g')
    .attr('id', 'legend')
    .call(legendX);

  legend.selectAll('rect')
    .data(colors.domain())
    .enter()
    .append('rect')
    .attr('height', 15)
    .attr('width', BAR_SIZE / 8)
    .attr('fill', (d,i) => colors(d))
    .attr('x', d => legendScale(d) - BAR_SIZE - PADDING)
    .attr('transform', `translate(${BAR_SIZE + PADDING}, ${PADDING -20})`)

}

// Load external data and boot
d3.queue()
  .defer(d3.json, COUNTY_DATA)
  .defer(d3.json, EDUCATION_DATA)
  .await(buildWithData);