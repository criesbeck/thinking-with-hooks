import React, {Suspense, useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import { AppBar, CssBaseline, Grid, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import './App.css';

// https://github.com/mui-org/material-ui/tree/master/docs/src/pages/getting-started/page-layout-examples/sign-in
const styles = theme => ({
  main: {
    width: 'auto',
    display: 'block', // Fix IE 11 issue.
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3,
    [theme.breakpoints.up(400 + theme.spacing.unit * 3 * 2)]: {
      width: 400,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },
  paper: {
    marginTop: theme.spacing.unit * 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme.spacing.unit * 3}px`,
  },
});

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
  const items = groups.map(group => 
    <ProductGroup group={group} key={group.tag} filterFn={filterFn} />);
  return (
    <Grid container direction="column">{items}</Grid>
  );
}

function ControlBar(props) {
  const {inStockOnly, setInStockOnly, filterText, setFilterText} = props;
  const toggleInStockOnly = () => setInStockOnly(!inStockOnly);
  const handleFilterChange = (evt) => setFilterText(evt.target.value);
  return (
    <AppBar position='static'>
      <Grid container direction="column" >
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
  const {classes, url} = props;
  const [inStockOnly, setInStockOnly] = useState(false);
  const [filterText, setFilterText] = useState('');
  const re = new RegExp(filterText, "i");
  const filterFn = product => 
    (!inStockOnly || product.stocked) && product.name.search(re) !== -1;
  const [groups, error] = useProductFetch(url);

  if (error) return <span>ERROR: {error.message}</span>;
  if (!groups) return null
  return (
    <main className={classes.main}>
      <CssBaseline />
        <ControlBar inStockOnly={inStockOnly} setInStockOnly={setInStockOnly}
          filterText={filterText} setFilterText={setFilterText} />
        <Suspense fallback={<span>Loading...</span>}>
          <ProductGroupList groups={groups} filterFn={filterFn} />
        </Suspense>
    </main>
  );
}

App.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(App);
