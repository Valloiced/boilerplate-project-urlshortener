require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const dns = require('dns')
const urlParser = require('url');
const { url } = require('inspector');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html')
});

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
let schema = new mongoose.Schema({
  url: String,
  shortUrl: Number
})
let Urls = mongoose.model('Urls', schema)

app.use(bodyParser.urlencoded({extended: false}))



// Your first API endpoint
app.post('/api/shorturl', (req, res) => {
  let addUrl = req.body.url
  let y = dns.lookup(urlParser.parse(addUrl).hostname, (err, host) => {
    if(!host){
      res.json({error: "invalid url"})
    } else {
    let randomNumber = Math.floor(Math.random() * 1000) + 1
          
    let newUrl = new Urls({
      url: addUrl,
      shortUrl: randomNumber
    })

    newUrl.save((err, data) => {
      if(err){
        console.log(err)
      }
      res.json({original_url: data.url,
                short_url: data.shortUrl})
    })
    }
  })
})

app.get('/api/shorturl/:url?', (req, res) => {
  let findUrl = req.params.url
  Urls.findOne({shortUrl: findUrl}, (err, data )=> {
    if(err){
      res.json({error: "invalid url"})
    }
    res.redirect(data.url)
  })
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
