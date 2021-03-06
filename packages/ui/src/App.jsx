import React, { useEffect } from 'react';
import { NormalizeCSS } from './NormalizeCSS';
import styled from 'styled-components';
import { Button } from '@togglefly/components';

import { Header } from './components/Header';
import {
  Systems,
  Role,
  Roles,
  Toggles,
  Toggle,
  System,
} from './routes';

const Container = styled.div`
  max-width: 60%;
  margin: 0 auto;
`;

export function App() {
  const [ activeRoute, setActiveRoute ] = React.useState(window.location.hash || '#/home');

  const handleRouteChanges = () => {
    const hash = window.location.hash;
    setActiveRoute(hash);
  }

  useEffect(() => {
    window.addEventListener('popstate', handleRouteChanges);
    return () => window.removeEventListener('popstate', handleRouteChanges);
  }, []);

  return (
    <Container>
      <NormalizeCSS />
      <Header />
      {(activeRoute === '#/home' || activeRoute === '#/toggles') && <Toggles />}
      {activeRoute === '#/toggle' && <Toggle />}
      {activeRoute === '#/roles' && <Roles />}
      {activeRoute === '#/role' && <Role />}
      {activeRoute === '#/systems' && <Systems />}
      {activeRoute === '#/system' && <System />}
    </Container>
  )
}
