const puppeteer = require('puppeteer')
const express = require('express')
const app = express()
const fetch = require('node-fetch')
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const CryptoJS = require("crypto-js");
const jona = 'Jonariar Deva Wardhani';
  
app.get('/', async (a,b) => {
  try {
    b.sendStatus(200)
  } catch (e) {
    b.sendStatus(500)
    console.log(e)
  }
});
app.get('/v/:prefix/:id', async (req,res) => {
  try {
    if(req.params.prefix && req.params.id) {
      let url = `https://www${req.params.prefix}.zippyshare.com/v/${req.params.id}/file.html`;
      let dom = await JSDOM.fromURL(url);
      let {document} = dom.window;
      for(script of document.querySelectorAll('script')) {
        if(script.textContent.indexOf('Math.pow') !== -1) {
          await eval(script.textContent);
        }
      }
      let dl = document.querySelector('#dlbutton');
      if(!dl || dl.getAttribute('href') !== '#') {
        // Fetch lalu ubah jadi Buffer
        const response = await fetch(dl.href);
        const buffer = await response.arrayBuffer();
        res.set('Content-Disposition', `attachment; filename="file.mp4"`);
        res.send(Buffer.from(buffer));
      } else {
        res.sendStatus(404)
      }
    } else {
      res.send(400)
    }
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
})

app.listen(1234);
