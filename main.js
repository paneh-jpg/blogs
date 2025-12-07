const BASE_URL = "https://dummyjson.com/";

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
    this.removePost();
    this.close();
  },

  async getPosts() {
    try {
      this.renderLoading(".js-loading");
      const skip = (this._query.page - 1) * this._query.limit;
      let url = `${BASE_URL}posts?sortBy=id&order=${this._query.order}&limit=${this._query.limit}&skip=${skip}`;
      if (this._query.q) {
        url = `${BASE_URL}posts/search?q=${this._query.q}&sortBy=id&order=${this._query.order}&limit=${this._query.limit}&skip=${skip}`;
      }
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Fail to fetch ${url}`);
      }
      const data = await response.json();
      this.renderPosts(data.posts);
      const pageNumber = Math.ceil(data.total / this._query.limit);
      this.renderPaginate(pageNumber);
    } catch (error) {
      this.renderError(".js-error", error.message);
    } finally {
      this.renderLoading(".js-loading", false);
    }
  },

  renderPosts(posts) {
    const postListEl = document.querySelector(".js-post-list");
    if (posts.length === 0) {
      postListEl.classList.add("notification");
      postListEl.innerHTML = "No blog matching your search!";
      return;
    }
    postListEl.classList.remove("notification");
    postListEl.innerHTML = posts
      .map(
        (post) => `<div class="post" data-id = ${post.id}>
              <h2 class="font-semibold text-lg sm:text-xl md:text-2xl">${this.sanitizeText(
                post.title
              )}</h2>
              <p class="blog-desc mt-2 font-normal">${this.sanitizeText(
                post.body
              )}</p>
              <div class="mt-3 flex justify-between">
                <button class="js-view-all-btn">Xem chi tiết</button>
                <div>
                  <button class="js-edit-btn "><i class="fa-solid fa-pen text-[11px] mr-0"></i> Sửa</button>
                  <button class="js-delete-btn "><i class="fa-solid fa-trash text-[13px] mr-1"></i>Xóa</button>
                </div>
              </div>
            </div>`
      )
      .join("");
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

  renderLoading(element, status = true) {
    const loadingEl = document.querySelector(element);
    if (status) {
      loadingEl.textContent = "Loading...";
      loadingEl.classList.add("notification");
    } else {
      loadingEl.textContent = "";
      loadingEl.classList.remove("notification");
    }
  },

  renderError(element, error) {
    const errorEl = document.querySelector(element);
    // errorEl.classList.add("notification");
    errorEl.textContent = error;
  },

  sanitizeText(text) {
    return DOMPurify.sanitize(text);
  },

  search() {
    const inputSearchEl = document.querySelector(".js-search-input");

    inputSearchEl.addEventListener(
      "input",
      this.debounce((e) => {
        this._query.q = e.target.value;
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
      btn.onclick = () => {
        this._query.page = 1;
        const sortValue = btn.dataset.sort;
        const activeBtn = document.querySelector(".sort-active");

        if (activeBtn) {
          activeBtn.classList.remove("sort-active");
        }

        btn.classList.add("sort-active");
        this._query.order = sortValue;
        this.getPosts();
      };
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
    const url = `${BASE_URL}posts/${id}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Fail to fetch ${url}`);
    }

    return await response.json();
  },

  renderSinglePost() {
    const postListEl = document.querySelector(".js-post-list");
    const titleEl = document.querySelector(".js-modal-content h2");
    const bodyEl = document.querySelector(".js-modal-content p");
    const extraEl = document.querySelector("#modal-extra");

    postListEl.addEventListener("click", async (e) => {
      const viewAllBtn = e.target.closest(".js-view-all-btn");
      if (!viewAllBtn) return;

      const post = viewAllBtn.closest(".post");
      const id = post.dataset.id;
      extraEl.innerHTML = "";
      this.open();
      titleEl.innerHTML = "Loading...";
      try {
        const data = await this.getSinglePost(id);

        titleEl.innerHTML = this.sanitizeText(data.title);
        bodyEl.innerHTML = this.sanitizeText(data.body);
      } catch (error) {
        this.renderError(".js-modal-content h2", error.message);
      }
    });
  },

  renderForm(defaultTitle = "", defaultBody = "", onSubmit) {
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

    const errorEl = document.createElement("p");
    errorEl.className = "text-red-500";

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Save";
    saveBtn.className =
      "w-[100px] cursor-pointer bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800";

    saveBtn.onclick = () => {
      const title = titleInput.value.trim();
      const body = bodyTextarea.value.trim();

      if (!title || !body) {
        errorEl.innerHTML = "Title and Content cannot be empty";
        if (!form.contains(errorEl)) {
          form.insertBefore(errorEl, saveBtn);
        }
        return;
      }

      const newData = { title, body };
      if (onSubmit) onSubmit(newData);
    };

    form.append(titleInput, bodyTextarea, saveBtn);
    return form;
  },

  async createPost(data) {
    const url = `${BASE_URL}posts/add`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        userId: 5,
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
      extraEl.innerHTML = "";
      this.open();
      titleEl.innerHTML = "Add new Blog";
      bodyEl.innerHTML = "";

      const form = this.renderForm("", "", async (data) => {
        try {
          const created = await this.createPost(data);

          this.close();
          const postListEl = document.querySelector(".js-post-list");
          const newPostHTML = `<div class="post" data-id="${created.id}">
            <h2 class="font-semibold text-lg sm:text-xl md:text-2xl">${this.sanitizeText(
              created.title
            )}</h2>
            <p class="blog-desc mt-2 font-normal">${this.sanitizeText(
              created.body || ""
            )}</p>
            <div class="mt-3 flex justify-between">
              <button class="js-view-all-btn">Xem chi tiết</button>
              <div>
                  <button class="js-edit-btn "><i class="fa-solid fa-pen text-[11px] mr-0"></i> Sửa</button>
                  <button class="js-delete-btn "><i class="fa-solid fa-trash text-[13px] mr-1"></i>Xóa</button>
              </div>
            </div>
          </div>`;
          postListEl.insertAdjacentHTML("afterbegin", newPostHTML);
        } catch (error) {
          this.renderError(".js-modal-content", error.message);
        }
      });
      extraEl.appendChild(form);
    });
  },

  async updatePost(id, data) {
    const url = `${BASE_URL}posts/${id}`;
    const response = await fetch(url, {
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
    const titleEl = document.querySelector(".js-modal-content h2");
    const bodyEl = document.querySelector(".js-modal-content p");
    const extraEl = document.querySelector("#modal-extra");

    postsListEl.addEventListener("click", async (e) => {
      const editBtn = e.target.closest(".js-edit-btn");
      if (!editBtn) return;

      const post = editBtn.closest(".post");
      const id = post.dataset.id;

      this.open();

      titleEl.innerHTML = "Edit Blog";
      bodyEl.innerHTML = "";
      extraEl.innerHTML = "Loading...";
      try {
        extraEl.innerHTML = "";
        const oldData = await this.getSinglePost(id);

        const form = this.renderForm(
          oldData.title,
          oldData.body,
          async (newData) => {
            try {
              await this.updatePost(id, newData);
              this.close();

              const titleInList = post.querySelector("h2");
              const bodyInList = post.querySelector(".blog-desc");

              titleInList.textContent = this.sanitizeText(newData.title);
              bodyInList.textContent = this.sanitizeText(newData.body);
            } catch (error) {
              this.renderError("#modal-extra", error.message);
            }
          }
        );
        extraEl.append(form);
      } catch (error) {
        this.renderError(".js-modal-content h2", error.message);
      }
    });
  },

  async deletePost(id) {
    const url = `${BASE_URL}posts/${id}`;
    const response = await fetch(url, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Fail to delete post on id: ${id}`);
    }

    return await response.json();
  },

  renderConfirmForm(message, onConfirm, onCancel) {
    const form = document.createElement("div");
    form.className = "form-confirm flex flex-col gap-4 p-3 text-xl";

    const msg = document.createElement("p");
    msg.className = "text-gray-800 text-lg";
    msg.textContent = message;

    const btnGroup = document.createElement("div");
    btnGroup.className = "flex justify-end gap-3";

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.className =
      "cursor-pointer px-2 py-1 border border-gray-400 rounded hover:bg-gray-200";
    cancelBtn.onclick = () => {
      if (onCancel) {
        onCancel();
      }
    };

    const confirmBtn = document.createElement("button");
    confirmBtn.textContent = "Delete";
    confirmBtn.className =
      "cursor-pointer px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700";

    confirmBtn.onclick = () => {
      if (onConfirm) {
        onConfirm();
      }
    };
    btnGroup.append(cancelBtn, confirmBtn);

    form.append(msg, btnGroup);
    return form;
  },

  removePost() {
    const postsListEl = document.querySelector(".js-post-list");
    const modalContentEl = document.querySelector(".js-modal-content");
    const titleEl = modalContentEl.querySelector("h2");
    const bodyEl = modalContentEl.querySelector("p");
    const extraEl = document.querySelector("#modal-extra");

    postsListEl.addEventListener("click", (e) => {
      const deleteBtn = e.target.closest(".js-delete-btn");
      console.log(deleteBtn);

      if (!deleteBtn) return;

      const post = deleteBtn.closest(".post");
      const id = post.dataset.id;
      this.open();

      titleEl.innerHTML = "Delete Blog";
      bodyEl.innerHTML = "";
      extraEl.innerHTML = "";

      const form = this.renderConfirmForm(
        "Do you sure you want to delete?",
        async () => {
          try {
            await this.deletePost(id);

            post.remove();

            this.close();
          } catch (error) {
            this.renderError(".form-confirm", error.message);
            setTimeout(() => {
              this.close();
            }, 2000);
          }
        },
        () => this.close()
      );

      extraEl.appendChild(form);
    });
  },

  open() {
    const modalEl = document.querySelector(".js-modal");
    modalEl.classList.add("show");
  },

  close() {
    const modalEl = document.querySelector(".js-modal");
    const closeModalEl = document.querySelector(".js-close-modal");
    closeModalEl.onclick = () => {
      modalEl.classList.remove("show");
    };

    modalEl.addEventListener("click", (e) => {
      if (e.target === modalEl) {
        modalEl.classList.remove("show");
      }
    });

    modalEl.classList.remove("show");
  },
};

app.init();
