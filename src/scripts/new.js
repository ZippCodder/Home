let save = document.getElementById("save");
let title = document.getElementById("title");
let main = document.getElementById("main");
const username = document.getElementById("username").getAttribute("data-username");

save.onclick = () => {

    // Activate loader...

    let loader2 = document.querySelector("#loader2");

    document.querySelector(".editor").style.display = "none";

    loader2.style.display = "block";
    loader2.style.animationPlayState = "running";

    fetch("http://localhost:3000/docs/create", {
        method: "POST",
        body: JSON.stringify({
            username: username,
            title: title.value,
            main: main.value,
        }),
        headers: {
            "Content-Type": "application/json"
        }
    }).then(res => {
        return res.text();
    }).then(location => {
        window.location.href = location;
    })
}
