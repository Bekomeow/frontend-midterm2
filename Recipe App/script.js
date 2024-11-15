// const apiKey = "e457d68d84be4a02ba0c7ed87e0f9fbe";
// const apiKey = "9aa9f5b7d1ca4ccfaa215362766819e4";
const apiKey = "80c8d532f05242ebbf727d0c02a69d50";
const recipeGrid = document.getElementById("recipeGrid");
const favoritesGrid = document.getElementById("favoritesGrid");
const searchInput = document.getElementById("searchInput");
const recipeModal = document.getElementById("recipeModal");
const recipeDetails = document.getElementById("recipeDetails");
const autocompleteResults = document.getElementById("autocomplete_results");

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

const searchButton = document.getElementById("searchButton");

searchButton.addEventListener("click", () => {
    const query = searchInput.value.trim();
    if (query) {
        fetchRecipes(query);
        autocompleteSuggestions.innerHTML = "";
    }
});

searchInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
        searchButton.click();
    }
});

function fetchRecipes(query) {
    fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${query}&apiKey=${apiKey}&number=10`)
        .then(response => response.json())
        .then(data => displayRecipes(data.results))
        .catch(error => console.error("Error fetching recipes:", error));
}

function fetchAutocomplete(query) {
    fetch(`https://api.spoonacular.com/recipes/autocomplete?query=${query}&apiKey=${apiKey}&number=5`)
        .then(response => response.json())
        .then(data => displayAutocomplete(data))
        .catch(error => console.error("Error fetching autocomplete:", error));
}


function displayRecipes(recipes) {
    recipeGrid.innerHTML = "";
    recipes.forEach(recipe => {
        const card = document.createElement("div");
        card.className = "recipe-card";
        const isFavorite = favorites.includes(recipe.id);
        card.innerHTML = `
            <img src="https://spoonacular.com/recipeImages/${recipe.id}-312x231.jpg" alt="${recipe.title}">
            <h3>${recipe.title}</h3>
            <button class="view-btn" onclick="viewRecipe(${recipe.id})">View Recipe</button>
            <button class="favorite-btn ${isFavorite ? 'favorite' : ''}" onclick="addFavorite(${recipe.id}, this)">
                <i class="fas fa-star"></i>
            </button>
        `;
        recipeGrid.appendChild(card);
    });
}

function viewRecipe(id) {
    fetch(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            recipeDetails.innerHTML = `
                <h2>${data.title}</h2>
                <img src="${data.image}" alt="${data.title}">
                <h3>Ingredients:</h3>
                <ol>${data.extendedIngredients.map(ingredient => `<li>${ingredient.original}</li>`).join("")}</ol>
                <h3>Instructions:</h3>
                <div>${data.instructions}</div>
                <h3>Summary:</h3>
                <p class="recipe-summary">${data.summary}</p>
            `;
            recipeModal.style.display = "block";
        })
        .catch(error => console.error("Error fetching recipe details:", error));
}

function addFavorite(id, element) {
    const index = favorites.indexOf(id);
    if (index === -1) {
        favorites.push(id);
        element.classList.add("favorite");
    } else {
        favorites.splice(index, 1);
        element.classList.remove("favorite");
    }
    localStorage.setItem("favorites", JSON.stringify(favorites));
}


async function autocomplete() {
    const query = searchInput.value;
    if (query.length < 2) {
        autocompleteResults.innerHTML = "";
        return;
    }
    
    try {
        const response = await fetch(`https://api.spoonacular.com/recipes/autocomplete?query=${query}&apiKey=${apiKey}&number=10`);
        const suggestions = await response.json();

        autocompleteResults.innerHTML = "";
        suggestions.forEach(suggestion => {
            const item = document.createElement("div");
            item.textContent = suggestion.title;
            item.addEventListener("click", () => {
                searchInput.value = suggestion.title;
                autocompleteResults.innerHTML = "";
                getRecipes();
            });
            autocompleteResults.appendChild(item);
        });
    } catch (error) {
        console.error("Error fetching autocomplete data:", error);
    }
}

document.querySelector(".close").addEventListener("click", () => {
    recipeModal.style.display = "none";
});

function hideAutocompleteResults(event) {
    if (!autocompleteResults.contains(event.target) && event.target !== searchInput) {
        autocompleteResults.innerHTML = "";
    }
}

document.addEventListener("click", hideAutocompleteResults);
searchInput.addEventListener("input", autocomplete);
