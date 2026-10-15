// ---------- 1. Get elements from the page ----------
const form = document.getElementById("add-form");
const input = document.getElementById("task-input");
const list = document.getElementById("task-list");
const counter = document.getElementById("counter");
const emptyMsg = document.getElementById("empty");
const clearBtn = document.getElementById("clear-done");
const filterButtons = document.querySelectorAll(".filter");

// ---------- 2. App data ----------
// Each task looks like: { id: 123, text: "Buy milk", done: false }
// We load saved tasks from the browser (localStorage) so they stay after refresh.
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all"; // "all" | "active" | "done"

// ---------- 3. Save to localStorage ----------
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// ---------- 4. Add a task ----------
form.addEventListener("submit", function (event) {
  event.preventDefault(); // stop the page from reloading

  const text = input.value.trim();
  if (text === "") return;

  tasks.push({ id: Date.now(), text: text, done: false });
  input.value = "";
  saveTasks();
  render();
});

// ---------- 5. Toggle done / delete a task ----------
function toggleTask(id) {
  tasks = tasks.map(function (task) {
    return task.id === id ? { ...task, done: !task.done } : task;
  });
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter(function (task) {
    return task.id !== id;
  });
  saveTasks();
  render();
}

// ---------- 6. Delete all completed tasks ----------
clearBtn.addEventListener("click", function () {
  tasks = tasks.filter(function (task) {
    return !task.done;
  });
  saveTasks();
  render();
});

// ---------- 7. Filter buttons ----------
filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    currentFilter = button.dataset.filter;
    filterButtons.forEach(function (b) {
      b.classList.remove("active");
    });
    button.classList.add("active");
    render();
  });
});

// ---------- 8. Draw everything on screen ----------
function render() {
  list.innerHTML = "";

  // Pick which tasks to show
  const visible = tasks.filter(function (task) {
    if (currentFilter === "active") return !task.done;
    if (currentFilter === "done") return task.done;
    return true;
  });

  // Build one <li> for each task
  visible.forEach(function (task) {
    const li = document.createElement("li");
    li.className = "task" + (task.done ? " done" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.setAttribute("aria-label", "Mark task as done");
    checkbox.addEventListener("change", function () {
      toggleTask(task.id);
    });

    const label = document.createElement("span");
    label.textContent = task.text; // textContent is safe (no HTML injection)

    const del = document.createElement("button");
    del.className = "delete";
    del.textContent = "×";
    del.setAttribute("aria-label", "Delete task");
    del.addEventListener("click", function () {
      deleteTask(task.id);
    });

    li.append(checkbox, label, del);
    list.appendChild(li);
  });

  // Counter text
  const pending = tasks.filter(function (t) {
    return !t.done;
  }).length;
  if (tasks.length === 0) {
    counter.textContent = "No tasks yet";
  } else {
    counter.textContent = pending + " pending, " + (tasks.length - pending) + " done";
  }

  // Show/hide helper messages
  emptyMsg.hidden = visible.length !== 0;
  clearBtn.hidden = !tasks.some(function (t) {
    return t.done;
  });
}

// ---------- 9. First draw when page loads ----------
render();
