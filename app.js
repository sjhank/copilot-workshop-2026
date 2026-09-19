const STORAGE_KEY = "todo-list-items";

const todoForm = document.querySelector("#todo-form");
const todoInput = document.querySelector("#todo-input");
const todoList = document.querySelector("#todo-list");
const emptyState = document.querySelector("#empty-state");
const remainingCount = document.querySelector("#remaining-count");
const themeToggle = document.querySelector("#theme-toggle");
const themeIcon = document.querySelector(".theme-icon");
const themeLabel = document.querySelector(".theme-label");
const THEME_STORAGE_KEY = "todo-list-theme";
const FILTER_STORAGE_KEY = "todo-list-filter";
const filterButtons = document.querySelectorAll(".filter-button");

let todos = loadTodos();
let currentFilter = loadFilter();

// 從瀏覽器儲存空間讀取資料，若資料損壞則回到空清單。
function loadTodos() {
  try {
    const savedTodos = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(savedTodos) ? savedTodos : [];
  } catch (error) {
    return [];
  }
}

// 將目前清單同步保存到瀏覽器儲存空間。
function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// 套用使用者選擇；沒有手動選擇時交由 CSS 跟隨系統設定。
function applyTheme(theme) {
  if (theme) {
    document.documentElement.dataset.theme = theme;
  } else {
    delete document.documentElement.dataset.theme;
  }

  const isDark = theme
    ? theme === "dark"
    : window.matchMedia("(prefers-color-scheme: dark)").matches;
  themeIcon.textContent = isDark ? "☀️" : "🌙";
  themeLabel.textContent = isDark ? "淺色模式" : "深色模式";
  themeToggle.setAttribute("aria-pressed", String(isDark));
}

function loadTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  return savedTheme === "light" || savedTheme === "dark" ? savedTheme : null;
}

function loadFilter() {
  const savedFilter = localStorage.getItem(FILTER_STORAGE_KEY);
  return ["all", "active", "completed"].includes(savedFilter) ? savedFilter : "all";
}

function getVisibleTodos() {
  if (currentFilter === "active") {
    return todos.filter((todo) => !todo.completed);
  }

  if (currentFilter === "completed") {
    return todos.filter((todo) => todo.completed);
  }

  return todos;
}

function getEmptyMessage() {
  if (todos.length === 0) {
    return "還沒有任何待辦事項，新增一個吧！";
  }

  if (currentFilter === "active") {
    return "太棒了！目前沒有未完成的事項，其他項目仍保留在清單中。";
  }

  return "目前沒有已完成的事項，其他項目仍保留在清單中。";
}

function updateFilterButtons() {
  filterButtons.forEach((filterButton) => {
    const isActive = filterButton.dataset.filter === currentFilter;
    filterButton.classList.toggle("active", isActive);
    filterButton.setAttribute("aria-pressed", String(isActive));
  });
}

function renderTodos() {
  todoList.replaceChildren();
  const visibleTodos = getVisibleTodos();

  visibleTodos.forEach((todo) => {
    const item = document.createElement("li");
    item.className = `todo-item${todo.completed ? " completed" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;
    checkbox.setAttribute("aria-label", `完成：${todo.text}`);
    checkbox.addEventListener("change", () => {
      todo.completed = checkbox.checked;
      saveTodos();
      renderTodos();
    });

    const text = document.createElement("span");
    text.className = "todo-text";
    text.textContent = todo.text;

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.type = "button";
    deleteButton.textContent = "刪除";
    deleteButton.setAttribute("aria-label", `刪除：${todo.text}`);
    deleteButton.addEventListener("click", () => {
      todos = todos.filter((currentTodo) => currentTodo.id !== todo.id);
      saveTodos();
      renderTodos();
    });

    item.append(checkbox, text, deleteButton);
    todoList.append(item);
  });

  const unfinishedTodos = todos.filter((todo) => !todo.completed).length;
  remainingCount.textContent = `未完成：${unfinishedTodos} 項`;
  emptyState.textContent = getEmptyMessage();
  emptyState.hidden = visibleTodos.length > 0;
}

todoForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = todoInput.value.trim();

  if (!text) {
    todoInput.focus();
    return;
  }

  todos.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    text,
    completed: false,
  });

  saveTodos();
  renderTodos();
  todoForm.reset();
  todoInput.focus();
});

themeToggle.addEventListener("click", () => {
  const currentTheme = document.documentElement.dataset.theme;
  const isDark = currentTheme
    ? currentTheme === "dark"
    : window.matchMedia("(prefers-color-scheme: dark)").matches;
  const nextTheme = isDark ? "light" : "dark";
  localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  applyTheme(nextTheme);
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    localStorage.setItem(FILTER_STORAGE_KEY, currentFilter);
    updateFilterButtons();
    renderTodos();
  });
});

const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
systemTheme.addEventListener("change", () => {
  if (!localStorage.getItem(THEME_STORAGE_KEY)) {
    applyTheme(null);
  }
});

applyTheme(loadTheme());
updateFilterButtons();
renderTodos();
