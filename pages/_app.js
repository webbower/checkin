import { Provider } from 'react-redux';
import { add, sub } from 'date-fns';
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
      checkins: [
        {
          id: '1',
          userId: '1',
          teamId: '1',
          createdAt: sub(Date.now(), { days: 1 }),
          tasks: [
            {
              id: '1',
              userId: '1',
              description: 'Migrate to Next.js',
              completed: true,
            },
            {
              id: '2',
              userId: '1',
              description: 'Build the Checkin app',
              completed: false,
            },
          ],
          blockers: [
            {
              id: '1',
              userId: '1',
              description: 'My dog ate my code',
            },
          ],
        },
        {
          id: '2',
          userId: '1',
          teamId: '1',
          createdAt: add(Date.now(), { days: 1 }),
          tasks: [
            {
              id: '3',
              userId: '1',
              description: 'Use autodux for Redux module',
              completed: false,
            },
          ],
          blockers: [],
        },
      ],
    })
  );

  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  );
}
