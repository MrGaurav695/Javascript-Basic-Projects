const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const mealList = document.getElementById('mealList');
const modal = document.getElementById('modal');
const overlay = document.getElementById('overlay');
const mealDetailsContent = document.querySelector('.meal-details-content');
const closeBtn = document.getElementById('recipeCloseBtn');

/* SEARCH */
searchButton.addEventListener('click', performSearch);
searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') performSearch();
});

async function performSearch() {
    const ingredient = searchInput.value.trim();
    if (!ingredient) return;

    mealList.innerHTML = "<p>Loading...</p>";

    try {
        const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`);
        const data = await res.json();
        displayMeals(data.meals);
    } catch {
        mealList.innerHTML = "<p>Error loading data</p>";
    }
}

/* DISPLAY */
function displayMeals(meals) {
    if (!meals) {
        mealList.innerHTML = "<p>No results found</p>";
        return;
    }

    mealList.innerHTML = meals.map(meal => `
        <div class="meal-item" data-id="${meal.idMeal}">
            <img src="${meal.strMealThumb}">
            <h3>${meal.strMeal}</h3>
        </div>
    `).join('');
}

/* CLICK CARD */
mealList.addEventListener('click', async (e) => {
    const card = e.target.closest('.meal-item');
    if (!card) return;

    const id = card.dataset.id;

    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
    const data = await res.json();

    showModal(data.meals[0]);
});

/* MODAL */
function showModal(meal) {
    mealDetailsContent.innerHTML = `
        <h2>${meal.strMeal}</h2>
        <p><b>${meal.strCategory}</b></p>
        <div class="recipe-img">
            <img src="${meal.strMealThumb}">
        </div>
        <p>${meal.strInstructions}</p>
        <a href="${meal.strYoutube}" target="_blank">▶ Watch Video</a>
    `;

    modal.classList.add('active');
    overlay.classList.add('active');
}

closeBtn.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

function closeModal() {
    modal.classList.remove('active');
    overlay.classList.remove('active');
}

/* DEFAULT LOAD */
window.addEventListener('load', () => {
    searchInput.value = "chicken";
    performSearch();
});