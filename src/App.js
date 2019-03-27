import React, {Suspense, useEffect, useState} from 'react';
import { Container, List } from 'semantic-ui-react';
import './App.css';

function ProductList(props) {
  const {products} = props;
  const items = products.map(product =>
    <List.Item key={product.name}>
      {product.name} {product.price}
    </List.Item>
  );
  return <List.List>{items}</List.List>
}

function ProductGroup(props) {
  const {group, filterFn} = props;
  const {tag, products} = group;
  const filtered = products.filter(filterFn);
  return filtered.length === 0 ? null : (
    <List>
      <List.Header>{tag}</List.Header>
      <List.Content>
        <ProductList products={filtered} />
      </List.Content>
    </List>
  );
}

function ProductGroupList(props) {
  const {groups, filterFn} = props;
  const items = groups.map(group => 
    <ProductGroup group={group} key={group.tag} filterFn={filterFn} />);
  return (
    <List>{items}</List>
  );
}

function ControlBar(props) {
  const {inStockOnly, setInStockOnly, filterText, setFilterText} = props;
  const toggleInStockOnly = () => setInStockOnly(!inStockOnly);
  const handleFilterChange = (evt) => setFilterText(evt.target.value);
  return (
    <div className="ui fixed inverted menu">
      <div class="item">
        <input type="text" placeholder="Filter..." value={filterText} onChange={handleFilterChange} />
      </div>
      <div class="ui transparent inverted input item">
        <label>
          <input type="checkbox" checked={inStockOnly} onChange={toggleInStockOnly} /> 
            In stock only
        </label>
      </div>
    </div>
  )
}

function groupByTags(products) {
  if (products === null) {
    return null;
  }
  const tags = Array.from(new Set(products.flatMap(product => product.tags))).sort();
  return tags.map(tag => ({
    tag,
    products: products.filter(product => product.tags.includes(tag))
  }));
}

// custom hook
// modeled on https://www.robinwieruch.de/react-hooks-fetch-data/
function useProductFetch(url) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      setError(null);
      try {
        const response = await fetch(url);
        if (!response.ok) {
          return setError(response);
        }
        const json = await response.json(url);
        setData(groupByTags(json));
      }
      catch (exc) {
        setError(exc);
      }
    };
    fetchGroups();
  }, [url])

  return [data, error];
}

function App(props) {
  const {url} = props;
  const [inStockOnly, setInStockOnly] = useState(false);
  const [filterText, setFilterText] = useState('');
  const re = new RegExp(filterText, "i");
  const filterFn = product => 
    (!inStockOnly || product.stocked) && product.name.search(re) !== -1;
  const [groups, error] = useProductFetch(url);

  if (error) return <span>ERROR: {error.message}</span>;
  if (!groups) return null
  return (
    <React.Fragment>
      <ControlBar inStockOnly={inStockOnly} setInStockOnly={setInStockOnly}
        filterText={filterText} setFilterText={setFilterText} />
      <div className="ui main container">
        <Suspense fallback={<span>Loading...</span>}>
          <ProductGroupList groups={groups} filterFn={filterFn} />
        </Suspense>
      </div>
    </React.Fragment>
  );
}

export default App;
