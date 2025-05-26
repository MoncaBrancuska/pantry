const Ajv = require("ajv");
const addFormats = require("ajv-formats").default;
const ajv = new Ajv();
addFormats(ajv);

const recipeDao = require("../../dao/recipe-dao.js");
const ingredientsDao = require("../../dao/ingredients-dao.js");

const schema = {
  type: "object",
  properties: {
    id: { type: "string", minLength: 32, maxLength: 32 },
    name: { type: "string", maxLength: 150 },
    note: { type: "string", maxLength: 250 },
    ingredientsList: {
      type: "array",
      items: {
        type: "object",
        properties: {
          ingredientsId: { type: "string" },
          ingredientsAmount: { type: "number" },
          ingredientsUnit: { type: "string", maxLength: 50 },
          ingredientsName: { type: "string", maxLength: 150 }
        },
        required: ["ingredientsId", "ingredientsAmount"],
        additionalProperties: false
      },
      minItems: 1
    }
  },
  required: ["name", "note", "ingredientsList"],
  additionalProperties: false,
};

async function UpdateAbl(req, res) {
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


    // update recipe in database
    const updatedrecipe = recipeDao.update(recipe);

    // check if ingredientsId exists
    for (const ingredient of updatedrecipe.ingredientsList || []) {
      const ingredientData = ingredientsDao.get(ingredient.ingredientsId);
      if (!ingredientData) {
        res.status(400).json({
          code: "ingredientDoesNotExist",
          message: `Ingredient with id ${ingredient.ingredientsId} does not exist`,
          ingredientId: ingredient.ingredientsId,
          validationError: ajv.errors,
        });
        return;
      }
    }

    if (!updatedrecipe) {
      res.status(404).json({
        code: "recipeNotFound",
        message: `recipe ${recipe.id} not found`,
      });
      return;
    }

    // return properly filled dtoOut
    res.json(updatedrecipe);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

module.exports = UpdateAbl;
