const puppeteer = require('puppeteer')
const express = require('express')
const app = express()
const fetch = require('node-fetch')

app.get('/', async (a,b) => {
  try {
    b.sendStatus(200)
  } catch (e) {
    b.sendStatus(500)
    console.log(e)
  }
});
app.get('/video/:id.mp4', async (a,b) => {
  try {
    if(a.params.id) {
      // mengambil URL lewat Puppeteer
      const browser = await puppeteer.launch({args: ['--no-sandbox','--disable-setuid-sandbox']});
      const page = await browser.newPage();
      await page.goto(`https://www72.zippyshare.com/v/${a.params.id}/file.html`, {waitUntil: 'networkidle2'});
      let url = await page.evaluate(() => document.querySelector('#dlbutton').href);
      
      if(!url) {
        b.status(400).send('Error, Zippyshare Expired/Dihapus.');
      }
      // Fetch lalu ubah jadi Buffer
      const response = await fetch(url);
      const buffer = await response.arrayBuffer();
      
      // setting Range video nya biar bisa menggunakan controls
      const videoSize = response.headers.get('Content-Length');
      const CHUNK_SIZE = 10 ** 6;
      let start = 0;
      let end = Math.min(videoSize - 1, start + CHUNK_SIZE);
      const range  = a.headers.range;
      const contentLength = end - start + 1;
      let header = {
        "Accept-Ranges": `${start}-${videoSize}`,
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
        "Cache-Control": "max-age=2592000, public"
      }
      if (range) {
        start = Number(range.replace(/\D/g, ""));
        //end = Math.min(videoSize - 1, start + CHUNK_SIZE);
        header["Content-Range"] = `bytes ${start}-${end}/${videoSize}`;      
        header["Accept-Range"] = "bytes";
        delete header['Accept-Ranges'];
      }
      b.set(header);
      b.send(Buffer.from(buffer));
      // stop browser
      browser.close();
    } else {
      b.sendStatus(404);
    }
  } catch(e) {
    console.log(e);
    b.sendStatus(500);
  }
});

app.listen(3000);
