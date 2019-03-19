import React from 'react';
import ReactDOM from 'react-dom';
import {act} from 'react-testing-library';
import App from './App';

it('renders without crashing', () => {
  const div = document.createElement('div');
  act(() => {
    ReactDOM.render(<App />, div);
  });
  act(() => {
    ReactDOM.unmountComponentAtNode(div);
  });
});
