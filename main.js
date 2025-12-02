const blogsList = document.querySelector("#blogs-list");

function sendRequest(method = "GET", url, callback) {
  const xhr = new XMLHttpRequest();
  xhr.open(method, url, true);
  xhr.send();
  xhr.onload = function () {
    if (xhr.status >= 200 && xhr.status < 400) {
      if (typeof callback === "function") {
        callback(xhr.responseText);
      }
    }
  };
}

sendRequest("GET", "https://dummyjson.com/posts/search", (responseText) => {
  const posts = JSON.parse(responseText).posts;
  renderBlogs(posts);
});

function renderBlogs(posts) {
  posts.forEach((post) => {
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
  });
}
