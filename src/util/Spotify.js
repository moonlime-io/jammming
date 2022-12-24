const clientID = "ad5ff324f06d48178ce45b5751f8548a";
const redirectUri = "http://moonlime-jammming.surge.sh";
let accessToken;

const Spotify = {
    getAccessToken() {
        if (accessToken){
            return accessToken;
        }
        const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
        const exipresInMatch = window.location.href.match(/expires_in=([^&]*)/);

        if (accessTokenMatch && exipresInMatch){
            accessToken = accessTokenMatch[1];
            let expiresIn = Number(exipresInMatch[1]);

            window.setTimeout(() => accessToken = '', expiresIn * 1000);
            window.history.pushState("Access Token", null, "/");

            return accessToken;
        } else {
            window.location.href = `https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`
        }
    },

   search(term){
    let url = `https://api.spotify.com/v1/search?type=track&q=${term}`;
    const accessToken= Spotify.getAccessToken();
    return fetch(url, {
        headers : {
            Authorization : `Bearer ${accessToken}`
        }
    }).then(response => {
        return response.json()
    }).then(jsonResponse => {
                if(!jsonResponse.tracks){
                    console.log("The search returned no results");
                    return [];
                }
                return jsonResponse.tracks.items.map(track => ({
                    id: track.id,
                    name: track.name,
                    artist: track.artists[0].name,
                    album: track.album.name,
                    uri: track.uri
                }));
            })
   },
    savePlaylist(playlistName, trackUris) {
        // Check if playlist name has been set and there are tracks added to it
        if (!playlistName || !trackUris.length) {
            return;
        }

        const accessToken = Spotify.getAccessToken();
        const headers = { Authorization: `Bearer ${accessToken}` };
        let userId;

        // Get username from Spotify then get the playlists
        return fetch(`https://api.spotify.com/v1/me`, { headers: headers }
        ).then(response => response.json()
        ).then(jsonResponse => {
            userId = jsonResponse.id;
            return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`,
            {
                headers: headers,
                method: "POST",
                body: JSON.stringify( { name: playlistName })
            }).then(response => response.json()
            ).then(jsonResponse => {
                const playlistId = jsonResponse.id;
                return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`,
                {
                    headers: headers,
                    method: 'POST',
                    body: JSON.stringify({uris: trackUris})
                })
            })
        })
    }

};

export default Spotify;