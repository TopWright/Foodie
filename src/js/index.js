import Search from "./models/Search";
import Recipe from "./models/Recipe";
import List from "./models/List";
import Likes from "./models/Likes";
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
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
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
            );

        } catch (err) {
            console.log('Error getting Recipe!');
        }

    }
};

['hashchange'].forEach(event => window.addEventListener(event, controlRecipe));

///////////////////////////////////////////
/////// List CONTROLER
///////////////////////////////////////////

const controlList = () => {
    // Create a new List if Theres none yet
    if (!state.list) state.list = new List();

    // Add each ingredients to the list and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}

// Handle Delete and Update list item event
elements.shopping.addEventListener('click', el => {
    const id = el.target.closest('.shopping__item').dataset.itemid

    // Handle the Delete event
    if (el.target.matches('.shopping__delete, .shopping__delete *')) {
        // Delete from state
        state.list.deleteItem(id);

        // Delete from UI
        listView.deleteItem(id);

        // Handle Count Update
    } else if (e.target.matches('.shopping__list-value')) {
        const val = parseInt(e.target.value, 10);
        state.list.updateCount(id, val)
    }
})


///////////////////////////////////////////
/////// LIKE CONTROLER
///////////////////////////////////////////
state.likes = new Likes();
likesView.toggleLikeMenu(state.likes.getNumLikes());

const controlLike = () => {
    if (!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;

    // User has NOT yet liked current recipe
    if (!state.likes.isLiked(currentID)) {
        // Add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );

        // Toggle the like button
        likesView.toggleLikeBtn(true);

        // // Add like to UI list
        likesView.renderLike(newLike);

        // User HAS liked current recipe
    } else {
        // Remove like from the state
        state.likes.deleteLike(currentID);

        // // Toggle the like button
        likesView.toggleLikeBtn(false);

        // // Remove like from UI list
        likesView.deleteLike(currentID);

    }
    likesView.toggleLikeMenu(state.likes.getNumLikes());
};


// Restore liked recipes on page load
window.addEventListener('load', () => {
    state.likes = new Likes();

    // Restore likes
    state.likes.readStorage();

    // Toggle like menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    // Render the existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like));
});


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
    } else if (el.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        // Add ingredient to shopping list
        controlList();
    } else if (el.target.matches('.recipe__love, .recipe__love *')) {
        // Like controller
        controlLike();
    }

})




























