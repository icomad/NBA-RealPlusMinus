const express = require('express');

const app = express();

app.use(express.static('public'));

app.use('/dataset', require('./scraperRoute'));

app.listen(8000, console.log('Server started...'));