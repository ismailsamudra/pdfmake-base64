const express = require('express');
const fileUpload = require('express-fileupload');
const { body, validationResult } = require('express-validator');
const cors = require('cors');
const axios = require('axios');
const pdfMake = require("pdfmake/build/pdfmake");
const pdfFonts = require("pdfmake/build/vfs_fonts");
pdfMake.vfs = pdfFonts.pdfMake.vfs;
const fs = require('fs');
const http = require('http');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const { window } = new JSDOM("");
const htmlToPdfMake = require("html-to-pdfmake");
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000;
const jsonParser = bodyParser.json();
const pdf2base64 = require('pdf-to-base64');
const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(fileUpload({
  debug: false
}));
app.use(cors())

  app.get('/', (req, res) => {
    res.sendFile('pdf/example.pdf', {
      root: __dirname
    });
  });
  app.post("/pdf", jsonParser, [
    body('nama').notEmpty(),
    body('data').notEmpty(),
    ], async (req, res) => {
        const data_auth = req.body.data; 
        const html = htmlToPdfMake(data_auth, {window:window});
        const docDefinition = {
        content: [
            html
        ]
        };
        const pdfDocGenerator = pdfMake.createPdf(docDefinition);
        pdfDocGenerator.getBuffer(function(buffer) {
        fs.writeFileSync('pdf/'+req.body.nama+'.pdf', buffer);
        });
        setTimeout(function () {
            pdf2base64('pdf/'+req.body.nama+'.pdf')
            .then(
                (response) => {
                              res.status(200).json({
                                status: true,
                                msg:"Berhasil",
                                data:'data:application/pdf;base64,'+response
                                });
                                fs.unlinkSync('pdf/'+req.body.nama+'.pdf');
                    console.log('Recieved');        }
            )
            .catch(
                (error) => {
                    console.log(error);
                }
            )
        }, 2000);
  });

server.listen(port, function() {
    console.log('App running on *: ' + port);
});