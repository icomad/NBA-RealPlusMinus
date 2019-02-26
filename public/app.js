const checkCachedData = async () => {
  if (localStorage.getItem('dataset')) {
    const localDataset = JSON.parse(localStorage.getItem('dataset'));
    if (new Date(localDataset[0].timeLimit) < new Date()) {
      localStorage.removeItem('dataset')
      return await fetchData();
    } else {
      localDataset.shift();
      return localDataset;
    }
  } else return await fetchData();
}

const fetchData = async () => {
  try {
    const apiURL = 'http://nba-rpm.icomad.me:8000/dataset';
    const dataset = await axios.get(apiURL);
    const timeLimit = new Date();
    timeLimit.setHours(timeLimit.getHours() + 4);
    dataset.data.unshift({ timeLimit });
    localStorage.setItem('dataset', JSON.stringify(dataset.data));
    dataset.data.shift();
    return dataset.data;
  } catch (error) {
    console.log(error);
  }
}

const render = (dataset, spinner) => {
  d3.select('svg').remove();
  d3.selectAll('.details').remove();
  if (spinner) spinner.stop();
  d3.select('.title').text('NBA Real Plus-Minus 2018/2019');

  const w = window.innerWidth;
  const h = window.innerHeight;
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

  const tip = d3.tip()
    .attr('class', 'd3-tip')
    .html(d => `
    <div class='details'><img src='./nba_logo/${d['team']}.svg' class='small-img'><span>${d['name']}</span></div>
    <div><span class='bold'>MPG:</span> ${d['mpg']}</div>
    <div><span class='bold'>ORPM:</span> ${d['orpm']}</div>
    <div><span class='bold'>DRPM:</span> ${d['drpm']}</div>
    <div><span class='bold'>TRPM:</span> ${(parseFloat(d['orpm']) + parseFloat(d['drpm'])).toFixed(2)}</div>
    `)
    .direction(d => parseFloat(d['orpm']) > 0 ? 'w' : 'e')
    .offset(d => parseFloat(d['orpm']) > 0 ? [0, -10] : [0, 10])

  const svg = d3.select("#visualization")
    .append("svg")
    .attr('width', w)
    .attr('height', h)
    .attr('class', 'grad')
    .call(tip)

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
    .attr("xlink:href", d => `./nba_logo/${d['team']}.svg`)
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
    .on("mouseover", tip.show)
    .on("mouseout", tip.hide)

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
  d3.select('.x-axis g:nth-child(6) line').attr('opacity', 1);
  d3.select('.y-axis g:nth-child(6) line').attr('opacity', 1);
}

async function main() {
  const opts = {
    lines: 15, // The number of lines to draw
    length: 25, // The length of each line
    width: 1, // The line thickness
    radius: 30, // The radius of the inner circle
    color: ['#ff7979', '#f6e58d', '#badc58', '#20bf6b'], // #rgb or #rrggbb or array of colors
    speed: 1.9, // Rounds per second
    trail: 60, // Afterglow percentage
    className: 'spinner', // The CSS class to assign to the spinner
  };

  const target = document.getElementById('loading');
  const spinner = new Spinner(opts).spin(target);
  const dataset = await checkCachedData();
  render(dataset, spinner);
  window.addEventListener("resize", () => render(dataset, null));
}

main();
