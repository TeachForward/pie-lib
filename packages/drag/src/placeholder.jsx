import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import grey from '@material-ui/core/colors/grey';

export const PlaceHolder = props => {
  const { children, classes, className, isOver, type, grid, disabled } = props;
  const names = classNames(
    classes.placeholder,
    disabled && classes.disabled,
    isOver && classes.over,
    classes[type],
    className
  );

  const style = {};

  if (grid && grid.columns) {
    style.gridTemplateColumns = `repeat(${grid.columns}, 1fr)`;
  }
  if (grid && grid.rows) {
    style.gridTemplateRows = `repeat(${grid.rows}, 1fr)`;
  }
  return (
    <div style={style} className={names}>
      {children}
    </div>
  );
};

PlaceHolder.propTypes = {
  classes: PropTypes.object.isRequired,
  grid: PropTypes.shape({
    columns: PropTypes.number,
    rows: PropTypes.number
  }),
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
  className: PropTypes.string,
  isOver: PropTypes.bool,
  index: PropTypes.number,
  type: PropTypes.string,
  disabled: PropTypes.bool
};

const styles = theme => ({
  placeholder: {
    width: '100%',
    height: '100%',
    background: '#EEEEEE',
    border: '1px solid #D1D1D1',
    transition: 'background-color 200ms linear, border-color 200ms linear',
    boxSizing: 'border-box',
    display: 'grid',
    gridRowGap: `${theme.spacing.unit}px`,
    gridColumnGap: `${theme.spacing.unit}px`,
    padding: theme.spacing.unit * 1
  },
  disabled: {
    boxShadow: 'none',
    background: 'white'
  },
  over: {
    border: `1px solid ${grey[500]}`,
    backgroundColor: `${grey[300]}`
  }
});

export default withStyles(styles)(PlaceHolder);
