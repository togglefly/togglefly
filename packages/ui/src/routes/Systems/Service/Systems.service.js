
export function listSystems(signal) {
  const url = 'https://l3ut0axl99.execute-api.sa-east-1.amazonaws.com/dev/systems';
  return fetch(url, { method: 'GET', signal })
    .then((res) => res.json())
}
