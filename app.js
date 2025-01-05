class ProductManager {
  constructor() {
    this.products = [];
    this.currentIndex = 0;
    this.favoriteProducts = new Set(
      JSON.parse(localStorage.getItem("favorites")) || []
    );
    this.currentTranslate = 0;
    this.prevTranslate = 0;
    this.totalSlides = 0;
  }

  async fetchProducts() {
    try {
      const response = await fetch(
        "https://gist.githubusercontent.com/sevindi/5765c5812bbc8238a38b3cf52f233651/raw/56261d81af8561bf0a7cf692fe572f9e1e91f372/products.json"
      );

      this.products = await response.json();
      this.totalSlides = this.products.length;
      this.renderProducts();
    } catch (error) {
      console.error("Ürünler yüklenirken hata oluştu:", error);
    }
  }

  renderProducts() {
    const carouselContent = document.querySelector(".carousel-content");
    carouselContent.innerHTML = "";

    this.products.forEach((product) => {
      const productCard = this.createProductCard(product);
      carouselContent.appendChild(productCard);
    });

    this.updateCarousel();
    this.initDragEvents();
  }

  createProductCard(product) {
    const card = document.createElement("div");
    card.className = "product-card";

    const isFavorite = this.favoriteProducts.has(product.id);

    card.innerHTML = `
        <div class="image-container">
            <a href="${product.url}" target="_blank">
                <img src="${product.img}" alt="${product.name}">
            </a>
            <span class="heart-icon ${isFavorite ? "active" : ""}" data-id="${
      product.id
    }">❤</span>
        </div>
        <div class="product-info">
            <h3>${product.name}</h3>
            <p>${product.price} TL</p>
        </div>
    `;

    card.querySelector(".heart-icon").addEventListener("click", (e) => {
      this.toggleFavorite(product.id);
      e.target.classList.toggle("active");
    });

    return card;
  }

  toggleFavorite(productId) {
    if (this.favoriteProducts.has(productId)) {
      this.favoriteProducts.delete(productId);
    } else {
      this.favoriteProducts.add(productId);
    }
    localStorage.setItem(
      "favorites",
      JSON.stringify([...this.favoriteProducts])
    );
  }

  updateCarousel() {
    const wrapper = document.querySelector(".carousel-content");
    const productCardWidth =
      document.querySelector(".product-card").offsetWidth;

    this.currentTranslate = this.currentIndex * -productCardWidth;

    wrapper.style.transition = "transform 0.8s ease";
    wrapper.style.transform = `translateX(${this.currentTranslate}px)`;
    this.prevTranslate = this.currentTranslate;
  }

  next() {
    const productCardWidth =
      document.querySelector(".product-card").offsetWidth;
    const carouselWidth =
      document.querySelector(".carousel-content").parentElement.offsetWidth;
    const visibleProducts = Math.floor(carouselWidth / productCardWidth);

    const maxIndex = this.totalSlides - visibleProducts + 1;

    if (this.currentIndex < maxIndex) {
      this.currentIndex++;
      this.updateCarousel();

      // Sağ ok butonunun durumunu kontrol et
      const nextButton = document.querySelector(".next");
      if (this.currentIndex >= maxIndex) {
        nextButton.style.opacity = "0.5";
        nextButton.style.cursor = "not-allowed";
      }
    }

    const prevButton = document.querySelector(".prev");
    if (this.currentIndex > 0) {
      prevButton.style.opacity = "1";
      prevButton.style.cursor = "pointer";
    }
  }

  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateCarousel();

      const prevButton = document.querySelector(".prev");
      if (this.currentIndex === 0) {
        prevButton.style.opacity = "0.5";
        prevButton.style.cursor = "not-allowed";
      }

      const nextButton = document.querySelector(".next");
      nextButton.style.opacity = "1";
      nextButton.style.cursor = "pointer";
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const productManager = new ProductManager();
  productManager.fetchProducts();

  document
    .querySelector(".next")
    .addEventListener("click", () => productManager.next());
  document
    .querySelector(".prev")
    .addEventListener("click", () => productManager.prev());
});
