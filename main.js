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
    this.renderSinglePost();
    this.addPost();
    this.editPost();
    this.close();
    this.deletePostUI();
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
        return `    <div class="post" data-id = ${post.id}>
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
        this._query.page = 1;
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

  async getSinglePost(id) {
    const url = `${BASE_URL}/posts/${id}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Fail to fetch /posts/${id}`);
    }

    return await response.json();
  },

  renderSinglePost() {
    const postsListEl = document.querySelector(".js-post-list");

    const titleEl = document.querySelector(".js-modal-content h2");
    const bodyEl = document.querySelector(".js-modal-content p");

    postsListEl.addEventListener("click", async (e) => {
      const viewAllBtn = e.target.closest(".js-view-all-btn");
      if (!viewAllBtn) return;

      const post = viewAllBtn.closest(".post");
      const id = post.dataset.id;

      this.open();

      titleEl.innerHTML = "Loading...";
      bodyEl.innerHTML = "";

      try {
        const data = await this.getSinglePost(id);
        titleEl.innerHTML = this.sanitizeText(data.title);
        bodyEl.innerHTML = this.sanitizeText(data.body);
      } catch (error) {
        console.log(error);
        titleEl.innerHTML = "Error";
        bodyEl.innerHTML = "Không thể tải bài viết.";
      }
    });
  },

  open() {
    const modal = document.querySelector(".js-modal");
    modal.classList.add("show");
  },

  close() {
    const modal = document.querySelector(".js-modal");
    const closeModalBtn = document.querySelector(".js-close-modal");
    const extraEl = document.querySelector("#modal-extra");

    extraEl.innerHTML = "";
    closeModalBtn.onclick = () => {
      modal.classList.remove("show");
    };
    modal.classList.remove("show");
  },

  buildForm(defaultTitle = "", defaultBody = "", onSubmit) {
    const form = document.createElement("div");
    form.className = "flex flex-col gap-3 p-3";

    const titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.placeholder = "Title...";
    titleInput.value = defaultTitle;
    titleInput.className =
      "border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring focus:border-blue-400";

    const bodyTextarea = document.createElement("textarea");
    bodyTextarea.placeholder = "Content...";
    bodyTextarea.rows = 4;
    bodyTextarea.value = defaultBody;
    bodyTextarea.className =
      "border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring focus:border-blue-400";

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Save";
    saveBtn.className =
      "w-[100px] cursor-pointer bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800";

    saveBtn.onclick = () => {
      const newData = {
        title: titleInput.value.trim(),
        body: bodyTextarea.value.trim(),
      };
      if (onSubmit) onSubmit(newData);
    };

    form.append(titleInput, bodyTextarea, saveBtn);
    return form;
  },

  async createPost(data) {
    const response = await fetch(`${BASE_URL}/posts/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        userId: 1,
      }),
    });

    if (!response.ok) {
      throw new Error("Fail to create post");
    }

    return await response.json();
  },

  addPost() {
    const addBtn = document.querySelector(".js-add-post");
    const modalContentEl = document.querySelector(".js-modal-content");
    const titleEl = modalContentEl.querySelector("h2");
    const bodyEl = modalContentEl.querySelector("p");
    const extraEl = document.querySelector("#modal-extra");

    addBtn.addEventListener("click", () => {
      this.open();

      titleEl.innerHTML = "Add new Blog";
      bodyEl.innerHTML = "";
      extraEl.innerHTML = "";

      const form = this.buildForm("", "", async (data) => {
        try {
          const created = await this.createPost(data);

          this.close();

          const postsListEl = document.querySelector(".js-post-list");
          const newPostHTML = `
          <div class="post" data-id="${created.id}">
            <h2 class="font-semibold text-2xl">${this.sanitizeText(
              created.title
            )}</h2>
            <p class="blog-desc mt-2 font-normal">${this.sanitizeText(
              created.body || ""
            )}</p>
            <div class="mt-3 flex justify-between">
              <button class="js-view-all-btn">Xem chi tiết</button>
              <div>
                <button class="js-edit-btn">Sửa</button>
                <button class="js-delete-btn">Xóa</button>
              </div>
            </div>
          </div>
        `;

          postsListEl.insertAdjacentHTML("afterbegin", newPostHTML);
        } catch (err) {
          console.log(err);
          alert("Lỗi khi thêm bài viết!");
        }
      });

      extraEl.appendChild(form);
    });
  },

  async updatePost(id, data) {
    const response = await fetch(`${BASE_URL}/posts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Fail to update post");
    }

    return await response.json();
  },

  editPost() {
    const postsListEl = document.querySelector(".js-post-list");
    const modalContentEl = document.querySelector(".js-modal-content");
    const titleEl = modalContentEl.querySelector("h2");
    const bodyEl = modalContentEl.querySelector("p");
    const extraEl = document.querySelector("#modal-extra");

    postsListEl.addEventListener("click", async (e) => {
      const editBtn = e.target.closest(".js-edit-btn");
      if (!editBtn) return;

      const postCard = editBtn.closest(".post");
      const id = postCard.dataset.id;

      this.open();

      titleEl.innerHTML = "Edit Blog";
      bodyEl.innerHTML = "";
      extraEl.innerHTML = "Loading...";

      try {
        const oldData = await this.getSinglePost(id);

        extraEl.innerHTML = "";

        const form = this.buildForm(
          oldData.title,
          oldData.body,
          async (newData) => {
            try {
              await this.updatePost(id, newData);

              this.close();
              const titleInList = postCard.querySelector("h2");
              const bodyInList = postCard.querySelector(".blog-desc");

              titleInList.textContent = this.sanitizeText(newData.title);
              bodyInList.textContent = this.sanitizeText(newData.body);
            } catch (err) {
              console.log(err);
              alert("Error updating post!");
            }
          }
        );

        extraEl.appendChild(form);
      } catch (err) {
        console.log(err);
        extraEl.innerHTML = "Unable to load post data.";
      }
    });
  },

  async deletePost(id) {
    const response = await fetch(`${BASE_URL}/posts/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Fail to delete post");
    }

    return await response.json();
  },

  buildConfirmForm(message, onConfirm, onCancel) {
    const form = document.createElement("div");
    form.className = "flex flex-col gap-4 p-3";

    const msg = document.createElement("p");
    msg.className = "text-gray-800 text-lg";
    msg.textContent = message;

    const btnGroup = document.createElement("div");
    btnGroup.className = "flex justify-end gap-3";

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.className =
      "px-4 py-2 border border-gray-400 rounded hover:bg-gray-200";
    cancelBtn.onclick = () => onCancel && onCancel();

    const confirmBtn = document.createElement("button");
    confirmBtn.textContent = "Delete";
    confirmBtn.className =
      "px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700";
    confirmBtn.onclick = () => onConfirm && onConfirm();

    btnGroup.append(cancelBtn, confirmBtn);

    form.append(msg, btnGroup);
    return form;
  },

  deletePostUI() {
    const postsListEl = document.querySelector(".js-post-list");
    const modalContentEl = document.querySelector(".js-modal-content");
    const titleEl = modalContentEl.querySelector("h2");
    const bodyEl = modalContentEl.querySelector("p");
    const extraEl = document.querySelector("#modal-extra");

    postsListEl.addEventListener("click", (e) => {
      const deleteBtn = e.target.closest(".js-delete-btn");
      if (!deleteBtn) return;

      const postCard = deleteBtn.closest(".post");
      const id = postCard.dataset.id;

      this.open();

      titleEl.innerHTML = "Delete Blog";
      bodyEl.innerHTML = "";
      extraEl.innerHTML = "";

      const form = this.buildConfirmForm(
        "Do you sure you want to delete?",
        async () => {
          try {
            await this.deletePost(id);

            postCard.remove();

            this.close();
          } catch (err) {
            console.log(err);
            alert("Không thể xóa bài viết!");
          }
        },
        () => {
          this.close();
        }
      );

      extraEl.appendChild(form);
    });
  },
};

app.init();
