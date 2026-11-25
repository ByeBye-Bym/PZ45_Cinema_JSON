const list = document.querySelector("#movie-list");
const status = document.querySelector("#status");
const summary = document.querySelector("#summary");
const search = document.querySelector("#search");
const genre = document.querySelector("#genre");
let allMovies = [];
function setStatus(message, kind = "info") {
  status.textContent = message;
  status.dataset.kind = kind;
}
function normalizeMovie(raw) {
  // TODO 1: верните объект с title, genre, year, rating, duration,
  // sessions (массив строк) и tags (массив строк).
  // Учтите отсутствие либо неверный тип отдельных полей.
  const movie = raw || {};

  return {
    title: String(movie.title || "Без названия"),
    genre: String(movie.genre || "Не указан"),
    year: Number(movie.year) || 0,
    rating: Number(movie.rating) || 0,
    duration: Number(movie.duration) || 0,
    sessions: Array.isArray(movie.sessions) ? movie.sessions.map(String) : [],
    tags: Array.isArray(movie.tags) ? movie.tags.map(String) : [],
  };
}
function renderMovies(movies) {
  // TODO 2: создайте карточки createElement/textContent (без innerHTML).
  // Покажите жанр, год, рейтинг, длительность, ближайший сеанс и теги.
  // Для пустого списка создайте элемент .empty.
  list.replaceChildren();

  if (movies.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "Фильмы не найдены";
    list.append(empty);
    return;
  }

  movies.forEach((movie) => {
    const card = document.createElement("article");
    card.className = "item";

    const title = document.createElement("h3");
    title.textContent = movie.title;

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent =
      movie.genre +
      " · " +
      movie.year +
      " · рейтинг " +
      movie.rating +
      " · " +
      movie.duration +
      " мин";

    const sessions = document.createElement("p");
    sessions.textContent = movie.sessions.length
      ? "Сеансы: " + movie.sessions.join(", ")
      : "Сеансы пока не назначены";

    const tags = document.createElement("div");
    tags.className = "meta";

    movie.tags.forEach((tag) => {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = tag;
      tags.append(chip);
    });

    card.append(title, meta, sessions, tags);
    list.append(card);
  });
}
function applyFilters() {
  // TODO 3: найдите фильмы по подстроке названия (без учёта регистра),
  // затем примените фильтр жанра и обновите #summary и карточки.
  const query = search.value.trim().toLowerCase();
  const chosenGenre = genre.value;

  const found = allMovies.filter((movie) => {
    const byTitle = movie.title.toLowerCase().includes(query);
    const byGenre = chosenGenre === "all" || movie.genre === chosenGenre;
    return byTitle && byGenre;
  });

  summary.textContent = "Найдено: " + found.length + " из " + allMovies.length;
  renderMovies(found);
}
async function fetchMovies(empty = false) {
  // TODO 4: fetch('/api/movies' + (empty?'?empty=1':'')), response.ok, response.json().
  // Извлеките data.movies, проверьте Array.isArray, преобразуйте normalizeMovie,
  // запишите в allMovies и вызовите applyFilters().
  setStatus("Загружаем афишу...", "loading");

  try {
    const response = await fetch("/api/movies" + (empty ? "?empty=1" : ""));

    if (!response.ok) {
      throw new Error("Сервер вернул код " + response.status);
    }

    const data = await response.json();
    const movies = data && data.data ? data.data.movies : null;

    if (!Array.isArray(movies)) {
      throw new Error("Неверная структура ответа");
    }

    allMovies = movies.map(normalizeMovie);
    applyFilters();
    setStatus("Загружено фильмов: " + allMovies.length, "success");
  } catch (error) {
    setStatus("Ошибка загрузки: " + error.message, "error");
  }
}
document
  .querySelector("#load-button")
  .addEventListener("click", () => fetchMovies());
document
  .querySelector("#clear-button")
  .addEventListener("click", () => fetchMovies(true));
search.addEventListener("input", applyFilters);
genre.addEventListener("change", applyFilters);
// TODO 5: вызовите fetchMovies() при открытии страницы.
fetchMovies();
