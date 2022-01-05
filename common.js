
var socket = io();
var input = document.getElementById('input');

socket.on('loggedInUsers', function (onlineUsers) {
    const parent = document.getElementById('loggedInUsers');
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    };


    function compare(a, b) {
        const nameA = a.name.toUpperCase();
        const nameB = b.name.toUpperCase();
        let comparison = 0;
        if (nameA > nameB) {
            comparison = 1;
        } else if (nameA < nameB) {
            comparison = -1;
        }
        return comparison;
    }

    onlineUsers.sort(compare);

    for (let item of onlineUsers) {
        const li = `<li id="${item.id}">${item.name}</li>`;
        console.log(item);

        document.getElementById('loggedInUsers').insertAdjacentHTML('beforeend', li);
        if (item.hidden) {
            document.getElementById(item.id).style.visibility = 'hidden';
        }
    }
});


socket.on('namelist', function (data) {
});


socket.on('ShowName', (u) => {
    const li = document.getElementById(u.id);
    li.style.visibility = 'visible';
});