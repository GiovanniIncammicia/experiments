import { useEffect } from "react"

const uid = crypto.randomUUID();

const fetchData = () => fetch('http://localhost:5000').then(console.log);

// async function initKeycloak(): Promise<Keycloak> {
// 	const keycloak = new Keycloak({
// 		url: process.env.NEXT_PUBLIC_KEYCLOAK_URL,
// 		realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM,
// 		clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID,
// 	});
// 	return new Promise((resolve, reject) => {
// 		keycloak
// 			.init({
// 				onLoad: 'login-required',
// 				checkLoginIframe: false,
// 			})
// 			.then(() => resolve(keycloak))
// 			.catch(function (err) {
// 				// TODO: gestione errori
// 				keycloak.logout();
// 				console.error('failed to initialize', err);
// 				reject(keycloak);
// 			});
// 	});
// }

export default function App() {

  useEffect(() => {
    fetchData();
  }, [])

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:5000/ws');

    socket.onopen = () => {
      socket.send(uid);
    };
    
    socket.onmessage = (event) => {
      if (event.data === 'reload') {
        fetchData();
      }
    };

    return () => socket.close()
  }, [])

  function onClick() {
    fetch('http://localhost:5000/transactions', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({ uid })
    }).then(console.log)
  }

  function onProtectedClick() {
    fetch('http://localhost:5000/protected').then(res => {
      console.log(res.url)
      if (res.redirected) {
        window.location.href = res.url;
      } else {
        res.json().then(console.log)
      }
    })
  }

  return (
    <div>
      <button onClick={onClick}>Add transaction</button>
      <button onClick={onProtectedClick}>Fetch Protected Data</button>
    </div>
  )
}

