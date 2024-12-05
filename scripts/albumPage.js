document.addEventListener("DOMContentLoaded", function () {
  const albumContainer = document.getElementById("album-container");
  const loadingMessage = document.getElementById("loading-message");
  const errorMessage = document.getElementById("error-message");
  const albumForm = document.getElementById("album-form");
  const editButton = document.getElementById("edit-button");
  const deleteButton = document.getElementById("delete-button");
  const cancelButton = document.getElementById("cancel-button");

  const urlParams = new URLSearchParams(window.location.search);
  const albumId = urlParams.get("id");
  const apiBaseUrl = "http://127.0.0.1:5000/api/albums/";

  const fetchAlbum = async () => {
    try {
      loadingMessage.style.display = "block";
      const response = await fetch(`${apiBaseUrl}${albumId}`);
      const album = await response.json();
      loadingMessage.style.display = "none";
      renderAlbum(album);
    } catch (error) {
      loadingMessage.style.display = "none";
      errorMessage.textContent = "Не вдалося завантажити альбом.";
    }
  };

  const renderAlbum = (album) => {
    document.getElementById("album-title").textContent = album.title;
    document.getElementById(
      "album-release-date"
    ).textContent = `Дата виходу: ${album.release_date}`;
    document.getElementById("album-cover").src = album.cover_image;
    document.getElementById(
      "album-number-of-songs"
    ).textContent = `Кількість пісень: ${album.number_of_songs}`;
    document.getElementById("album-link").href = album.album_link;

    const trackList = document.getElementById("track-list");
    trackList.innerHTML = album.tracks.length
      ? album.tracks
          .map(
            (track) =>
              `<li class="track-item">${track.title} - ${track.duration}</li>`
          )
          .join("")
      : "<li>Немає доступних пісень.</li>";

    albumContainer.style.display = "block";
  };

  const handleEditClick = () => {
    albumForm.style.display = "block";
    document.getElementById("title").value =
      document.getElementById("album-title").textContent;
    document.getElementById("release_date").value = document
      .getElementById("album-release-date")
      .textContent.replace("Дата виходу: ", "");
    document.getElementById("cover_image").value =
      document.getElementById("album-cover").src;
    document.getElementById("number_of_songs").value = document
      .getElementById("album-number-of-songs")
      .textContent.replace("Кількість пісень: ", "");
    document.getElementById("album_link").value =
      document.getElementById("album-link").href;
  };

  const handleDeleteClick = async () => {
    if (confirm("Ви впевнені, що хочете видалити цей альбом?")) {
      try {
        await fetch(`${apiBaseUrl}${albumId}`, { method: "DELETE" });
        location.href = "/";
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const updatedAlbum = {
      title: document.getElementById("title").value,
      release_date: document.getElementById("release_date").value,
      cover_image: document.getElementById("cover_image").value,
      number_of_songs: parseInt(
        document.getElementById("number_of_songs").value,
        10
      ),
      album_link: document.getElementById("album_link").value,
    };

    try {
      await fetch(`${apiBaseUrl}${albumId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedAlbum),
      });
      albumForm.style.display = "none";
      fetchAlbum();
    } catch (error) {
      console.log(error);
    }
  };

  const handleCancelClick = () => {
    albumForm.style.display = "none";
  };

  editButton.addEventListener("click", handleEditClick);
  deleteButton.addEventListener("click", handleDeleteClick);
  albumForm.addEventListener("submit", handleFormSubmit);
  cancelButton.addEventListener("click", handleCancelClick);

  fetchAlbum();
});
