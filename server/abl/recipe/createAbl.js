const Ajv = require("ajv");
const addFormats = require("ajv-formats").default;
const ajv = new Ajv();
addFormats(ajv);

const recipeDao = require("../../dao/recipe-dao.js");
const ingredientsDao = require("../../dao/ingredients-dao.js");

const schema = {
  type: "object",
  properties: {
    name: { type: "string", maxLength: 150 },
    note: { type: "string", maxLength: 250 },
    ingredientsId: { type: "string" },
    ingredientsAmount : { type: "number" },
  },
  required: ["name", "note", "ingredientsId", "ingredientsAmount"],
  additionalProperties: false,
};

async function CreateAbl(req, res) {
  try {
    let recipe = req.body;

    // validate input
    const valid = ajv.validate(schema, recipe);
    if (!valid) {
      res.status(400).json({
        code: "dtoInIsNotValid",
        message: "dtoIn is not valid",
        validationError: ajv.errors,
      });
      return;
    }

    // check if ingredientsId exists
    const ingredients = ingredientsDao.get(recipe.ingredientsId);

    if (!ingredients) {
      res.status(400).json({
        code: "ingredientsDoesNotExist",
        message: `ingredients with id ${recipe.ingredientsId} does not exist`,
        validationError: ajv.errors,
      });
      return;
    }

    // store recipe to persistent storage
    recipe = recipeDao.create(recipe);
    recipe.ingredients = ingredients;

    // return properly filled dtoOut
    res.json(recipe);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e.message });
  }
}

module.exports = CreateAbl;
