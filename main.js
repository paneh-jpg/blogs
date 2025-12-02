const blogsList = document.querySelector("#blogs-list");
const searchInput = document.querySelector("#search-input");
const descBtn = document.querySelector("#desc-btn");
const ascBtn = document.querySelector("#asc-btn");

const baseApi = "https://dummyjson.com";

function buildPost(post) {
  const li = document.createElement("li");
  li.className = "blog";

  li.innerHTML = `    <h2 class="font-semibold text-2xl">${post.title}</h2>
    <p class="mt-2 font-normal">${post.body}</p>
    <div class="mt-3 flex justify-between">
      <button class="view-all-btn">Xem chi tiết</button>
      <div>
        <button class="edit-btn">Sửa</button>
        <button class="delete-btn">Xóa</button>
      </div>
    </div>`;

  blogsList.append(li);
  return li;
}

function clearBlogs() {
  blogsList.innerHTML = "";
}

function renderBlogs(posts) {
  clearBlogs();
  posts.forEach((post) => {
    buildPost(post);
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
