const router = require('express').Router();
const cheerio = require('cheerio');
const axios = require('axios');

const url = 'http://www.espn.com/nba/statistics/rpm/_/page/';
const row = '.tablehead tr:not(:first-child)';
const rank = 'td:nth-child(1)';
const name = 'td:nth-child(2) a';
const team = 'td:nth-child(3)';
const mpg = 'td:nth-child(5)';
const orpm = 'td:nth-child(6)';
const drpm = 'td:nth-child(7)';

const lookupTable = {
  'ATL': {
    color: '(225,68,52,1)',
    logo: 'ATL'
  },
  'BOS': {
    color: '(0,122,51,1)',
    logo: 'BOS'
  },
  'BKN': {
    color: '(0,0,0,1)',
    logo: 'BKN'
  },
  'CHA': {
    color: '(0,120,140,1)',
    logo: 'CHA'
  },
  'CHI': {
    color: '(206,17,65,1)',
    logo: 'CHI'
  },
  'CLE': {
    color: '(111,38,61,1)',
    logo: 'CLE'
  },
  'DAL': {
    color: '(0,83,188,1)',
    logo: 'DAL'
  },
  'DEN': {
    color: '(13,34,64,1)',
    logo: 'DEN'
  },
  'DET': {
    color: '(190,16,46,1)',
    logo: 'DET'
  },
  'GS': {
    color: '(253,185,39,1)',
    logo: 'GSW'
  },
  'GS/': {
    color: '(253,185,39,1)',
    logo: 'GSW'
  },
  'HOU': {
    color: '(190,17,65,1)',
    logo: 'HOU'
  },
  'IND': {
    color: '(253,187,48,1)',
    logo: 'IND'
  },
  'LAC': {
    color: '(200,16,46,1)',
    logo: 'LAC'
  },
  'LAL': {
    color: '(85,37,130,1)',
    logo: 'LAL'
  },
  'MEM': {
    color: '(93,118,169,1)',
    logo: 'MEM'
  },
  'MIA': {
    color: '(152,0,46,1)',
    logo: 'MIA'
  },
  'MIL': {
    color: '(0,71,27,1)',
    logo: 'MIL'
  },
  'MIN': {
    color: '(12,35,64,1)',
    logo: 'MIN'
  },
  'NO': {
    color: '(0,22,65,1)',
    logo: 'NOP'
  },
  'NO/': {
    color: '(0,22,65,1)',
    logo: 'NOP'
  },
  'NY': {
    color: '(245,132,38,1)',
    logo: 'NYK'
  },
  'NY/': {
    color: '(245,132,38,1)',
    logo: 'NYK'
  },
  'OKC': {
    color: '(0,125,195,1)',
    logo: 'OKC'
  },
  'ORL': {
    color: '(0,125,197,1)',
    logo: 'ORL'
  },
  'PHI': {
    color: '(196,206,211,1)',
    logo: 'PHI'
  },
  'PHX': {
    color: '(29,17,96,1)',
    logo: 'PHX'
  },
  'POR': {
    color: '(224,58,62,1)',
    logo: 'POR'
  },
  'SAC': {
    color: '(91,43,130,1)',
    logo: 'SAC'
  },
  'SA': {
    color: '(138,141,143,1)',
    logo: 'SAS'
  },
  'SA/': {
    color: '(138,141,143,1)',
    logo: 'SAS'
  },
  'TOR': {
    color: '(186,12,47,1)',
    logo: 'TOR'
  },
  'UTA': {
    color: '(0,43,92,1)',
    logo: 'UTA'
  },
  'WSH': {
    color: '(227,24,55,1)',
    logo: 'WAS'
  },
};

const getDataset = async () => {
  let dataset = [];
  for (let page = 1; page < 14; page++) {
    const html = await axios.get(url + page);
    const $ = cheerio.load(html.data);
    $(row).each((index, element) => {
      const pos = parseInt($(element).find(rank).text()) - 1;
      const teamName = $(element).find(team).text().slice(0, 3);
      const data = {
        name: $(element).find(name).text(),
        mpg: $(element).find(mpg).text(),
        orpm: $(element).find(orpm).text(),
        drpm: $(element).find(drpm).text(),
        color: lookupTable[teamName].color,
        team: lookupTable[teamName].logo,
      }
      dataset[pos] = data;
    });
  }
  return dataset;
};

router.get('/', async (req, res) => {
  try {
    const dataset = await getDataset();
    res.json(dataset);
  } catch (error) {
    console.log(error);
  }
})

module.exports = router;