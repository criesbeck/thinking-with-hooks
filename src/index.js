import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

function groupByTags(products) {
  const tags = Array.from(new Set(products.flatMap(product => product.tags))).sort();
  return tags.map(tag => ({
    tag,
    products: products.filter(product => product.tags.includes(tag))
  }));
}

const PRODUCTS = [
  {tags: ['Sporting Goods'], price: '$49.99', stocked: true, name: 'Football'},
  {tags: ['Sporting Goods'], price: '$9.99', stocked: true, name: 'Baseball'},
  {tags: ['Sporting Goods'], price: '$29.99', stocked: false, name: 'Basketball'},
  {tags: ['Electronics'], price: '$99.99', stocked: true, name: 'iPod Touch'},
  {tags: ['Electronics'], price: '$399.99', stocked: false, name: 'iPhone 5'},
  {tags: ['Electronics'], price: '$199.99', stocked: true, name: 'Nexus 7'},
  {tags: ['Electronics', 'Sporting Goods'], price: '$26.99', stocked: true, name: 'Ultrak 100 lap timer'}
];

const GROUPS = groupByTags(PRODUCTS);

ReactDOM.render(<App groups={GROUPS} />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
