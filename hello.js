const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (_req, res) => {
  res.send("hello word");
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
