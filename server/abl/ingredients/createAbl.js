const Ajv = require("ajv");
const ajv = new Ajv();

const ingredientsDao = require("../../dao/ingredients-dao.js");

const schema = {
  type: "object",
  properties: {
    name: { type: "string", maxLength: 50 },
    unit: { type: "string" },
  },
  required: ["name", "unit"],

  additionalProperties: false,
};

async function CreateAbl(req, res) {
  try {
    let ingredients = req.body;

    // validate input
    const valid = ajv.validate(schema, ingredients);
    if (!valid) {
      res.status(400).json({
        code: "dtoInIsNotValid",
        ingredients: "dtoIn is not valid",
        validationError: ajv.errors,
      });
      return;
    }

    // ingredients duplicity name check (case-insensitive)
    const existingIngredients = ingredientsDao.list(); 
    const duplicate = existingIngredients.find(
      r => r.name.toLowerCase() === ingredients.name.toLowerCase()
    );
    if (duplicate) {
      res.status(400).json({
        code: "ingredientsNameAlreadyExists",
        message: `Ingredients with name '${ingredients.name}' already exists.`,
        validationError: null,
      });
      return;
    }

    // store ingredients to a persistant storage
    try {
      ingredients = ingredientsDao.create(ingredients);
    } catch (e) {
      res.status(400).json({
        ...e,
      });
      return;
    }

    // return properly filled dtoOut
    res.json(ingredients);
  } catch (e) {
    res.status(500).json({ ingredients: e.ingredients });
  }
}

module.exports = CreateAbl;
