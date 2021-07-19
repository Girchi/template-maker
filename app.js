import express, { response } from "express";
import { fileURLToPath } from "url";
import { dirname } from "path";
import bodyParser from "body-parser";
import multer from 'multer';
import nodeHtmlToImage from 'node-html-to-image'


const app = express();
const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './assets/serverImages')
  },
    filename: (req, file, cb) => {
      cb(null, `${file.originalname}`);
    }
  }
);

const upload = multer({storage: fileStorageEngine});
const port = 3000;
const hostname = "127.0.0.1";
const hostname2 = "http://127.0.0.1:3000";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const urlencodedParser = bodyParser.urlencoded({ extended: false });
app.set("view engine", "pug");

app.use("/assets", express.static("assets"));
app.use("/generate", express.static("generate"));

app.get("/", (req, res) => {
    res.render(__dirname + "/snippet/create-post")
});

app.post("/post", [urlencodedParser, upload.single("image")], (req, res) => {
  res.render(__dirname + "/snippet/post-success", {
    data: req.body, 
    image: `./assets/serverImages/${req.file.originalname}`
  });

  nodeHtmlToImage({
    output: './image.png',
    html: `
    <html>
    <style>
    @import url("//cdn.web-fonts.ge/fonts/bpg-nino-mtavruli/css/bpg-nino-mtavruli.min.css");

    body {
      overflow: hidden;
    }
    
    .post-container {
      width: 2048px;
      height: 2048px;
      transform-origin: top left;
      margin: 50px 0;
      left: 50%;
      transform: scale(0.25) translateX(-50%);
      font-family: "BPG Nino Mtavruli", sans-serif;
    
      text-align: center;
      position: relative;
      color: white;
      border: 50px solid #08a53f;
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
    }
    
    .text p {
      width: 1620px;
      font-weight: bold;
      font-size: 130px;
      line-height: 150px;
    }
    
    .author {
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translate(-50%, -50%);
    
      font-size: 76px;
      line-height: 87px;
    }
    
    .author::after {
      content: "";
      position: absolute;
      bottom: 0;
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
          <img src="./assets/serverImages/example.jpg" class="img">
          <div class="text">
              <p>${req.body.message}</p>
          </div>
          <div class="author">${req.body.name}</div>
        </div>
      </body>
    </html>`
  })
    .then(() => console.log('The image was created successfully!'))
});


app.listen(port, hostname, () =>
  console.log(`Server running at http://${hostname}:${port}/`)
);
