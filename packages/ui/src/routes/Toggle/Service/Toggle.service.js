export function createToggle(body, signal) {
  const url = 'https://l3ut0axl99.execute-api.sa-east-1.amazonaws.com/dev/features';
  return fetch(url, {
    method: 'POST',
    signal,
    body: JSON.stringify(body)
  })
    .then((res) => res.json())
}

export function listSystems(signal) {
  const url = 'https://l3ut0axl99.execute-api.sa-east-1.amazonaws.com/dev/systems';
  return fetch(url, { method: 'GET', signal })
    .then((res) => res.json())
}

export function listRoles(signal) {
  const url = 'https://l3ut0axl99.execute-api.sa-east-1.amazonaws.com/dev/roles';
  return fetch(url, { method: 'GET', signal })
    .then(response => response.json());
}
