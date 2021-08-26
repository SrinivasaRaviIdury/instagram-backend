import mongoose from "mongoose";
import cors from "cors";
import express from "express";
import Pusher from "pusher";
import dbModal from "./dbModel.js";

//app config
const app = express();
const port = process.env.PORT || 5000;

const pusher = new Pusher({
  appId: "1247343",
  key: "762502697aab21b9b83d",
  secret: "531f7884e147f71473c8",
  cluster: "ap2",
  useTLS: true,
});

//middle wares
app.use(express.json());
app.use(cors()); //handle headers
//DB config
const connection_url = `mongodb+srv://admin:kvcsPlRCOHG5Txz8@cluster0.ctoxt.mongodb.net/insta-db?retryWrites=true&w=majority`;
mongoose.connect(connection_url, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once("open", () => {
  console.log("DB Connected");
  const changeStream = mongoose.connection.collection("posts").watch();
  changeStream.on("change", (change) => {
    console.log("Change Triggered on Pusher...");
    console.log(change);
    console.log("End of change...");

    if (change.operationType === "insert") {
      console.log("Triggering Pusher **IMG UPLOAD***");

      const postDetails = change.fullDocument;
      pusher.trigger("posts", "inserted", {
        user: postDetails.user,
        caption: postDetails.caption,
        image: postDetails.image,
      });
    } else {
      console.log("Unknown trigger from pusher");
    }
  });
});
//api routes
app.get("/", (req, res) => res.status(200).send("hello world"));
app.post("/upload", (req, res) => {
  const body = req.body;
  dbModal.create(body, (err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(201).send(data);
    }
  });
});

app.get("/sync", (req, res) => {
  dbModel.find((err, data) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});
//listener
app.listen(port, () => console.log(`listening on localhost:${port}`));
