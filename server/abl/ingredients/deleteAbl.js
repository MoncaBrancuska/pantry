const Ajv = require("ajv");
const ajv = new Ajv();
const ingredientsDao = require("../../dao/ingredients-dao.js");
const recipeDao = require("../../dao/recipe-dao.js");

const schema = {
  type: "object",
  properties: {
    id: { type: "string" }
  },
  required: ["id"],
  additionalProperties: false,
};

async function DeleteAbl(req, res) {
  try {
    const reqParams = req.body;

    // validate input
    const valid = ajv.validate(schema, reqParams);
    if (!valid) {
      res.status(400).json({
        code: "dtoInIsNotValid",
        message: "dtoIn is not valid",
        validationError: ajv.errors,
      });
      return;
    }

    // zkontroluj, jestli není ingredience použita v některém receptu
    const allRecipes = recipeDao.list(); // nebo await recipeDao.list() podle implementace
    const isUsed = allRecipes.some(recipe =>
      recipe.ingredientsList?.some(ing => ing.ingredientsId === reqParams.id)
    );

    if (isUsed) {
      res.status(400).json({
        code: "ingredientsWithRecipes",
        message: "Ingredient is used in one or more recipes and cannot be deleted",
        validationError: null,
      });
      return;
    }

    // odstraň ingredienci
    ingredientsDao.remove(reqParams.id);

    // návrat prázdné odpovědi
    res.json({});
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e.message });
  }
}

module.exports = DeleteAbl;
