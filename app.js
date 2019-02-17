(
  async () => {
    const data = await axios.get('./dataset.json');
    const dataset = data.data;

    const w = 1400;
    const h = 780;
    const padding = 50;

    const xScale = d3.scaleLinear()
      .domain([d3.min(dataset, d => parseFloat(d['orpm'])) - 1, d3.max(dataset, d => parseFloat(d['orpm'])) + 1])
      .range([padding, w - padding]);

    const yScale = d3.scaleLinear()
      .domain([d3.min(dataset, d => parseFloat(d['drpm'])) - 1, d3.max(dataset, d => parseFloat(d['drpm'])) + 1])
      .range([h - padding, padding]);

    const rScale = d3.scaleLinear()
      .domain([d3.min(dataset, d => parseFloat(d['mpg'])), d3.max(dataset, d => parseFloat(d['mpg']))])
      .range([5, 20])

    const tooltip = d3.select("body")
      .append("div")
      .attr('class', 'details');

    const svg = d3.select("body")
      .append("svg")
      .attr('class', 'grad');

    const defs = svg.selectAll('defs')
      .data(dataset)
      .enter()

    defs.append('defs')
      .append('pattern')
      .attr("id", (d) => d['name'].replace(/["']|\s/g, ""))
      .attr("width", 1)
      .attr("height", 1)
      .attr('x', 0)
      .attr('y', 0)
      .append("svg:image")
      .attr("xlink:href", d => `./nba_logo/${d['team']}.png`)
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', d => rScale(parseFloat(d['mpg'])) * 2)
      .attr('height', d => rScale(parseFloat(d['mpg'])) * 2)


    defs
      .append('circle')
      .attr('fill', d => `url(#${d['name'].replace(/["']|\s/g, "")})`)
      .attr('stroke', 'rgba(0, 0, 0, 0.3)')
      .attr('stroke-width', 1)
      .attr('cx', d => xScale(parseFloat(d['orpm'])))
      .attr('cy', d => yScale(parseFloat(d['drpm'])))
      .attr('r', d => rScale(parseFloat(d['mpg'])))
      .attr('class', 'over')
      .on("mouseover", d => {
        tooltip.html(`
          <div>${d['name']}</div>
          <div>${d['team']}</div>
          <div><strong>MPG:</strong> ${d['mpg']}</div>
          <div><strong>ORPM:</strong> ${d['orpm']}</div>
          <div><strong>DRPM:</strong> ${d['drpm']}</div>
          <div><strong>TRPM:</strong> ${(parseFloat(d['orpm']) + parseFloat(d['drpm'])).toFixed(2)}</div>
          `)
          .style("visibility", "visible");
      })
      .on("mousemove", () => tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px"))
      .on("mouseout", () => tooltip.style("visibility", "hidden"))
      .append('title')
      .text(d => d['name'])

    /**
     * 
     * AXIS SETUP
     * 
     */
    const xAxis = d3.axisBottom(xScale).tickSize(-h);
    const yAxis = d3.axisLeft(yScale).tickSize(-w);

    svg.append('text')
      .attr("text-anchor", "middle")
      .attr('transform', `translate(${padding / 2}, ${h / 2})rotate(-90)`)
      .text('Defensive RPM')

    svg.append('text')
      .attr("text-anchor", "middle")
      .attr('transform', `translate(${w / 2}, ${h - (padding / 3)})`)
      .text('Offensive RPM')

    svg.append("g")
      .attr('class', 'x-axis')
      .attr("transform", `translate(0, ${h - padding})`)
      .call(xAxis)

    svg.append("g")
      .attr('class', 'y-axis')
      .attr("transform", `translate(${padding},0)`)
      .call(yAxis)

    d3.selectAll('.domain').remove();
    d3.selectAll('.tick line').attr('opacity', .2);
    d3.selectAll('.tick text').attr('font-size', 16);
    d3.select('.x-axis g:nth-child(5) line').attr('opacity', 1);
    d3.select('.y-axis g:nth-child(6) line').attr('opacity', 1);
  }
)()

