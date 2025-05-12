const ingredientsDao = require("../../dao/ingredients-dao.js");

async function ListAbl(req, res) {
  try {
    const ingredientsList = ingredientsDao.list();
    res.json({ itemList: ingredientsList });
  } catch (e) {
    res.status(500).json({ ingredients: e.ingredients });
  }
}

module.exports = ListAbl;
