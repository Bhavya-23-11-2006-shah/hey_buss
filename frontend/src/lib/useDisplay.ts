import { useContext } from 'react';
import { DisplayContext } from './display-context';

export function useDisplay() {
  return useContext(DisplayContext);
}
