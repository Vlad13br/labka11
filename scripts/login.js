document
  .getElementById("login-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    const response = await fetch("http://127.0.0.1:5000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();
    if (response.ok) {
      localStorage.setItem("jwt_token", result.token);

      alert(result.message);
      window.location.href = "../index.html";
    } else {
      alert(result.error);
    }
  });

function redirectToRegister() {
  window.location.href = "./register.html";
}
