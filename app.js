import express, { response } from "express";
import { fileURLToPath } from "url";
import { dirname } from "path";
import multer from 'multer';
import bodyParser from "body-parser";
import cors from 'cors';
import fs from 'fs';
import nodeHtmlToImage from 'node-html-to-image';
import font2base64 from 'node-font2base64';


const app = express();
app.use(cors());

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
const port = process.env.PORT || 3000;
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.set("view engine", "pug");
app.use("/assets", express.static("assets"));
app.use("/generate", express.static("generate"));

app.get("/", upload.single("image"), (req, res) => {
  res.render(__dirname + "/snippet/create-post", {qs: req.query, image: `./assets/serverImages/image.jpg`})
});


app.post("/post", [urlencodedParser, upload.single("image")], async (req, res) => {
  // create DataURI to read the uploaded image
  const dataURI = (path) => {
    const image = fs.readFileSync(path,);
    const base64Image = new Buffer.from(image).toString('base64');
    return `data:image/jpeg;base64,${base64Image}`;
  }
  
  // base64 urls for fonts
  const FiraGo_Bold_Font = font2base64.encodeToDataUrlSync('./assets/css/fonts/FiraGO-Bold.otf');
  const FiraGo_ExtraBold_Font = font2base64.encodeToDataUrlSync('./assets/css/fonts/FiraGO-ExtraBold.otf');

  await nodeHtmlToImage({
    output: './assets/generatedTemplate/image.jpg',
    html: `
    <html>
      <link rel="stylesheet" href="./assets/css/generatedTemplate.css">

    <style>
      @import url("//cdn.web-fonts.ge/fonts/bpg-nino-mtavruli/css/bpg-nino-mtavruli.min.css");
      
      @font-face {
        font-family: "FiraGO-Bold";
        src: url(${FiraGo_Bold_Font}) format('woff2');
      }
      
      @font-face {
        font-family: "FiraGO-ExtraBold";
        src: url(${FiraGo_ExtraBold_Font}) format('woff2');
      }
    
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
        background:  linear-gradient(
          1deg
          , #000 0%, transparent 40%);      
        border: 40px solid #58ff76;
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
        position: relative;
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
        font-family: "FiraGO-ExtraBold";
        width: 1565px;
        font-size: 100px;
        line-height: 81px;
        font-size: 60px;
        color: #c8c8c8;
        font-weight: 800;
        text-align: center;
      }
    
      .author {
        position: absolute;
        bottom: 50px;
        left: 50%;
        transform: translate(-50%, -50%);
        padding: 0 140px 0 140px;
        font-family: "FiraGO-Bold";
        line-height: 80px;
        z-index: 100;
        background-color: #73e778;
        font-size: 45px;
        color: #191919;
        font-weight: bold;
      }
    
      .rectangle {
        width: 370px;
        height: 90px;
        position: absolute;
        left: 78%;
        top: 4%;
        background-color: #57ff75;
      }
      
      .girchi-logo-rect {
        position:absolute;
        width: 13rem;
        padding: 0;
        margin: 0;
        top:20%;
        left: 20%;
        right: 20%; 
        bottom:20%
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
          <div class='rectangle'>
            <img class="girchi-logo-rect" src='http://localhost:3000/assets/img/girchi-logo.png'>
          </div
        </div>
      </body>
    </html>`,

    content: {
      author: req.body.author,
      message: req.body.message,
      picture: dataURI(`./assets/serverImages/${req.file.originalname}`),
    }
  }).then(() => {
    res.render(__dirname + '/snippet/post-success', {
      qs: req.body,
      author: req.body.author,
      message: req.body.message,
      image: `./assets/serverImages/${req.file.originalname}`,
      generatedImage: dataURI("./assets/generatedTemplate/image.jpg")
    });
    console.log("done!");
  })
});


app.listen(port, () =>
  console.log(`Server running at http://localhost:${port}/`)
);
