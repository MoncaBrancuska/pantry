const recipeDao = require("../../dao/recipe-dao.js");

async function ListAbl(req, res) {
  try {
    const recipeList = recipeDao.list();
    res.json({ itemList: recipeList });
  } catch (e) {
    res.status(500).json({ recipe: e.recipe });
  }
}

module.exports = ListAbl;
