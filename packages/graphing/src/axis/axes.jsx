import React from 'react';
import { Axis } from '@vx/axis';
import { types } from '@pie-lib/plot';
import PropTypes from 'prop-types';
import Arrow from './arrow';
import { withStyles } from '@material-ui/core';
import { countWords, findLongestWord, amountToIncreaseWidth, getTickValues } from '../utils';
import { color, Readable } from '@pie-lib/render-ui';

export const AxisPropTypes = {
  includeArrows: PropTypes.object,
  graphProps: PropTypes.object
};

const AxisDefaultProps = {
  includeArrows: {
    left: true,
    right: true,
    up: true,
    down: true
  }
};

const axisStyles = theme => ({
  line: {
    stroke: color.primary(),
    strokeWidth: 5
  },
  arrow: {
    fill: color.primary()
  },
  tick: {
    fill: color.primary(),
    '& > line': {
      stroke: color.primary()
    }
  },
  labelFontSize: {
    fontSize: theme.typography.fontSize
  },
  axisLabelHolder: {
    padding: 0,
    margin: 0,
    textAlign: 'center',
    '* > *': {
      margin: 0,
      padding: 0
    },
    fontSize: theme.typography.fontSize
  }
});

const tickLabelStyles = {
  fontFamily: 'Roboto',
  fontSize: '14px',
  cursor: 'inherit'
};

export const sharedValues = (
  firstNegativeX,
  firstNegativeY,
  distantceFromOriginToFirstNegativeX,
  distantceFromOriginToFirstNegativeY,
  deltaAllowance,
  dy
) => {
  let result = [];

  if (
    firstNegativeX === firstNegativeY &&
    distantceFromOriginToFirstNegativeX - deltaAllowance < distantceFromOriginToFirstNegativeY &&
    distantceFromOriginToFirstNegativeY < distantceFromOriginToFirstNegativeX + deltaAllowance &&
    distantceFromOriginToFirstNegativeX - deltaAllowance < dy &&
    dy < distantceFromOriginToFirstNegativeX + deltaAllowance
  ) {
    result.push(firstNegativeX);
  }

  return result;
};

export const firstNegativeValue = interval => (interval || []).find(element => element < 0);

export class RawXAxis extends React.Component {
  static propTypes = {
    ...AxisPropTypes,
    classes: PropTypes.object,
    graphProps: types.GraphPropsType.isRequired
  };
  static defaultProps = AxisDefaultProps;

  render() {
    const {
      includeArrows,
      classes,
      graphProps,
      columnTicksValues,
      skipValues,
      distantceFromOriginToFirstNegativeY,
      dy
    } = this.props;
    const { scale, domain, size, range } = graphProps || {};

    // Having 0 as a number in columnTicksValues does not make 0 to show up
    // so we use this trick, by defining it as a string:
    const tickValues =
      (domain.labelStep || range.labelStep) && domain.min <= 0
        ? ['0', ...columnTicksValues]
        : columnTicksValues;
    // However, the '0' has to be displayed only if other tick labels (y-axis or x-axis) are displayed

    const labelProps = label => {
      let y = dy;

      if (skipValues && skipValues[0] === label) {
        y = distantceFromOriginToFirstNegativeY + 4;
      }

      return {
        ...tickLabelStyles,
        textAnchor: 'middle',
        y: y,
        dx: label === '0' ? -10 : 0,
        dy: label === '0' ? -7 : 0
      };
    };

    const necessaryRows = countWords(domain.axisLabel);
    const longestWord = findLongestWord(domain.axisLabel);
    const necessaryWidth = amountToIncreaseWidth(longestWord);

    return (
      <React.Fragment>
        <Axis
          axisLineClassName={classes.line}
          scale={scale.x}
          top={scale.y(0)}
          left={0}
          label={domain.label}
          tickClassName={classes.tick}
          tickFormat={value => value}
          tickLabelProps={labelProps}
          tickValues={tickValues}
        />
        {includeArrows && includeArrows.left && (
          <Arrow direction="left" x={domain.min} y={0} className={classes.arrow} scale={scale} />
        )}
        {includeArrows && includeArrows.right && (
          <Arrow direction="right" x={domain.max} y={0} className={classes.arrow} scale={scale} />
        )}
        {domain.axisLabel && (
          <foreignObject
            x={size.width + 10}
            y={scale.y(0) - 10}
            width={necessaryWidth}
            height={20 * necessaryRows}
          >
            <div
              dangerouslySetInnerHTML={{ __html: domain.axisLabel }}
              className={classes.labelFontSize}
            />
          </foreignObject>
        )}
      </React.Fragment>
    );
  }
}

const XAxis = withStyles(axisStyles)(RawXAxis);

