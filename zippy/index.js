const puppeteer = require('puppeteer')
const express = require('express')
const app = express()
const fetch = require('node-fetch')
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
app.get('/tohash', async (a,b) => {
  // Encrypt
  if(a.query.q) {
    const encrypt = CryptoJS.AES.encrypt(a.query.q, jona).toString();
    b.send(encodeURIComponent(encrypt));
  } else {
    b.sendStatus(404);
  }
})
app.get('/video/:path.mp4', async (a,b) => {
  try {
    if(a.query.hash) {
      // decrypt
      var bytes  = CryptoJS.AES.decrypt(a.query.hash, jona);
      var decrypt = bytes.toString(CryptoJS.enc.Utf8);
      
      // mengambil URL lewat Puppeteer
      const browser = await puppeteer.launch({args: ['--no-sandbox','--disable-setuid-sandbox']});
      const page = await browser.newPage();
      await page.goto(decrypt, {waitUntil: 'networkidle2'});
      //await page.screenshot({path:'example.png', fullPage:true})
      let url = await page.evaluate(() => document.querySelector('#dlbutton') ? document.querySelector('#dlbutton').href : false);
      
      // stop browser
      browser.close();
      
      if(!url) {
        b.status(400).send('Error, Zippyshare Expired/Dihapus/ID Salah.');
      }
      // Fetch lalu ubah jadi Buffer
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();
      b.send(Buffer.from(buffer));
    } else {
      b.sendStatus(404);
    }
  } catch(e) {
    console.log(e);
    b.sendStatus(500);
  }
});

app.listen(1234);
