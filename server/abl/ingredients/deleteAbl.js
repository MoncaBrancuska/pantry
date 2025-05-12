const Ajv = require("ajv");
const ajv = new Ajv();
const ingredientsDao = require("../../dao/ingredients-dao.js");
const recipeDao = require("../../dao/recipe-dao.js");

const schema = {
  type: "object",
  properties: {
    id: { type: "string" },
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
        ingredients: "dtoIn is not valid",
        validationError: ajv.errors,
      });
      return;
    }

    // check there is no recipe related to given ingredients
    const recipeList = recipeDao.listByingredientsId(reqParams.id);
    if (recipeList.length) {
      res.status(400).json({
        code: "ingredientsWithrecipes",
        message: "ingredients has related recipes and cannot be deleted",
        validationError: ajv.errors,
      });
      return;
    }

    // remove recipe from persistant storage
    ingredientsDao.remove(reqParams.id);

    // return properly filled dtoOut
    res.json({});
  } catch (e) {
    res.status(500).json({ ingredients: e.ingredients });
  }
}

module.exports = DeleteAbl;
