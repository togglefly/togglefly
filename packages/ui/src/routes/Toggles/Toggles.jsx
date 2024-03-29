import React, { useEffect, useState, useCallback } from 'react';
import { listFeatures } from './Service/Toggles.service';
import { Header } from './Toggles.styled';
import { Button } from '@togglefly/components';

export const Toggles = () => {
  const [ loading, setLoading ] = useState(true);
  const [ toggles, setToggles ] = useState([]);
  const [ erro, setErro ] = useState(false);
  const [ controller ] = useState(new AbortController());

  const _list = useCallback(() => {
    setLoading(true);
    setErro(false);
    const { signal } = controller;
    return listFeatures(signal)
      .then((toggles) => setToggles(toggles))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    _list();
    return () => controller.abort();
  }, []);

  return (
    <div>
      <Header>
        <h3>All Toggles</h3>
        <a href="#/toggle?active=true">New Toggle</a>
      </Header>
      {loading && (<p>Loading...</p>)}
      {!loading && (
        <ul>
          {
            toggles.map(toggle => (
              <li key={toggle.id}>{toggle.name}</li>
            ))
          }
        </ul>
      )}
      {erro && (
        <>
          <p>Something went wrong</p>
          <Button onClick={() => _list()}>Try Again!</Button>
        </>
      )}
    </div>
  )
}
