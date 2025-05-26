const Ajv = require("ajv");
const ajv = new Ajv();

const ingredientsDao = require("../../dao/ingredients-dao.js");

const schema = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    unit: { type: "string" },
  },
  required: ["id"],
  additionalProperties: false,
};

async function UpdateAbl(req, res) {
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

    // update ingredients in persistent storage
    let updatedingredients;
    try {
      updatedingredients = ingredientsDao.update(ingredients);
    } catch (e) {
      res.status(400).json({
        ...e,
      });
      return;
    }
    if (!updatedingredients) {
      res.status(404).json({
        code: "ingredientsNotFound",
        ingredients: `ingredients with id ${ingredients.id} not found`,
      });
      return;
    }

    // return properly filled dtoOut
    res.json(updatedingredients);
  } catch (e) {
    res.status(500).json({ ingredients: e.ingredients });
  }
}

module.exports = UpdateAbl;
