const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ingredientsFolderPath = path.join(__dirname, "storage", "ingredientsList");

// Method to read an ingredients from a file
function get(ingredientsId) {
  try {
    const filePath = path.join(ingredientsFolderPath, `${ingredientsId}.json`);
    const fileData = fs.readFileSync(filePath, "utf8");
    return JSON.parse(fileData);
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw { code: "failedToReadingredients", ingredients: error.ingredients };
  }
}

// Method to write an ingredients to a file
function create(ingredients) {
  try {
    const ingredientsList = list();
    if (ingredientsList.some((item) => item.name === ingredients.name)) {
      throw {
        code: "uniqueNameAlreadyExists",
        message: "exists ingredients with given name",
      };
    }
    ingredients.id = crypto.randomBytes(16).toString("hex");
    const filePath = path.join(ingredientsFolderPath, `${ingredients.id}.json`);
    const fileData = JSON.stringify(ingredients);
    fs.writeFileSync(filePath, fileData, "utf8");
    return ingredients;
  } catch (error) {
    throw { code: "failedToCreateingredients", ingredients: error.ingredients };
  }
}

// Method to update ingredients in a file
function update(ingredients) {
  try {
    const currentingredients = get(ingredients.id);
    if (!currentingredients) return null;

    if (ingredients.name && ingredients.name !== currentingredients.name) {
      const ingredientsList = list();
      if (ingredientsList.some((item) => item.name === ingredients.name)) {
        throw {
          code: "uniqueNameAlreadyExists",
          message: "exists ingredients with given name",
        };
      }
    }

    const newingredients = { ...currentingredients, ...ingredients };
    const filePath = path.join(ingredientsFolderPath, `${ingredients.id}.json`);
    const fileData = JSON.stringify(newingredients);
    fs.writeFileSync(filePath, fileData, "utf8");
    return newingredients;
  } catch (error) {
    throw { code: "failedToUpdateingredients", ingredients: error.ingredients };
  }
}

// Method to remove an ingredients from a file
function remove(ingredientsId) {
  try {
    const filePath = path.join(ingredientsFolderPath, `${ingredientsId}.json`);
    fs.unlinkSync(filePath);
    return {};
  } catch (error) {
    if (error.code === "ENOENT") {
      return {};
    }
    throw { code: "failedToRemoveingredients", ingredients: error.ingredients };
  }
}

// Method to list ingredientss in a folder
function list() {
  try {
    const files = fs.readdirSync(ingredientsFolderPath);
    const ingredientsList = files.map((file) => {
      const fileData = fs.readFileSync(
        path.join(ingredientsFolderPath, file),
        "utf8"
      );
      return JSON.parse(fileData);
    });
    return ingredientsList;
  } catch (error) {
    throw { code: "failedToListingredientss", ingredients: error.ingredients };
  }
}

// get ingredientsMap
function getingredientsMap() {
  const ingredientsMap = {};
  const ingredientsList = list();
  ingredientsList.forEach((ingredients) => {
    ingredientsMap[ingredients.id] = ingredients;
  });
  return ingredientsMap;
}

module.exports = {
  get,
  create,
  update,
  remove,
  list,
  getingredientsMap,
};
