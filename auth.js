// Initialize the Google API client with the provided API key and client ID.
function initGoogleAPI() {
  gapi.load('client:auth2', function() {
    gapi.client.init({
      apiKey: 'YOUR_API_KEY',
      clientId: 'YOUR_CLIENT_ID',
      discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
      scope: 'https://www.googleapis.com/auth/drive.metadata.readonly'
    }).then(function () {
      // Listen for sign-in state changes.
      gapi.auth2.getAuthInstance().isSignedIn.listen(updateSignInStatus);

      // Handle the initial sign-in state.
      updateSignInStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    });
  });
}

// Attach the sign-in event to the sign-in button
function attachSignInEvent(buttonId) {
  var signInButton = document.getElementById(buttonId);
  signInButton.addEventListener('click', function() {
    var GoogleAuth = gapi.auth2.getAuthInstance();
    GoogleAuth.signIn();
  });
}

// Handle the sign-in response and send the token to the back-end
function updateSignInStatus(isSignedIn) {
  if (isSignedIn) {
    var GoogleAuth = gapi.auth2.getAuthInstance();
    var user = GoogleAuth.currentUser.get();
    var id_token = user.getAuthResponse().id_token;

    // Send the token to your back-end
    sendTokenToBackend(id_token);
  } else {
    // User is not signed in. Handle the error or prompt for sign-in.
    console.log('User not signed in');
  }
}

// Send the ID token to the back-end via POST
function sendTokenToBackend(token) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'YOUR_BACKEND_TOKEN_ENDPOINT');
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.onload = function() {
    console.log('Signed in as: ' + xhr.responseText);
  };
  xhr.send('idtoken=' + token);
}

// Call the init function when the window loads
window.onload = function() {
  initGoogleAPI();
};