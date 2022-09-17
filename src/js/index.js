import Search from "./models/Search";
import * as searchView from './views/searchView';
import { elements, renderLoader, clearLoader } from "./views/base";

/** Global state of the app
 * - Search object
 * - Current recipe object
 * - Shopping list object
 * - Liked recipe
*/

const state = {};

// Get Search Query from HTML
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

        // 4. search for recipes
        await state.search.getResults();

        // 5. Render UI
        clearLoader();
        searchView.renderResult(state.search.result);

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