
const cont = document.querySelector(".dashboard");

if (activity.length > 0) {
    document.querySelector(".dashboard__empty-message").style.display = "none";
    for (let x of activity.reverse()) {
        let notif = document.createElement("div");
        let info = document.createElement("p");
        let type;
        switch (x.type) {
            case "friend request":
                type = "fr";
                info.innerHTML = "<b>" + x.info.from + "</b> sent you a friend request";
                break;
            case "sent document":
                type = "sd";
                info.innerHTML = "<b>" + x.info.from + "</b> sent you a document";
                break;
            case "accepted friend request":
                type = "afr";
                info.innerHTML = "<b>" + x.info.from + "</b> accepted your friend request";
                break;
            case "removed friend":
                type = "rmf";
                info.innerHTML = "<b>" + x.info.from + "</b> removed you as a friend";
                break;
            case "rejected friend request":
                type = "rfr";
                info.innerHTML = "<b>" + x.info.from + "</b> rejected your friend request";
        }
        notif.appendChild(info);
        notif.setAttribute("class", "notif " + type);
        cont.appendChild(notif);
    }
}
