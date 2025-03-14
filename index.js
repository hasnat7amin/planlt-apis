const express = require("express");
const { Server } = require( "socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const path = require("path");
const api = require("./routes/index");
const viewsRoutes = require("./routes/views_routes");
const sendSms = require("./utils/send_sms");
const functions = require("firebase-functions")

require("dotenv/config");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
  },
}); 


require("./chat/index")(io)



app.use(express.json());
app.use(cors());
app.use(express.static("public"));
app.use(express.static("node_modules"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", function (req, res) {
  return res.send("Welcome to the apis");
});

app.use("/api", api);
app.use("/v1", viewsRoutes);





/* Connecting to the database. */
mongoose.set("strictQuery", true);
mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to MongoDb");
  })
  .catch((err) => console.log(err));

/* This is the port that the server will be listening on. */
const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log("listening on port http://localhost:" + port);
});

module.exports = app;

// exports.api = functions.https.onRequest(app)
