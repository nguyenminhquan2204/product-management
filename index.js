const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("express-flash");
const moment = require("moment");
// const multer = require("multer");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const database = require("./config/database.js");

const systemConfig = require("./config/system.js");

// Nhung cai file routes
const routeAdmin = require("./routes/admin/index.route.js");
const route = require("./routes/client/index.route.js");

database.connect();

const app = express();
const port = process.env.PORT;

app.use(methodOverride("_method"));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}));

// nhung cai file file pug
// app.set("views", "./views");
app.set("views", `${__dirname}/views`);
app.set("view engine", "pug");

// Socket
const server = http.createServer(app);
const io = new Server(server);
global._io = io;

// End

// Flash: hien thi thong bao
app.use(cookieParser("QUANCHI"));
app.use(session({
    cookie: {
        maxAge: 60000
    },
}));
app.use(flash());
// End Flash

// TinyMCE
app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));
// End TinyMCE

// App Locals Variables
app.locals.prefixAdmin = systemConfig.prefixAdmin;
app.locals.moment = moment;
// End

// Nhung cai file tinh (vd: file js, css, html)
// app.use(express.static("public"));
app.use(express.static(`${__dirname}/public`));

// Route
routeAdmin(app);
route(app);
app.get("*", (req, res) => {
    res.render("client/pages/errors/404", {
        pageTitle: "404 Not Found",
    });
});

server.listen(port, () => {
    console.log(`Example App listening on port ${port}`);
});