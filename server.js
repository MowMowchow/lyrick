/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */


var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var client_id = '440acaa5555749e0bf729df7a4541c65'; // Your client id
var client_secret = '5f56c78ed2c94af1839ca4334753f09f'; // Your secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri

let access_token, refresh_token2, currently_playing;

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-currently-playing user-read-recently-played';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        access_token = body.access_token;
        refresh_token = body.refresh_token;
        refresh_token2 = refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
        });
        // we can also pass the token to the browser to make requests from there
        res.redirect('/#' +
          querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token,
      });
    }
  });
});


app.get('/np', function(req, response){
  const request = require('request');

    const refresh_token = refresh_token2;

    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
        form: { grant_type: 'refresh_token', refresh_token: refresh_token }
    };

    request.post(authOptions, function(error, res) {
        var header = { 'Authorization': 'Bearer ' + (JSON.parse(res.body)).access_token };
        // console.log("waeiogjaweiog:", (JSON.parse(res.body)))
        var song_name, artist, song_url;
        request({ url: "https://api.spotify.com/v1/me/player/currently-playing?", headers: header }, function(error, res, body) {
            if((res.statusCode == 204) || JSON.parse(body).currently_playing_type != "track") {
                request({ url:"https://api.spotify.com/v1/me/player/recently-played?type=track&limit=1", headers: header }, function(error, res, body) {

                    var body_text = JSON.parse(body);
                    var track = body_text.items[0].track;
                    song_name = track.name;
                    artist = track.artists[0].name;
                    song_url = track.external_urls.spotify;
                    response.json({ "song_name": song_name, "artist": artist, "song_url": song_url });
                    currently_playing = { "song_name": song_name, "artist": artist, "song_url": song_url }
                    console.log("currently playing", currently_playing);
              
                });
            } else {
                var body_text = JSON.parse(body);
                song_name = body_text.item.name;
                artist = (body_text.item.artists)[0].name;
                song_url = body_text.item.external_urls.spotify;
                // response.json({ "song_name": song_name, "artist": artist, "song_url": song_url });
                // response.json(body_text.item);
                response.json({
                  'artists': body_text.item.artists.map(x => x.name),
                  'album_name': body_text.item.album.name,
                  'album_cover': body_text.item.album.images[0],
                  'release_date': body_text.item.album.release_date,
                  'title': body_text.item.name
                })
                currently_playing = { "song_name": song_name, "artist": artist, "song_url": song_url }
                console.log("currently playing", currently_playing);


            }
        });

    });

});



console.log('Listening on 8888');
app.listen(8888);
