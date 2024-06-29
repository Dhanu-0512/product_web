function toggleMenu() {
  const navLinks = document.getElementById("navLinks");
  navLinks.classList.toggle("active");
}

function closeMenu() {
  const navLinks = document.getElementById("navLinks");
  navLinks.classList.remove("active");
}

document.addEventListener("DOMContentLoaded", function () {
  const filtersLabel = document.getElementById("filtersLabel");
  const productFilter = document.getElementById("filterCategory");

  filtersLabel.addEventListener("click", function () {
    productFilter.classList.toggle("filterCategory");
  });
});

let productsData = [];
let filteredProductsData = [];
let searchResultsData = [];
let visibleProducts = 10;
let sortByPriceAsc = true;

const loadMoreBtn = document.getElementById("loadMoreBtn");
const searchInput = document.getElementById("searchInput");
const productsContainer = document.getElementById("productsContainer");
const sortButton = document.getElementById("sortButton");

const filtersLabel = document.getElementById("filtersLabel");
const filterCategory = document.getElementById("filterCategory");
const checkboxContainer = document.getElementById("checkboxContainer");

const filters = [
  { id: "men's clothing", name: "Men's clothing" },
  { id: "women's clothing", name: "Women's clothing" },
  { id: "electronics", name: "Electronics" },
  { id: "jewelery", name: "Jewelery" },
];

filters.forEach((filter) => {
  const checkboxWrap = document.createElement("div");
  checkboxWrap.className = "checkboxWrap";
  checkboxWrap.innerHTML = `
    <input type="checkbox" id="${filter.id}" data-filter="${filter.id}">
    <label for="${filter.id}">${filter.name}</label>
  `;
  checkboxContainer.appendChild(checkboxWrap);
});

function fetchMoreProducts() {
  const remainingProducts = searchResultsData.slice(
    visibleProducts,
    visibleProducts + 10
  );
  renderProducts(remainingProducts, true);
  visibleProducts += 10;

  if (visibleProducts >= searchResultsData.length) {
    loadMoreBtn.style.display = "none";
  }
}

// Event listener for Load More button
loadMoreBtn.addEventListener("click", function () {
  fetchMoreProducts();
});

// Event listener for Sort by Price button
sortButton.addEventListener("click", function () {
  sortByPriceAsc = !sortByPriceAsc;
  sortProductsByPrice();
});

function renderProducts(products, append) {
  if (!append) {
    productsContainer.innerHTML = "";
  }

  if (products.length === 0) {
    productsContainer.innerHTML =
      '<p class="no-data-message">No data found !!!</p>';
    loadMoreBtn.style.display = "none";
    updateProductCount(products);
    return;
  }

  products.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.className = "product-card";
    const truncatedDescription =
      product.description.length > 100
        ? product.description.substring(0, 100) + "..."
        : product.description;

    const highlightedTitle = highlightSearchTerm(
      product.title,
      searchInput.value.trim().toLowerCase()
    );

    productCard.innerHTML = `
      <img src="${product.image}" alt="${product.title}" class="product-image">
      <div class="product-info">
        <h4 class="product-title">${highlightedTitle}</h4>
        <p class="product-price">$${product.price}</p>
        <p class="product-description" data-full-description="${
          product.description
        }">
          ${truncatedDescription}
        </p>
        ${
          product.description.length > 100
            ? '<button class="show-more-btn">Show more</button>'
            : ""
        }
      </div>
    `;

    const showMoreButton = productCard.querySelector(".show-more-btn");
    if (showMoreButton) {
      showMoreButton.addEventListener("click", function () {
        toggleDescription(this);
      });
    }

    productsContainer.appendChild(productCard);
  });

  updateProductCount(searchResultsData);
}

// Highlight search term in product title
function highlightSearchTerm(title, searchTerm) {
  if (!searchTerm) return title;
  const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, "gi");
  return title.replace(regex, '<span class="highlight">$1</span>');
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Function to filter products based on search input
function filterSearchProducts() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  searchResultsData = filteredProductsData.filter((product) =>
    product.title.toLowerCase().includes(searchTerm)
  );
  loadMoreBtn.style.display = "none";
  renderProducts(searchResultsData.slice(0, visibleProducts));
  updateProductCount(searchResultsData);
}

// Event listener for keyup event on search input
searchInput.addEventListener("keyup", function () {
  filterSearchProducts();
});

// Function to sort products by price
function sortProductsByPrice() {
  if (sortByPriceAsc) {
    filteredProductsData.sort((a, b) => a.price - b.price);
  } else {
    filteredProductsData.sort((a, b) => b.price - a.price);
  }
  renderProducts(filteredProductsData.slice(0, visibleProducts));
}

function filterCategoryProducts() {
  const checkedFilters = Array.from(
    document.querySelectorAll('input[type="checkbox"]:checked')
  ).map((checkbox) => checkbox.getAttribute("data-filter"));

  if (checkedFilters.length > 0) {
    filteredProductsData = productsData.filter((product) => {
      return checkedFilters.includes(product.category.toLowerCase());
    });
  } else {
    filteredProductsData = productsData;
  }

  searchResultsData = filteredProductsData;

  if (searchResultsData.length <= visibleProducts) {
    loadMoreBtn.style.display = "none";
  } else {
    loadMoreBtn.style.display = "block";
  }

  renderProducts(searchResultsData.slice(0, visibleProducts));
  updateProductCount(searchResultsData);
}

// Event listener for checkbox changes
checkboxContainer.addEventListener("change", function (event) {
  if (event.target.matches('input[type="checkbox"]')) {
    filterCategoryProducts();
  }
});

// Initial fetch and render of products on page load
document.addEventListener("DOMContentLoaded", function () {
  fetch("https://fakestoreapi.com/products")
    .then((response) => response.json())
    .then((data) => {
      productsData = data;
      filteredProductsData = data;
      searchResultsData = data;
      renderProducts(productsData.slice(0, visibleProducts));
      updateProductCount(productsData);
    })
    .catch((error) => {
      console.error("Error fetching products:", error);
    });
});

function toggleDescription(button) {
  const productCard = button.closest(".product-card");
  const description = productCard.querySelector(".product-description");
  const fullDescription = description.getAttribute("data-full-description");
  const isExpanded = description.classList.toggle("show-full-description");

  if (isExpanded) {
    description.textContent = fullDescription;
    button.textContent = "Show less";
  } else {
    description.textContent = fullDescription.substring(0, 100) + "...";
    button.textContent = "Show more";
  }
}

function updateProductCount(products) {
  const productCountElement = document.getElementById("productCount");
  productCountElement.textContent = `${products.length} Results`;
}
