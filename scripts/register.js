document
  .getElementById("register-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;

    const response = await fetch("http://127.0.0.1:5000/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (response.ok) {
      alert(result.message);
      redirectToLogin();
    } else {
      alert(result.error);
    }
  });

function redirectToLogin() {
  window.location.href = "./login.html";
}
