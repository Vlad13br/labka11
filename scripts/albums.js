document.addEventListener("DOMContentLoaded", function () {
  const albumListElement = document.getElementById("album-list");
  const loadingMessageElement = document.getElementById("loading-message");
  const errorMessageElement = document.getElementById("error-message");
  const formToggleButton = document.getElementById("form-toggle-button");
  const albumForm = document.getElementById("album-form");

  const albumsUrl = "http://127.0.0.1:5000/api/albums";

  const fetchAlbums = async () => {
    try {
      loadingMessageElement.style.display = "block";
      const response = await fetch(albumsUrl);
      const albums = await response.json();
      loadingMessageElement.style.display = "none";

      if (albums.length === 0) {
        albumListElement.innerHTML =
          '<p class="no-albums-message">Альбоми не знайдені.</p>';
        return;
      }

      albumListElement.innerHTML = albums
        .map((album) => {
          return `
            <div class="album-card">
              <h2 class="album-card-title">${album.title}</h2>
              <p class="album-card-year">Рік: ${album.release_date}</p>
              <p class="album-card-songs">
                Кількість пісень: ${album.number_of_songs}
              </p>
              <img
                src="${album.cover_image}"
                alt="${album.title} cover"
                class="album-card-image"
              />
              <a href="albumPage.html?id=${album.id}" class="view-album-button">Переглянути альбом</a>
            </div>
          `;
        })
        .join("");
    } catch (error) {
      loadingMessageElement.style.display = "none";
      errorMessageElement.textContent = "Не вдалося завантажити альбоми";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const newAlbum = {
      title: document.getElementById("title").value,
      year: document.getElementById("year").value,
      number_of_songs: document.getElementById("number_of_songs").value,
      cover_image: document.getElementById("cover_image").value,
      album_link: document.getElementById("album_link").value,
    };

    try {
      await fetch(albumsUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newAlbum),
      });

      fetchAlbums();
      albumForm.reset();
      alert("Альбом успішно створено!");
    } catch (error) {
      console.log(error);
    }
  };

  const toggleFormVisibility = () => {
    const formVisible = albumForm.style.display === "block";
    albumForm.style.display = formVisible ? "none" : "block";
    formToggleButton.textContent = formVisible
      ? "Створити новий альбом"
      : "Сховати форму";
  };

  formToggleButton.addEventListener("click", toggleFormVisibility);
  albumForm.addEventListener("submit", handleSubmit);

  fetchAlbums();
});
