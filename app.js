require("dotenv").config();
const express = require("express");
const app = express();
const session = require("express-session");
const cookieParser = require("cookie-parser");
const path = require("path");
const morgan = require('morgan');
const dbConnect = require("./config/dbConnect");
const userRouter = require("./routes/userRoutes");
const adminRouter = require("./routes/adminRoutes");


dbConnect();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

const oneWeek = 1000 * 60 * 60 * 24 * 7;
app.use(
  session({
    secret: process.env.SESSIONKEY,
    saveUninitialized: true,
    cookie: { maxAge: oneWeek },
    resave: false,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan('tiny'));


app.use((req, res, next) => {
  res.set(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
  );
  next();
});

app.use("/admin", adminRouter);
app.use("/", userRouter);

app.use((req, res) => {
  res.status(404).render("user/404");
});


app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.status || 500).send({ status: err.status || 500, message: err.message });
});

app.listen(process.env.PORT, () => {
  console.log("Server is running at 8080");
});
