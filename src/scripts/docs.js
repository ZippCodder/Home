// Retreive users documents...

import "../styles/styles.css";
import "../styles/docs.css";

var documents = {};
const username = document.getElementById("username").getAttribute("data-username");
const documentMessage = document.querySelector(".dashboard__empty-message > p");

fetch("http://localhost:3000/docs/all")
    .then((res) => {
        return res.json();
    })
    .then((json) => {
        json.result.reverse();
        if (json.result[0] !== undefined) {
            render(json.result);
        }
        documentMessage.innerText = "You don't have any documents!";
    });

function render(arr) {
    document.getElementById("totalDocs").innerText = arr.length;
    let documentsContainer = document.querySelector(".dashboard__documents");
    document.querySelector(".dashboard__empty-message").style.display = "none";
    documentsContainer.setAttribute("class", "dashboard__documents dashboard__documents--full");

    for (let i of arr) {
        let doc = document.createElement("div");

        documents[i._id] = {
            creator: i.creator,
            title: i.title,
            body: i.main,
            date: i.dateMade,
            writers: i.writers,
        };
        doc.setAttribute("data-id", i._id);
        let text = document.createElement("div");
        let overflow = document.createElement("div");
        text.setAttribute("class", "text");
        let options = document.createElement("div");
        options.setAttribute("class", "options");

        let pen = document.createElement("i");
        pen.setAttribute("class", "fas fa-pen");
        pen.addEventListener("click", () => {
            let docObj = documents[doc.getAttribute("data-id")];
            if (docObj.writers.includes(username)) {
                document.querySelector("#edit-but").onclick = () => {
                    doc.getElementsByTagName("h1")[0].innerText =
                        document.querySelector("#edit-title").value;
                    doc.getElementsByTagName("p")[0].innerText =
                        document.querySelector("#edit-body").value;
                    exitPreview();

                    docObj.title = document.querySelector("#edit-title").value;
                    docObj.body = document.querySelector("#edit-body").value;

                    fetch("http://localhost:3000/docs/edit", {
                        method: "POST",
                        body: JSON.stringify({
                            id: doc.getAttribute("data-id"),
                            title: document.querySelector("#edit-title").value,
                            main: document.querySelector("#edit-body").value,
                        }),
                    }).then(() => {
                        toggleMessage("Document was successfully updated!", true);
                    }).catch(err => {
                        console.log(err);
                    });
                };
                edit(docObj.title, docObj.body, doc);
            } else {
                toggleMessage("You don't have permission to edit this document!", false);
            }
        });
        let eye = document.createElement("i");
        eye.addEventListener("click", () => {
            let parent =
                eye.parentElement.parentElement.getAttribute("data-id");
            let docu = documents[parent];
            preview(docu.title, docu.body, docu.date.slice(0, 10));
        });

        eye.setAttribute("class", "fas fa-eye");
        let trash = document.createElement("i");
        trash.setAttribute("class", "fas fa-trash");

        trash.addEventListener("click", () => {
            if (
                documents[
                    trash.parentElement.parentElement.getAttribute("data-id")
                ].creator == username
            ) {
                if (window.confirm("Delete this document?")) {
                    remove();
                    fetch("http://localhost:3000/docs/delete", {
                        method: "POST",
                        body: JSON.stringify({
                            id: trash.parentElement.parentElement.getAttribute(
                                "data-id",
                            ),
                        }),
                    });
                    toggleMessage("Document was successfully deleted!");
                }
            } else {
                if (window.confirm("Remove this document?")) {
                    remove();
                    fetch("http://localhost:3000/docs/delete", {
                        method: "POST",
                        body: JSON.stringify({
                            username: username,
                            id: trash.parentElement.parentElement.getAttribute(
                                "data-id",
                            ),
                        }),
                    });
                    toggleMessage("Document was successfully removed!");
                }
            }
        });

        function remove() {
            let child = trash.parentElement.parentElement;
            document.querySelector(".dashboard__documents").removeChild(child);
            delete documents[child.getAttribute("data-id")];
            document.querySelector("#totalDocs").innerText =
                Object.keys(documents).length;
            if (Object.keys(documents).length === 0) {
                document.querySelector("#totalDocs").innerText = "";

                let dashboard = document.querySelector(".dashboard__documents");
                dashboard.setAttribute("class", "dashboard__documents dashboard__documents--empty");

                document.querySelector(".dashboard__empty-message").style.display = "initial";
                document.querySelector(".dashboard__empty-message").style.top = "0";
            }
        }

        options.appendChild(pen);
        options.appendChild(eye);
        options.appendChild(trash);

        for (let x in i) {
            if (x == "title") {
                let title = document.createElement("h1");
                title.innerText = i[x];
                text.appendChild(title);
                text.appendChild(document.createElement("br"));
            } else if (x == "main") {
                let main = document.createElement("p");
                main.innerText =
                    i[x].length < 200 ? i[x] : i[x].slice(0, 181) + "...";
                overflow.appendChild(main);
                text.appendChild(overflow);
            }
        }

        doc.setAttribute("class", "doc");
        doc.appendChild(text);
        doc.appendChild(options);
        documentsContainer.appendChild(doc);
    }
}

document.querySelectorAll(".preview-exit").forEach(v => {
 v.onclick = exitPreview;
});

function preview(title, body, dateMade) {
    document.body.style.overflow = "hidden";
    document.querySelector("#preview").style.display = "block";
    document.querySelector("#pre-title").innerText = title;
    document.querySelector("#pre-date").innerText = dateMade;
    document.querySelector("#pre-body").innerText = body;
}

function edit(title, body, doc) {
    document.querySelector("#edit").style.display = "block";
    document.querySelector("#edit-title").value = title;
    document.querySelector("#edit-body").value = body;
}

function exitPreview() {
    document.body.style.overflow = "scroll";
    document.querySelector("#preview").style.display = "none";
    document.querySelector("#edit").style.display = "none";
}
