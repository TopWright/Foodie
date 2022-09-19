import Search from "./models/Search";
import Recipe from "./models/Recipe";
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import { elements, renderLoader, clearLoader } from "./views/base";

/** Global state of the app
 * - Search object
 * - Current recipe object
 * - Shopping list object
 * - Liked recipe
*/

const state = {};

///////////////////////////////////////////
/////// SEARCH CONTROLLER
///////////////////////////////////////////
const controlSearch = async () => {
    // 1. Get query
    const query = searchView.getInput();

    if (query) {

        // 2. New Search object and add to state
        state.search = new Search(query);

        // Prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchResult)

        try {
            await state.search.getResults();

            // 5. Render UI
            clearLoader();
            searchView.renderResult(state.search.result);
        } catch (err) {
            alert('Error Processing Recipe');
            clearLoader();
        }
        // 4. search for recipes

    }
};

elements.searchForm.addEventListener('submit', event => {
    event.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');

    if (btn) {
        const goToPage = +btn.dataset.goto;
        searchView.clearResults();
        searchView.renderResult(state.search.result, goToPage);
    }
});


///////////////////////////////////////////
/////// RECIPE CONTROLER
///////////////////////////////////////////
const controlRecipe = async () => {
    // Get ID from URL
    const id = window.location.hash.replace('#', '');
    console.log(id);

    if (id) {
        // Prepare UI for Changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe)

        // Highlight selected search item
        if (state.search) searchView.highlightselected(id);

        // Create new recipe object
        state.recipe = new Recipe(id);

        try {
            // get Recipe Data and parse ingredients
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            // Calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();

            // Render recipe
            clearLoader();
            recipeView.renderRecipe(state.recipe);
        } catch (err) {
            console.log('Error getting Recipe!');
        }

    }
};

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

// Handling the recipe Buttons clicks
elements.recipe.addEventListener('click', el => {
    if (el.target.matches('.btn-decrease, .btn-decrease *')) {
        // decrease Button is clicked
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    } else if (el.target.matches('.btn-increase, .btn-increase *')) {
        // Increase gutton is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    }

    console.log(state.recipe);
})




























