const blogsList = document.querySelector("#blogs-list");
const searchInput = document.querySelector("#search-input");
const descBtn = document.querySelector("#desc-btn");
const ascBtn = document.querySelector("#asc-btn");

const modal = document.querySelector("#modal");
const modalTitle = document.querySelector("#modal-content h2");
const modalBody = document.querySelector("#modal-content p");
const modalCloseBtn = document.querySelector(".close-modal");
const modalTags = document.querySelector("#modal-tags");

const modalUser = document.querySelector("#modal-user");

const baseApi = "https://dummyjson.com";
let isFirstClick = true;

function buildBlog(post) {
  const li = document.createElement("li");
  li.className = "blog";

  li.innerHTML = `    <h2 class="font-semibold text-2xl">${post.title}</h2>
    <p class="blog-desc mt-2 font-normal">${post.body}</p>
    <div class="mt-3 flex justify-between">
      <button class="view-all-btn">Xem chi tiết</button>
      <div>
        <button class="edit-btn">Sửa</button>
        <button class="delete-btn">Xóa</button>
      </div>
    </div>`;

  li.querySelector(".view-all-btn").addEventListener("click", () => {
    loadBlogDetail(post.id);
  });

  return li;
}

function showModalLoading() {
  modalTitle.textContent = "Loading...";
  modalBody.textContent = "Đang tải dữ liệu bài viết...";
}

async function loadBlogDetail(id) {
  openModal();
  showModalLoading();

  const url = `${baseApi}/posts/${id}`;
  const data = await fetchBlogs(url);

  const user = await fetchUser(data.userId);
  const fullName = `${user.firstName} ${user.lastName}`;

  if (!data) return;
  if (isFirstClick) {
    isFirstClick = false;

    setTimeout(() => {
      modalTitle.textContent = data.title;
      modalBody.textContent = data.body;

      modalTags.textContent = data.tags.join(", ");
      modalUser.textContent = fullName;
    }, 1000);
  } else {
    modalTitle.textContent = data.title;
    modalBody.textContent = data.body;

    modalTags.textContent = data.tags.join(", ");
    modalUser.textContent = fullName;
  }
}

async function fetchUser(id) {
  const url = `https://dummyjson.com/users/${id}`;
  const data = await fetchBlogs(url);
  return data;
}

function clearBlogs() {
  blogsList.innerHTML = "";
}

function renderBlogs(posts) {
  clearBlogs();
  if (posts.length > 0) {
    posts.forEach((post) => {
      const newPost = buildBlog(post);
      blogsList.append(newPost);
    });
  } else {
    blogsList.innerHTML = `<h2 class="text-center text-gray-500 py-6 text-lg">No blogs matching your search!</h2>`;
  }
}

async function fetchBlogs(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Response status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.log(error.message);
    return null;
  }
}

async function getBlogs(order = "desc") {
  const url = `${baseApi}/posts?sortBy=id&order=${order}`;
  const data = await fetchBlogs(url);
  if (data.posts) renderBlogs(data.posts);
}

function searchBlogs() {
  searchInput.oninput = async (e) => {
    const key = e.target.value.trim();

    if (!key) return getBlogs("desc");

    const url = `${baseApi}/posts/search/?q=${key}`;
    const data = await fetchBlogs(url);
    if (data.posts) renderBlogs(data.posts);
  };
}

function sortBlogs() {
  ascBtn.addEventListener("click", () => {
    searchInput.value = "";
    descBtn.classList.remove("active");
    ascBtn.classList.add("active");
    getBlogs("asc");
  });

  descBtn.addEventListener("click", () => {
    searchInput.value = "";
    ascBtn.classList.remove("active");
    descBtn.classList.add("active");
    getBlogs("desc");
  });
}

function getScrollbarWidth() {
  const box = document.createElement("div");

  Object.assign(box.style, {
    position: "absolute",
    top: "-9999px",
    overflow: "scroll",
  });

  document.body.append(box);

  const scrollbarWidth = box.offsetWidth - box.clientWidth;
  return scrollbarWidth;
}

function openModal() {
  modal.classList.add("show");
  document.body.classList.add("no-scroll");
  document.body.style.paddingRight = getScrollbarWidth() + "px";
}

function closeModal() {
  modal.classList.remove("show");
  document.body.classList.remove("no-scroll");
  document.body.style.paddingRight = "";
}

modalCloseBtn.addEventListener("click", closeModal);

modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

document.onkeydown = (e) => {
  if (e.key === "Escape") closeModal();
};

getBlogs();
searchBlogs();
sortBlogs();
