import React, {useState} from 'react';
import { AppBar, CssBaseline, Grid, Typography } from '@material-ui/core';
import './App.css';

function ProductList(props) {
  const {products} = props;
  const items = products.map(product =>
    <li key={product.name}>
      <Typography>{product.name} {product.price}</Typography>
    </li>
  );

  return <ul className="product-list">{items}</ul>
}

function ProductGroup(props) {
  const {group, filterFn} = props;
  const {tag, products} = group;
  const filtered = products.filter(filterFn);
  return filtered.length === 0 ? null : (
    <Grid item><Typography varian="headline">{tag}</Typography>
      <ProductList products={filtered} />
    </Grid>
  );
}

function ProductGroupList(props) {
  const {groups, filterFn} = props;
  return groups.map(group => 
    <ProductGroup group={group} key={group.tag} filterFn={filterFn} />);
}

function ControlBar(props) {
  const {inStockOnly, setInStockOnly, filterText, setFilterText} = props;
  const toggleInStockOnly = () => setInStockOnly(!inStockOnly);
  const handleFilterChange = (evt) => setFilterText(evt.target.value);
  return (
    <AppBar position='static'>
      <Grid container direction='column'>
        <Grid item>
          <input type="text" placeholder="Filter..." value={filterText} onChange={handleFilterChange} />
        </Grid>
        <Grid item>
          <label>
            <input type="checkbox" checked={inStockOnly} onChange={toggleInStockOnly} /> 
              In stock only
          </label>
        </Grid>
      </Grid>
    </AppBar>
  )
}

function App(props) {
  const {groups} = props;
  const [inStockOnly, setInStockOnly] = useState(false);
  const [filterText, setFilterText] = useState('');
  const re = new RegExp(filterText, "i");
  const filterFn = product => 
    (!inStockOnly || product.stocked) && product.name.search(re) !== -1;
  return (
    <Grid container direction="column">
      <CssBaseline />
      <ControlBar inStockOnly={inStockOnly} setInStockOnly={setInStockOnly}
        filterText={filterText} setFilterText={setFilterText} />
      <ProductGroupList groups={groups} filterFn={filterFn} />
    </Grid>
  );
}

export default App;
