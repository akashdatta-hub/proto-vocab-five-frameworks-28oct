import { createBrowserRouter } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { ComparePage } from '../pages/ComparePage';
import { DebugPage } from '../pages/DebugPage';
import { FeedbackAdmin } from '../pages/FeedbackAdmin';
import { BloomsJourney } from '../journeys/blooms';
import { CEFRJourney } from '../journeys/cefr';
import { MarzanoJourney } from '../journeys/marzano';
import { NationJourney } from '../journeys/nation';
import { LexicalJourney } from '../journeys/lexical';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/journey/blooms/:word',
    element: <BloomsJourney />,
  },
  {
    path: '/journey/cefr/:word',
    element: <CEFRJourney />,
  },
  {
    path: '/journey/marzano/:word',
    element: <MarzanoJourney />,
  },
  {
    path: '/journey/nation/:word',
    element: <NationJourney />,
  },
  {
    path: '/journey/lexical/:word',
    element: <LexicalJourney />,
  },
  {
    path: '/compare',
    element: <ComparePage />,
  },
  {
    path: '/debug',
    element: <DebugPage />,
  },
  {
    path: '/feedback',
    element: <FeedbackAdmin />,
  },
]);
