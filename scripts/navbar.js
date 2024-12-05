function checkSession() {
  const token = localStorage.getItem("jwt_token");

  if (!token) {
    updateUIForLoggedOutUser();
    return;
  }

  fetch("http://127.0.0.1:5000/api/check_session", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Невірний токен або токен прострочено");
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
      if (data.user_id) {
        updateUIForLoggedInUser();
      } else {
        updateUIForLoggedOutUser();
      }
    })
    .catch((error) => {
      console.error("Помилка перевірки сесії:", error);
      updateUIForLoggedOutUser();
    });
}

function updateUIForLoggedInUser() {
  const pathname = window.location.pathname;

  document.getElementById("login-item").style.display = "none";
  document.getElementById("logout-item").style.display = "block";
  if (pathname === "/index.html") {
    document.getElementById("form-toggle-button").style.display = "block";
  } else if (pathname === "/albumPage.html") {
    document.getElementById("edit-button").style.display = "block";
    document.getElementById("delete-button").style.display = "block";
  }
}

function updateUIForLoggedOutUser() {
  const pathname = window.location.pathname;

  document.getElementById("login-item").style.display = "block";
  document.getElementById("logout-item").style.display = "none";

  if (pathname === "/index.html") {
    document.getElementById("form-toggle-button").style.display = "none";
  } else if (pathname === "/albumPage.html") {
    document.getElementById("edit-button").style.display = "none";
    document.getElementById("delete-button").style.display = "none";
  }
}

function logout() {
  localStorage.removeItem("jwt_token");
  updateUIForLoggedOutUser();
  window.location.href = "./index.html";
}

window.onload = function () {
  checkSession();
};
