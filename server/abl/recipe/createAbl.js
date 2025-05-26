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

    // recipe duplicity name check (case-insensitive)
    const existingRecipes = recipeDao.list();
    const duplicate = existingRecipes.find(
      r => r.name.toLowerCase() === recipe.name.toLowerCase()
    );
    if (duplicate) {
      res.status(400).json({
        code: "recipeNameAlreadyExists",
        message: `Recipe with name '${recipe.name}' already exists.`,
        validationError: null,
      });
      return;
    }

    // check if ingredietns already exist
    const ingredients = [];
    for (const item of recipe.ingredientsList) {
      const ingredient = ingredientsDao.get(item.ingredientsId);
      if (!ingredient) {
        res.status(400).json({
          code: "ingredientsDoesNotExist",
          message: `Ingredient with id ${item.ingredientsId} does not exist`,
          validationError: null,
        });
        return;
      }
      ingredients.push(ingredient);
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
