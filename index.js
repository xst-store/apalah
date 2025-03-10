const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path')
const _ = require('lodash');
const { dataGame } = require('./utils/data');
const axios = require('axios')
const router = require('./routes');

const codeqr = '00020101021126670016COM.NOBUBANK.WWW01189360050300000879140214509288104204890303UMI51440014ID.CO.QRIS.WWW0215ID20253689552610303UMI5204541153033605802ID5925REREZZ OFFICIAL OK21602806008SUKABUMI61054311162070703A016304595A'
const memberid = 'OK2160280'
const keyorkut = '589816617365410752160280OKCTF020AC99BFAED0B72FD154AC1E36DE00'
const keyapi = 'f379af2066'

const app = express();
const port = 3000;

app.use(express.json());
app.use('/test', express.static('public'));
app.use(cors());

app.use('/api', router);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/buysc', (req, res) => {
   res.sendFile(path.join(__dirname, 'public', 'buysc.html'));
});

app.get('/stalk-freefire', (req, res) => {
   res.sendFile(path.join(__dirname, 'public', 'stalk-ff.html'));
});

app.get('/nick-game', (req, res) => {
   res.sendFile(path.join(__dirname, 'public', 'search-game.html'));
});

app.post('/ffstalk', async (req, res) => {
   try {
       const { id } = req.body;
       if (!id) {
           return res.status(400).json({ error: "ID tidak boleh kosong." });
       }

       const apiUrl = `https://api.vreden.my.id/api/ffstalk?id=${id}`;
       const response = await axios.get(apiUrl);

       res.status(200).json(response.data);
   } catch (error) {
       console.error("Error saat stalk akun FF:", error.message);
       res.status(500).json({ error: "Gagal mengambil data Free Fire." });
   }
});


app.get('/endpoint', (req, res) => {
   const newDataGame = dataGame.map((item) => {
      return {
         name: item.name,
         slug: item.slug,
         endpoint: `/api/game/${item.slug}`,
         query: `?id=xxxx${item.isZone ? '&zone=xxx' : ''}`,
         hasZoneId: item.isZone ? true : false,
         listZoneId: item.dropdown ? `/api/game/get-zone/${item.slug}` : null,
      };
   });

   return res.json({
      name: 'XSTBot Whatsapp',
      data: _.orderBy(newDataGame, ['name'], ['asc']),
   });
});

app.get('/*', (req, res) => {
   res.status(404).json({ error: 'Error' });
});

app.post('/createpay', async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || isNaN(amount)) {
            return res.status(400).json({ error: "Amount is required and must be a number." });
        }
        const apiUrl = `https://www.decode.im-rerezz.xyz/api/pay/okt-deposit`;
        const params = {
            amount: amount,
            qrcode: codeqr,
            apikey: keyapi
        };
        const response = await axios.get(apiUrl, { params });
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ error: "An error occurred while processing the request." });
    }
});

app.post('/cekstatuspay', async (req, res) => {
   try {
       const apiUrl = `https://www.decode.im-rerezz.xyz/api/pay/okt-status?memid=${memberid}&keyorkut=${keyorkut}&apikey=${keyapi}`;

       const response = await axios.get(apiUrl);

       console.log("Response dari API status pembayaran:", response.data);

       res.status(200).json(response.data);
   } catch (error) {
       console.error("Error saat cek status:", error.message);
       res.status(500).json({ error: "Gagal memproses permintaan." });
   }
});



const transporter = nodemailer.createTransport({
   service: 'gmail',
   auth: {
       user: 'rerezzofficial@gmail.com',
       pass: 'epee rzwy symm aglf'
   }
});

app.post('/sendsc', async (req, res) => {
   const { email } = req.body;
   if (!email) {
       return res.status(400).json({ success: false, message: 'Email tidak boleh kosong!' });
   }
   
   const mailOptions = {
       from: 'rerezzofficial@gmail.com',
       to: email,
       subject: 'Download Source Code Anda',
       html: `
           <h2>Terima kasih atas pembelian Anda!</h2>
           <p>Klik tombol di bawah ini untuk mengunduh source code Anda:</p>
           <a href="https://files.catbox.moe/tdgmbg.zip" style="
               display: inline-block;
               padding: 10px 20px;
               font-size: 16px;
               font-weight: bold;
               color: white;
               background-color: #28a745;
               text-decoration: none;
               border-radius: 5px;
           ">Download Script</a>
           <p>Jika tombol tidak berfungsi, silakan copy link berikut ke browser:</p>
           <p><a href="https://files.catbox.moe/tdgmbg.zip">https://files.catbox.moe/tdgmbg.zip</a></p>
       `
   };
   
   try {
       await transporter.sendMail(mailOptions);
       res.json({ success: true, message: 'Email berhasil dikirim!' });
   } catch (error) {
       console.error('Error kirim email:', error);
       res.status(500).json({ success: false, message: 'Gagal mengirim email.' });
   }
});


app.listen(port, () => {
   console.log(`Example app listening at http://localhost:${port}`);
});

module.exports = app;
