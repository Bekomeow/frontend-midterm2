// const apiKey = "e457d68d84be4a02ba0c7ed87e0f9fbe";
// const apiKey = "9aa9f5b7d1ca4ccfaa215362766819e4";
const apiKey = "80c8d532f05242ebbf727d0c02a69d50";
const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
const favoritesGrid = document.getElementById("favoritesGrid");
const recipeModal = document.getElementById("recipeModal");
const recipeDetails = document.getElementById("recipeDetails");

function removeFavorite(id) {
    const index = favorites.indexOf(id);
    if (index !== -1) {
        favorites.splice(index, 1);
        localStorage.setItem("favorites", JSON.stringify(favorites));
        displayFavorites();
    }
}

function displayFavorites() {
    favoritesGrid.innerHTML = "";
    favorites.forEach(id => {
        fetch(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${apiKey}`)
            .then(response => response.json())
            .then(data => {
                const card = document.createElement("div");
                card.className = "recipe-card";
                card.innerHTML = `
                    <img src="${data.image}" alt="${data.title}">
                    <h3>${data.title}</h3>
                    <button class="view-btn" onclick="viewRecipe(${id})">View Recipe</button>
                    <button class="favorite-btn favorite" onclick="removeFavorite(${id})">
                        <i class="fas fa-star"></i> Remove
                    </button>
                `;
                favoritesGrid.appendChild(card);
            })
            .catch(error => console.error("Error fetching favorite recipe:", error));
    });
}

function viewRecipe(id) {
    fetch(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            recipeDetails.innerHTML = `
                <h2>${data.title}</h2>
                <img src="${data.image}" alt="${data.title}">
                <h3>Ingredients:</h3>
                <ol>${data.extendedIngredients.map(ingredient => `<li>${ingredient.original}</li>`).join("")}</ol>
                <h3>Instructions:</h3>
                <div>${data.instructions || "No instructions available."}</div>
                <h3>Summary:</h3>
                <p class="recipe-summary">${data.summary}</p>
            `;
            recipeModal.style.display = "block";
        })
        .catch(error => console.error("Error fetching recipe details:", error));
}

function closeRecipeModal() {
    recipeModal.style.display = "none";
}

displayFavorites();