export class RawYAxis extends React.Component {
  static propTypes = {
    ...AxisPropTypes,
    graphProps: types.GraphPropsType.isRequired
  };
  static defaultProps = AxisDefaultProps;

  render() {
    const { classes, includeArrows, graphProps, skipValues, rowTickValues } = this.props;
    const { scale, range, size } = graphProps || {};

    const necessaryWidth = range.axisLabel ? amountToIncreaseWidth(range.axisLabel.length) : 0;

    const customTickFormat = value => {
      if (skipValues && skipValues.indexOf(value) >= 0) {
        return '';
      }

      return value;
    };

    return (
      <React.Fragment>
        <Axis
          axisLineClassName={classes.line}
          orientation={'left'}
          scale={scale.y}
          top={0}
          height={size.height}
          left={scale.x(0)}
          label={range.label}
          labelProps={{ 'data-pie-readable': false }}
          tickLength={10}
          tickClassName={classes.tick}
          tickFormat={customTickFormat}
          tickLabelProps={value => {
            const digits = value.toLocaleString().length || 1;
            return {
              ...tickLabelStyles,
              dy: 4,
              dx: -8 - digits * 5,
              'data-pie-readable': false
            };
          }}
          hideZero={true}
          tickTextAnchor={'bottom'}
          tickValues={rowTickValues}
        />

        {includeArrows && includeArrows.down && (
          <Arrow direction="down" x={0} y={range.min} className={classes.arrow} scale={scale} />
        )}
        {includeArrows && includeArrows.up && (
          <Arrow direction="up" x={0} y={range.max} className={classes.arrow} scale={scale} />
        )}
        {range.axisLabel && (
          <foreignObject
            x={scale.x(0) - necessaryWidth / 2}
            y={-25}
            width={necessaryWidth}
            height="20"
          >
            <Readable false>
              <div
                dangerouslySetInnerHTML={{ __html: range.axisLabel }}
                className={classes.axisLabelHolder}
              />
            </Readable>
          </foreignObject>
        )}
      </React.Fragment>
    );
  }
}
const YAxis = withStyles(axisStyles)(RawYAxis);

export default class Axes extends React.Component {
  static propTypes = {
    ...AxisPropTypes,
    classes: PropTypes.object,
    graphProps: types.GraphPropsType.isRequired
  };
  static defaultProps = AxisDefaultProps;

  xValues = () => {
    const { graphProps } = this.props;
    const { scale, domain } = graphProps || {};
    if (!domain || !scale) {
      return;
    }

    const ticks = getTickValues({ ...domain, step: domain.labelStep });
    const negative = firstNegativeValue(ticks);

    return {
      columnTicksValues: ticks,
      firstNegativeX: negative,
      distantceFromOriginToFirstNegativeX: Math.abs(scale.y(0) - scale.y(negative))
    };
  };

  yValues = () => {
    const { graphProps } = this.props;
    const { scale, range } = graphProps || {};
    if (!range || !scale) {
      return;
    }

    const ticks = getTickValues({ ...range, step: range.labelStep });
    const negative = firstNegativeValue(ticks);

    return {
      rowTickValues: ticks,
      firstNegativeY: negative,
      distantceFromOriginToFirstNegativeY: Math.abs(scale.x(0) - scale.x(negative))
    };
  };

  render() {
    const { graphProps } = this.props;
    const { domain, range } = graphProps || {};

    // x
    const {
      columnTicksValues,
      firstNegativeX,
      distantceFromOriginToFirstNegativeX
    } = this.xValues();
    const result = this.xValues();

    // y
    const { rowTickValues, firstNegativeY, distantceFromOriginToFirstNegativeY } = this.yValues();

    const deltaAllowance = 6;
    const dy = 25;

    const skipValues = sharedValues(
      firstNegativeX,
      firstNegativeY,
      distantceFromOriginToFirstNegativeX,
      distantceFromOriginToFirstNegativeY,
      deltaAllowance,
      dy
    );

    // each axis has to be displayed only if the domain & range include it
    return (
      <React.Fragment>
        {range.min <= 0 ? (
          <XAxis
            {...this.props}
            skipValues={skipValues}
            columnTicksValues={columnTicksValues}
            distantceFromOriginToFirstNegativeY={distantceFromOriginToFirstNegativeY}
            dy={dy}
          />
        ) : null}
        {domain.min <= 0 ? (
          <YAxis
            {...this.props}
            skipValues={skipValues}
            rowTickValues={rowTickValues}
            distantceFromOriginToFirstNegativeX={distantceFromOriginToFirstNegativeX}
          />
        ) : null}
      </React.Fragment>
    );
  }
}
