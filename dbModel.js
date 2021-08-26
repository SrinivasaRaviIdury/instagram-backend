import mongoose from "mongoose";

const instance = mongoose.Schema({
  caption: String,
  user: String,
  image: String,
  comments: [],
});

//collection>[documents]>collection>[documents]
export default mongoose.model("posts", instance);
