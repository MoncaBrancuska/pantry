const Ajv = require("ajv");
const ajv = new Ajv();
const ingredientsDao = require("../../dao/ingredients-dao.js");

const schema = {
  type: "object",
  properties: {
    id: { type: "string" },
  },
  required: ["id"],
  additionalProperties: false,
};

async function GetAbl(req, res) {
  try {
    // get request query or body
    const reqParams = req.query?.id ? req.query : req.body;

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

    // read ingredients by given id
    const ingredients = ingredientsDao.get(reqParams.id);
    if (!ingredients) {
      res.status(404).json({
        code: "ingredientsNotFound",
        ingredients: `ingredients with id ${reqParams.id} not found`,
      });
      return;
    }

    // return properly filled dtoOut
    res.json(ingredients);
  } catch (e) {
    res.status(500).json({ ingredients: e.ingredients });
  }
}

module.exports = GetAbl;
