const api_key = 'AIzaSyBAOiSGCe1hy8uKjmS6V-yoClSvhn-thTA';
window.onload = () => {
    document.querySelector('button').addEventListener('click', () => {
        chrome.identity.getAuthToken({interactive: true}, (token) => {
            let init = {
                method: 'GET',
                async: true,
                headers: {
                    Authorization: 'Bearer ' + token,
                    'Content-Type': 'application/json',
                },
                'contentType': 'json',
            };
            fetch(
                `https://www.googleapis.com/calendar/v3/calendars/primary/events?key=${api_key}`,
                init
            )
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
            });
        });
    });
};