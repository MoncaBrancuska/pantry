const recipeDao = require("../../dao/recipe-dao.js");
const ingredientsDao = require("../../dao/ingredients-dao.js");

/*async function ListAbl(req, res) {
  try {
    const recipeList = recipeDao.list();
    res.json({ itemList: recipeList });
  } catch (e) {
    res.status(500).json({ recipe: e.recipe });
  }
}*/
async function ListAbl(req, res) {
  try {
    // Získání seznamu receptů a ingrediencí
    const recipeArray = await recipeDao.list(); // pole receptů
    const ingredientsArray = await ingredientsDao.list(); // pole ingrediencí

    // Mapa podle ID ingrediencí
    const ingredientsMap = {};
    for (const ingredient of ingredientsArray) {
      ingredientsMap[ingredient.id] = {
        name: ingredient.name,
        unit: ingredient.unit
      };
    }

    // Doplnění názvů a jednotek k ingrediencím v receptech
    const enrichedRecipes = recipeArray.map(recipe => {
      const enrichedIngredients = recipe.ingredientsList.map(ingredient => {
        const match = ingredientsMap[ingredient.ingredientsId];
        return {
          ...ingredient,
          ingredientsName: match?.name ?? null,
          ingredientsUnit: match?.unit ?? null
        };
      });

      return {
        ...recipe,
        ingredientsList: enrichedIngredients
      };
    });

    res.json({ itemList: enrichedRecipes });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}


module.exports = ListAbl;
