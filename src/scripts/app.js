// Menu script... 

const menu = document.getElementById("menu");
const dropdown = document.getElementById("dropdown");
const message = document.querySelector("#message");
const logout = document.getElementById("logout");

window.toggleMessage = function(content, positive=true) {
 message.innerText = content; 
 message.setAttribute("class",(positive) ? "message--positive":"message--negative");
 message.style.display = "block"; 
 setTimeout(() => {
  message.style.display = "none";
 },10000);
}

dropdown.style.display = "none";
dropdown.style.opacity = "1";
menu.onclick = () => {
    if (dropdown.style.display == "block") {
        dropdown.style.opacity = "0";
        setTimeout(() => {
            dropdown.style.display = "none";
        }, 200);
    } else {
        dropdown.style.display = "block";
        dropdown.style.opacity = "1";
    }
}


if (logout) logout.addEventListener("click", (e) => {
  e.preventDefault();
  document.cookie = "sessionId= ; expires=Jan, 18 Dec 2003 12:00:00 UTC";
  document.location = "http://localhost:3000/";
});

