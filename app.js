import express, { response } from "express";
import { fileURLToPath } from "url";
import { dirname } from "path";
import multer from 'multer';
import bodyParser from "body-parser";
import nodeHtmlToImage from 'node-html-to-image';
import fs from 'fs';
import request from 'request';


const app = express();
const fileStorageEngine = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, './assets/serverImages/')
  },
    filename(req, file, cb) {
      cb(null, `${file.originalname}`);
    }
  }
);

const upload = multer({storage: fileStorageEngine});
const port = 3000;
const hostname = "127.0.0.1";
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.set("view engine", "pug");
app.use("/assets", express.static("assets"));
app.use("/generate", express.static("generate"));

app.get("/", upload.single("image"), (req, res) => {
  res.render(__dirname + "/snippet/create-post", {qs: req.query, image: `./assets/serverImages/image.jpg`})
});


app.post("/post", [urlencodedParser, upload.single("image")], (req, res) => {
  res.render(__dirname + '/snippet/post-success', {
    qs: req.body,
    author: req.body.author,
    message: req.body.message,
    image: `./assets/serverImages/${req.file.originalname}`,
    generatedImage: "./assets/post/generatedTemplate/image.jpg"
  });


  const image = fs.readFileSync(`./assets/serverImages/${req.file.originalname}`,);
  const base64Image = new Buffer.from(image).toString('base64');
  const dataURI = 'data:image/jpeg;base64,' + base64Image;

  nodeHtmlToImage({
    output: './assets/post/generatedTemplate/image.jpg',
    html: `
    <html>
    <style>
      @import url("//cdn.web-fonts.ge/fonts/bpg-nino-mtavruli/css/bpg-nino-mtavruli.min.css");

      body {
        overflow: hidden;
        width: 2048px;
        height: 2048px;
      }

      .post-container {
        width: 2048px;
        height: 2048px;
        transform-origin: top left;
        margin: 50px 0;
        left: 50%;
        transform: translateX(-50%);
        font-family: "BPG Nino Mtavruli", sans-serif;
        text-align: center;
        position: relative;
        color: white;
        overflow: hidden;
      }

      .post-container::after {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        background: url("http://127.0.0.1:3000/assets/post/img/post-bg.png") no-repeat center/cover,  linear-gradient(
          1deg
          , #000 0%, transparent 40%);
        z-index: 10;
        filter: blur(2px);
        pointer-events: none;
      }

      .content {
        margin-top: -45px;
      }

      .img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .text {
        width: 100%;
        height: 90%;
        position: absolute;
        left: 0;
        top: 0;
        display: flex;
        justify-content: center;
        align-items: flex-end;
        z-index: 100;

      }

      .text p {
        width: 1565px;
        font-weight: bold;
        font-size: 90px;
        line-height: 150px;
      }

      .author {
        position: absolute;
        bottom: 35px;
        left: 50%;
        transform: translate(-50%, -50%);

        font-size: 76px;
        line-height: 87px;
        z-index: 100;

      }

      .author::after {
        content: "";
        position: absolute;
        bottom: -22px;
        left: 50%;
        transform: translate(-50%, -50%);
        height: 10px;
        width: 100%;
        background-color: #08a53f;
        border-radius: 21px;
      }

      #btn {
        margin: 20px 0 0 20px;
      }

    </style>
      <body>
        <div class="post-container">
          <img src={{picture}} class="img">
          <div class="text">
              <p>{{message}}</p>
          </div>
          <div class="author">{{author}}</div>
        </div>
      </body>
    </html>`,

    content: {
      author: req.body.author,
      message: req.body.message,
      picture: dataURI,
    }
  }).then(() => console.log('The image was created successfully!'))
});


app.listen(port, hostname, () =>
  console.log(`Server running at http://${hostname}:${port}/`)
);
