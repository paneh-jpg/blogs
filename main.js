const blogsList = document.querySelector("#blogs-list");
const searchInput = document.querySelector("#search-input");
const descBtn = document.querySelector("#desc-btn");
const ascBtn = document.querySelector("#asc-btn");

const baseApi = "https://dummyjson.com";

function build(post) {
  const li = document.createElement("li");
  li.className = "blog";

  const h2 = document.createElement("h2");
  h2.className = "font-semibold text-2xl";
  h2.textContent = post.title;

  const p = document.createElement("p");
  p.className = "mt-2 font-normal";
  p.textContent = post.body;

  const actions = document.createElement("div");
  actions.className = "mt-3 flex justify-between";

  const viewAllBtn = document.createElement("button");
  viewAllBtn.className = "view-all-btn";
  viewAllBtn.textContent = " Xem chi tiết";

  const actionsRight = document.createElement("div");
  actionsRight.className = "";

  const editBtn = document.createElement("button");
  editBtn.className = "edit-btn";
  editBtn.textContent = "Sửa";

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.textContent = "Xóa";

  li.append(h2, p, actions);
  actions.append(viewAllBtn, actionsRight);
  actionsRight.append(editBtn, deleteBtn);

  blogsList.append(li);
}

function renderBlogs(posts) {
  posts.forEach((post) => {
    build(post);
  });
}

async function getBlogs() {
  const url = `${baseApi}/posts?sortBy=id&order=desc`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new error(`Response status: ${response.status}`);
    }
    const result = await response.json();
    blogsList.innerHTML = "";
    renderBlogs(result.posts);
  } catch (error) {
    console.error(error.message);
  }
}

function searchBlogs() {
  searchInput.oninput = (e) => {
    e.preventDefault();
    const key = e.target.value;

    (async () => {
      const url = `${baseApi}/posts/search/?q=${key}`;
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new error(`Response status: ${response.status}`);
        }
        const result = await response.json();
        blogsList.innerHTML = "";
        renderBlogs(result.posts);
      } catch (error) {
        console.error(error.message);
      }
    })();
  };
}

function sortBlogs() {
  ascBtn.onclick = () => {
    descBtn.classList.remove("active");
    ascBtn.classList.add("active");

    (async () => {
      const url = `${baseApi}/posts?sortBy=id&order=asc`;
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new error(`Response status: ${response.status}`);
        }
        const result = await response.json();
        blogsList.innerHTML = "";
        renderBlogs(result.posts);
      } catch (error) {
        console.error(error.message);
      }
    })();
  };

  descBtn.onclick = () => {
    ascBtn.classList.remove("active");
    descBtn.classList.add("active");

    (async () => {
      const url = `${baseApi}/posts?sortBy=id&order=desc`;
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new error(`Response status: ${response.status}`);
        }
        const result = await response.json();
        blogsList.innerHTML = "";
        renderBlogs(result.posts);
      } catch (error) {
        console.error(error.message);
      }
    })();
  };
}

getBlogs();
searchBlogs();
sortBlogs();
