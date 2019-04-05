import React, {Suspense, useEffect, useState} from 'react';
import { Container, Form, List, Segment } from 'semantic-ui-react';
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
  const { group, filter } = props;
  const {tag, products} = group;
  const filtered = products.filter(filter.test);
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
  const { groups, filter } = props;
  const items = groups.map(group => 
    <ProductGroup group={group} key={group.tag} filter={filter} />);
  return (
    <List>{items}</List>
  );
}

function ControlBar(props) {
  const { filter } = props;
  const toggleInStockOnly = () => filter.setInStockOnly(!filter.inStockOnly);
  const handleFilterChange = (evt) => filter.setFilterText(evt.target.value);
  return (
    <Segment inverted>
      <Form inverted>
        <Form.Group inline>
          <Form.Input placeholder="Filter..." value={filter.text}
            onChange={handleFilterChange} />
          <Form.Checkbox label="In stock only" checked={filter.inStockOnly}
            onChange={toggleInStockOnly} />
        </Form.Group>
      </Form>
    </Segment>
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

const useFilter = () => {
  const [inStockOnly, setInStockOnly] = useState(false);
  const [filterText, setFilterText] = useState('');
  const re = new RegExp(filterText, "i");
  return {
    test(product) {
      return (!inStockOnly || product.stocked) && product.name.search(re) !== -1;
    },
    text: filterText,
    inStockOnly: inStockOnly,
    setInStockOnly,
    setFilterText
  };
}
function App(props) {
  const {url} = props;
  const [groups, error] = useProductFetch(url);
  const filter = useFilter();

  if (error) return <span>ERROR: {error.message}</span>;
  if (!groups) return null
  return (
    <React.Fragment>
      <ControlBar filter={filter}/>
      <Container>
        <Suspense fallback={<span>Loading...</span>}>
          <ProductGroupList groups={groups} filter={filter} />
        </Suspense>
      </Container>
    </React.Fragment>
  );
}

export default App;
