import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { types } from '@pie-lib/plot';
import { AxisLeft, AxisBottom } from '@vx/axis';
import { bandKey, getTickValues, getRotateAngle, getTopPadding } from './utils';
import MarkLabel from './mark-label';

export class TickComponent extends React.Component {
  changeCategory = (index, newLabel) => {
    const { categories, onChangeCategory } = this.props;
    const category = categories[index];

    onChangeCategory(index, { ...category, label: newLabel });
  };

  deleteCategory = index => {
    const { categories, onChange } = this.props;

    if (index >= 0 && categories[index]) {
      onChange([...categories.slice(0, index), ...categories.slice(index + 1)]);
    }
  };

  render() {
    const {
      categories,
      xBand,
      bandWidth,
      barWidth,
      rotate,
      top,
      graphProps,
      x,
      y,
      formattedValue
    } = this.props;

    if (!formattedValue) {
      return null;
    }

    const index = parseInt(formattedValue.split('-')[0], 10);
    const category = categories[index];
    const { deletable, editable, interactive, label } = category || {};
    const barX = xBand(bandKey({ label }, index));

    return (
      <g>
        <foreignObject
          x={bandWidth ? barX : x - barWidth / 2}
          y={6}
          width={barWidth}
          height={24}
          style={{ pointerEvents: 'none', overflow: 'visible' }}
        >
          <MarkLabel
            inputRef={r => (this.input = r)}
            disabled={!(editable && interactive)}
            mark={category}
            graphProps={graphProps}
            onChange={newLabel => this.changeCategory(index, newLabel)}
            barWidth={barWidth}
            rotate={rotate}
          />
        </foreignObject>
        {deletable && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            x={x - 8}
            y={y + 4 + top}
            width={16}
            height={16}
            viewBox="0 0 512 512"
            onClick={() => this.deleteCategory(index)}
          >
            <path d="M128 405.429C128 428.846 147.198 448 170.667 448h170.667C364.802 448 384 428.846 384 405.429V160H128v245.429zM416 96h-80l-26.785-32H202.786L176 96H96v32h320V96z" />
          </svg>
        )}
      </g>
    );
  }
}

TickComponent.propTypes = {
  categories: PropTypes.array,
  xBand: PropTypes.func,
  bandWidth: PropTypes.number,
  barWidth: PropTypes.number,
  rotate: PropTypes.number,
  top: PropTypes.number,
  x: PropTypes.number,
  y: PropTypes.number,
  graphProps: PropTypes.object,
  formattedValue: PropTypes.array,
  onChangeCategory: PropTypes.func,
  onChange: PropTypes.func
};

class RawChartAxes extends React.Component {
  static propTypes = {
    bottomScale: PropTypes.func,
    classes: PropTypes.object.isRequired,
    categories: PropTypes.array,
    graphProps: types.GraphPropsType.isRequired,
    xBand: PropTypes.func,
    leftAxis: PropTypes.bool,
    onChange: PropTypes.func,
    onChangeCategory: PropTypes.func
  };

  render() {
    const {
      classes,
      graphProps,
      xBand,
      leftAxis,
      onChange,
      onChangeCategory,
      categories
    } = this.props;
    const { axis, axisLine, tick, axisLabel } = classes;
    const { scale, range, domain, size } = graphProps;
    const bottomScale = xBand.rangeRound([0, size.width]);
    const bandWidth = xBand.bandwidth();
    // for chartType "line", bandWidth will be 0, so we have to calculate it
    const barWidth = bandWidth || scale.x(domain.max) / categories.length;
    const rowTickValues = getTickValues({ ...range, step: range.labelStep });
    const rotate = getRotateAngle(barWidth);
    const top = getTopPadding(barWidth);

    const getTickLabelProps = value => ({
      dy: 4,
      dx: -10 - (value.toLocaleString().length || 1) * 5
    });

    const getTickComponent = props => {
      const properties = {
        categories,
        xBand,
        bandWidth,
        barWidth,
        rotate,
        top,
        onChangeCategory,
        onChange,
        graphProps,
        x: props.x,
        y: props.y,
        formattedValue: props.formattedValue
      };

      return <TickComponent {...properties} />;
    };

    return (
      <React.Fragment>
        {leftAxis && (
          <AxisLeft
            scale={scale.y}
            className={axis}
            axisLineClassName={axisLine}
            tickLength={10}
            tickClassName={tick}
            tickFormat={value => value}
            label={range.label}
            labelClassName={axisLabel}
            tickValues={rowTickValues}
            tickLabelProps={getTickLabelProps}
          />
        )}
        <AxisBottom
          axisLineClassName={axisLine}
          labelClassName={axisLabel}
          tickClassName={tick}
          scale={bottomScale}
          label={domain.label}
          labelProps={{ y: 50 }}
          top={scale.y(range.min)}
          textLabelProps={() => ({ textAnchor: 'middle' })}
          tickFormat={count => count}
          tickComponent={getTickComponent}
        />
        {leftAxis && range.axisLabel && (
          <text x={scale.x(0)} y={-10} textAnchor="middle">
            {range.axisLabel}
          </text>
        )}
        {domain.axisLabel && (
          <text x={size.width + 20} y={scale.y(0) + 5} textAnchor="middle">
            {domain.axisLabel}
          </text>
        )}
      </React.Fragment>
    );
  }
}

const ChartAxes = withStyles(theme => ({
  axisLabel: {
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: theme.typography.body1.fontSize,
    fill: theme.palette.secondary.main
  },
  axis: {
    stroke: theme.palette.primary.dark,
    strokeWidth: 2
  },
  axisLine: {
    stroke: theme.palette.primary.dark,
    strokeWidth: 2
  },
  tick: {
    '& > line': {
      stroke: theme.palette.primary.dark,
      strokeWidth: 2
    },
    fill: theme.palette.primary.dark,
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: theme.typography.overline.fontSize,
    textAnchor: 'middle'
  }
}))(RawChartAxes);

export default ChartAxes;
