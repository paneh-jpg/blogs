const BASE_URL = "https://dummyjson.com";

const app = {
  _query: {
    q: "",
    order: "desc",
    limit: 10,
    page: 1,
  },

  init() {
    this.getPosts();
    this.search();
    this.sort();
    this.paginate();
  },

  async getPosts() {
    try {
      this.renderLoading();
      const skip = (this._query.page - 1) * this._query.limit;

      let url = `${BASE_URL}/posts?sortBy=id&order=${this._query.order}&limit=${this._query.limit}&skip=${skip}`;
      if (this._query.q) {
        url = `${BASE_URL}/posts/search?q=${this._query.q}?sortBy=id&order=${this._query.order}&limit=${this._query.limit}&skip=${skip}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Fail to fetch ${url}`);
      }
      const data = await response.json();
      const pageNumber = Math.ceil(data.total / this._query.limit);

      this.renderPosts(data.posts);
      this.renderPaginate(pageNumber);
    } catch (error) {
      this.renderError(error.message);
    } finally {
      this.renderLoading(false);
    }
  },

  renderPosts(posts) {
    const postsListEl = document.querySelector(".js-post-list");
    if (posts.length === 0) {
      postsListEl.innerHTML = `<h2 class="text-left text-gray-800 pt-4 pb-2 text-lg">No blog matching your search.</h2>`;
      return;
    }
    postsListEl.innerHTML = posts
      .map((post) => {
        return `    <div class="post" data-index = ${post.id}>
              <h2 class="font-semibold text-2xl">${this.sanitizeText(
                post.title
              )}</h2>
              <p class="blog-desc mt-2 font-normal">${this.sanitizeText(
                post.body
              )}</p>
              <div class="mt-3 flex justify-between">
                <button class="js-view-all-btn">Xem chi tiết</button>
                <div>
                  <button class="js-edit-btn">Sửa</button>
                  <button class="js-delete-btn">Xóa</button>
                </div>
              </div>
            </div>`;
      })
      .join("");
  },

  renderError(error) {
    const errorEl = document.querySelector(".js-error");
    errorEl.innerHTML = `<h2 class="text-left text-gray-800 pt-4 pb-2 text-lg">${error}</h2>`;
  },

  renderLoading(status = true) {
    const loadingEl = document.querySelector(".js-loading");
    loadingEl.innerHTML = status
      ? `<h2 class="text-left text-gray-800 pt-4 pb-2 text-lg">Loading...</h2>`
      : "";
  },

  renderPaginate(pageNumber) {
    const paginateListEl = document.querySelector(".js-paginate");
    paginateListEl.innerHTML = "";
    for (let page = 1; page <= pageNumber; page++) {
      paginateListEl.innerHTML += `<button class="pagination ${
        this._query.page === page ? "paginate-active" : ""
      }">${page}</button>`;
    }
  },

  sanitizeText(text) {
    return text.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  },

  search() {
    const inputSearchEl = document.querySelector(".js-search-input");
    inputSearchEl.addEventListener(
      "input",
      this.debounce((e) => {
        const key = e.target.value;
        this._query.q = key;
        this.getPosts();
      })
    );
  },

  debounce(callback, timeout = 500) {
    let id;
    return (...args) => {
      if (id) {
        clearTimeout(id);
      }

      id = setTimeout(() => {
        callback.apply(null, args);
      }, timeout);
    };
  },

  sort() {
    const btnSort = document.querySelectorAll(".js-sort-btn");
    btnSort.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const sortValue = btn.dataset.sort;
        const btnActive = document.querySelector(".sort-active");

        if (btnActive) {
          btnActive.classList.remove("sort-active");
        }

        btn.classList.add("sort-active");
        this._query.order = sortValue;
        this.getPosts();
      });
    });
  },

  paginate() {
    const paginateListEl = document.querySelector(".js-paginate");
    paginateListEl.addEventListener("click", (e) => {
      const page = +e.target.innerHTML;

      this._query.page = page;
      window.scroll({
        top: 0,
        behavior: "smooth",
      });
      this.getPosts();
    });
  },
};

app.init();
