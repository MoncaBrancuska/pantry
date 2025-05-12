const express = require("express");
const app = express();
const port = 8888;

const recipeController = require("./controller/recipe");
const ingredientsController = require("./controller/ingredients");

app.use(express.json()); // podpora pro application/json
app.use(express.urlencoded({ extended: true })); // podpora pro application/x-www-form-urlencoded

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/recipe", recipeController);
app.use("/ingredients", ingredientsController);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
