const BASE_URL = "https://dummyjson.com";

const app = {
  _query: {
    order: "desc",
    limit: 10,
    page: 1,
    total: 1,
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
        url = `${BASE_URL}/posts/search?q=${this._query.q}&sortBy=id&order=${this._query.order}&limit=${this._query.limit}&skip=${skip}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Fail to fetch /posts");
      }
      const data = await response.json();
      const pageNumber = Math.ceil(data.total / this._query.limit);
      this.renderPaginate(pageNumber);

      if (data.posts.length === 0) {
        const postListEl = document.querySelector("#js-post-list");
        postListEl.innerHTML = `<h2 class="text-center text-gray-800 py-3 text-lg">No blogs matching your search!</h2>`;
        return;
      }

      this.renderPosts(data.posts);
    } catch (error) {
      this.renderError(error.message);
    } finally {
      this.renderLoading(false);
    }
  },

  renderPaginate(pageNumber) {
    const paginateListEl = document.querySelector(".paginate");
    paginateListEl.innerHTML = "";
    for (let page = 1; page <= pageNumber; page++) {
      const active =
        this._query.page === page ? "bg-green-600 text-[#FFF]" : "";
      paginateListEl.innerHTML += `<button class="js-paginate pagination ${active}">${page}</button>`;
    }
  },

  renderError(error) {
    const errorEl = document.querySelector(".js-loading-error");
    errorEl.innerHTML = `<h2 class="text-left text-gray-800 pt-4 pb-2 text-lg">${error}</h2>`;
  },

  renderLoading(status = true) {
    const errorEl = document.querySelector(".js-loading-error");
    errorEl.innerHTML = status
      ? `<h2 class="text-left text-gray-800 pt-4 pb-2 text-lg">Loading ...</h2>`
      : "";
  },

  renderPosts(posts) {
    const postListEl = document.querySelector("#js-post-list");
    postListEl.innerHTML = posts
      .map((post) => {
        return `     <div class="blog">
              <h2 class="font-semibold text-2xl">${this.escapeHTML(
                post.title
              )}</h2>
              <p class="blog-desc mt-2 font-normal">${this.escapeHTML(
                post.body
              )}</p>
              <div class="mt-3 flex justify-between">
                <button class="view-all-btn">Xem chi tiết</button>
                <div>
                  <button class="edit-btn">Sửa</button>
                  <button class="delete-btn">Xóa</button>
                </div>
              </div>
            </div>`;
      })
      .join("");
  },

  escapeHTML(text) {
    return text
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  },

  search() {
    const inputEL = document.querySelector("#js-search-input");
    inputEL.addEventListener(
      "input",
      this.debounce((e) => {
        const keyword = e.target.value;
        this._query.q = keyword;
        this._query.page = 1;
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
        callback.apply(this, args);
      }, timeout);
    };
  },

  sort() {
    const btnList = document.querySelectorAll(".js-sort-btn");
    btnList.forEach((btn) => {
      btn.addEventListener("click", () => {
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
    const paginateEl = document.querySelector(".paginate");

    paginateEl.onclick = (e) => {
      const page = +e.target.innerText;

      this._query.page = page;
      this.getPosts();
    };
  },
};

app.init();
