
export const createRole = (body) => {
  const url = 'https://l3ut0axl99.execute-api.sa-east-1.amazonaws.com/dev/roles';
  return fetch(url, {
    method: 'POST',
    body: JSON.stringify(body)
  })
    .then((res) => res.json())

}
