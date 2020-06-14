import { Provider } from 'react-redux';
import { useStore, getInitialState } from '../src/redux';

import '../src/styles/global.css';

// `useStore` pattern borrowed from https://github.com/vercel/next.js/blob/canary/examples/with-redux/store.js
export default function App({ Component, pageProps }) {
  const store = useStore(
    getInitialState({
      users: {
        '1': {
          id: '1',
          name: 'Matt',
        },
      },
      teams: {
        '1': {
          id: '1',
          name: 'The First Team',
          ownerId: '1',
          users: ['1'],
        },
      },
    })
  );

  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  );
}
