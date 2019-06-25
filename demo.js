//引入依赖
//
const https = require('https');
const cheerio = require('cheerio');
const iconv = require('iconv-lite')
const request = require("request");
const fs = require('fs');
const path = require('path');

const url = 'https://unsplash.com/';

//方法对象
const util = {

  getsrc: function (url) {
    https.get(url, res => {
      const chunks = [];
      res.on('data', chunk => {
        chunks.push(chunk);
      });
      res.on('end', e => {
        let ALL = [];
        let html = iconv.decode(Buffer.concat(chunks), 'utf8');
        let $ = cheerio.load(html, { decodeEntities: false });

        $("figure img").each(function (idex, elent) {
          let $elent = $(elent);
          let $srcset = $elent.attr("srcset");
          if ($srcset != undefined) {
            //获取图片src
            let src = ($srcset.split(',').pop()).split('?')[0];
            ALL.push({
              src: src
            })
          }
        });

        ALL.forEach(item => {
          //注：这里src可能已经有.jpg结尾
          util.downloadimg(item.src, path.basename(item.src) + ".jpg", function () {
            console.log(path.basename(item.src) + ".jpg");
          });
        })
      });

      res.on('error', e => {
        console.log('Error: ' + e.message);
      });
    });
  },

  //运行主函数
  main: function () {
    console.log("------start--------");
    util.getsrc(url);
  },
  downloadimg: function (src, srcname, callback) {

    //http请求
    request.head(src, function (err, res, body) {
      if (err) {
        console.log('err:' + err);
        return false;
      }
      console.log('res: ' + res);
      request(src).pipe(fs.createWriteStream('./img/' + srcname)).on('close', callback);
    });
  }
}

//主函数
util.main();
