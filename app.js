let fs             = require('fs');
let express        = require('express');
let compression    = require('compression');
let methodOverride = require('method-override');
let bodyParser     = require('body-parser');
let cookieParser   = require('cookie-parser');
let nodemailer     = require('nodemailer');

let port = 3007;

let app = express();

let allowCrossOrigin = () =>{
    return (req, res, next) => {
        let allowedOrigins = ['http://localhost:3007', 'http://www.semantica.ai'];
        let origin = req.headers.origin;
        if(allowedOrigins.indexOf(origin) > -1){
            res.setHeader('Access-Control-Allow-Origin', origin);
        }

        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');

        res.setHeader('Access-Control-Allow-Credentials', true);

        return next();
    };
};

let sendMail = (mailData) =>
    new Promise((resolve, reject) =>
    {
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'panagonov@gmail.com',
                pass: 'gooAm8reaJ'
            }
        });

        let mailOptions = {
            from: mailData.name + "<" + mailData.email + ">",
            to: 'panagonov@mail.bg',
            subject: mailData.subject,
            html: mailData.message +
            '<br/><b>'+ mailData.name + '</b>' +
            '<br/><b>'+ mailData.email + '</b>' +
            '<br/><b>'+ mailData.phone + '</b>' +
            '<br/><b>'+ mailData.address + '</b>'
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return reject(error);
            }
            resolve(info);
        });

    });


app.use( methodOverride() );
app.use( compression() );
app.use( allowCrossOrigin() );
app.use(cookieParser());
app.set( 'view engine', 'ejs' );
app.set( 'views', __dirname + '/html/' );

app.use(bodyParser.json({
    limit: "10mb"
}));

app.use(bodyParser.urlencoded({
    extended: true,
    limit: "10mb"
}));
app.use('/', express.static(__dirname + '/html/'));


app.get("/", (req, res) =>
{
    res.render("index.ejs", {})
});

app.post("/send_email", async(req, res) =>
{
   let info = {};
    try
    {
        info = await(sendMail(req.body));
    }
    catch (e)
    {
        console.error(e);
        info = {error: e};
    }

    res.setHeader("Content-Type", "text/plain");
    res.send(JSON.stringify(info))
});

app.listen(port, '0.0.0.0');
console.log('Semantica.ai is READY!!!', 'port:', port);

process.on('uncaughtException', function (err, data)
{
    console.log("--- UNCAUGHT EXCEPTION ---");
    console.log(err);
    console.log("[Inside 'uncaughtException' event] " + err.stack || err.message);
    console.log(data);
});