import express from "express";
import cors from "cors";
import * as cheerio from "cheerio";
import axios from "axios";

axios.defaults.timeout = 30000;
const cache = new Map();

const sourceMap = {
  oneJav: {
    baseUrl: "https://onejav.com/torrent",
    replace: (code) => code.toLowerCase().replace("-", ""),
  },
  "141Jav": {
    baseUrl: "https://www.141jav.com/torrent",
    replace: (code) => code.toUpperCase().replace("-", ""),
  },
  javBus: {
    baseUrl: "https://www.javbus.com",
    replace: (code) => code.toUpperCase(),
  },
};

const removeTail = (code) => {
  return code.replace(
    /(_(uncensored|CD[1-2]|[A-F])|-(uncensored|CD[1-2]CD[1-2]|[A-F]))+$/,
    ""
  );
};

const app = express();
app.use(cors());
const port = 3000;

const getHtml = async (url) => {
  try {
    const res = await axios.get(url);
    return res.data ? res.data : null;
  } catch (error) {
    return null;
  }
};

//fsdss647
const getAVPost = async (code, source) => {
  const sourceObj = sourceMap[source];
  const baseUrl = sourceObj.baseUrl;
  code = removeTail(code);
  code = sourceObj.replace(code);
  if (cache.has(code)) {
    return cache.get(code);
  }
  const url = `${baseUrl}/${code}`;
  console.log("url: ", url);
  const html = await getHtml(url);
  if (html) {
    const $ = cheerio.load(html);
    let imgSrc = $(".image").prop("src");
    imgSrc = enhanceQuality(imgSrc);
    console.log("imgSrc: ", imgSrc);
    if (imgSrc) {
      cache.set(code, imgSrc);
    }
    return imgSrc;
  } else {
    console.log("没有html");
  }
};

const enhanceQuality = (url) => {
  return url ? url.replace(/output-quality=(\d+)/, "output-quality=100") : null;
};

app.get("/av/:code", async (req, res) => {
  let { code } = req.params;
  const { source = "141Jav" } = req.query;
  if (!sourceMap[source]) {
    res.send("source参数错误");
    return;
  }
  let url = await getAVPost(code, source);

  res.send(
    JSON.stringify({
      code,
      url,
    })
  );
});

app.get("/cover", (req, res) => {
  const { url } = req.query;
  if (url) {
    axios
      .get(url, {
        responseType: "arraybuffer",
      })
      .then((response) => {
        console.log("success");
        res.set(response.headers); //把整个的响应头塞入更优雅一些
        res.end(response.data.toString("binary"), "binary"); //这句是关键，有两
      })
      .catch((response) => {
        console.log("fail");
        res.set(response.headers);
        res.end("");
      });
  } else {
    res.send("fuck you");
  }
});

app.listen(port, () => console.log("app is running at: " + port));
