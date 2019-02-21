const express = require('express');

const app = express();

//app.use(express.static('public'));

app.use('/dataset', require('./scraperRoute'));

const PORT = process.env.PORT || 8000;
app.listen(PORT, console.log(`Server started on port ${PORT}...`));