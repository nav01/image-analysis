import {SESSION_TOKEN} from './constants';

const cFetch = (url, method, auth = false, body = null) => {
  const headers = {'Content-Type': 'application/json'};
  if (auth) {
    const token = window.localStorage.getItem(SESSION_TOKEN);
    if (token)
      headers['Authorization'] = token;
    else
      return Promise.reject(new Error('Unauthorized'));
  }
  const message = {
    method,
    headers,
  }
  body && (message['body'] = JSON.stringify(body));
  
  return fetch(url, message);
};

const cFetchToJson = (url, method, auth = false, body = null) => {
  return cFetch(url, method, auth, body)
    .then(resp => resp.json());
};

export {
  cFetch,
  cFetchToJson,
};