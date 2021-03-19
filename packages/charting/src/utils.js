import { scaleBand, scalePoint } from '@vx/scale';
import { utils } from '@pie-lib/plot';

export const tickCount = utils.tickCount;
export const bounds = utils.bounds;
export const point = utils.point;

export const bandKey = (d, index) => `${index}-${d.label || '-'}`;

export const dataToXBand = (scaleX, data, width, type) => {
  switch (type) {
    case 'bar':
    case 'dotPlot':
    case 'linePlot':
      return scaleBand({
        rangeRound: [0, width],
        domain: data && data.map(bandKey),
        padding: 0.2
      });
    case 'histogram':
      return scaleBand({
        rangeRound: [0, width],
        domain: data && data.map(bandKey),
        padding: 0
      });
    case 'lineCross':
    case 'lineDot':
      return scalePoint({
        domain: data && data.map(bandKey),
        rangeRound: [0, width]
      });
    default:
      return scaleBand({
        range: [0, width],
        domain: data && data.map(bandKey),
        padding: 0
      });
  }
};

export const getTickValues = (prop = {}) => {
  const tickValues = [];
  let tickVal = prop.min;

  while (tickVal <= prop.max) {
    tickValues.push(tickVal);
    tickVal = Math.round((tickVal + prop.step) * 100) / 100;
  }

  return tickValues;
};

export const customLabelStep = (range, size, tickWidth) => {
  const rangeMax = Math.ceil(range.max);
  const segmentLength = size.height / rangeMax;

  // how many ticksWidth fit in a segment
  let tickWidthPerSegment = segmentLength / tickWidth;

  const ticksToFitInOneSegment = 1;

  const labelStep = ticksToFitInOneSegment / tickWidthPerSegment;
  const roundedStep = Math.ceil((labelStep * 10) / 10);

  return labelStep > 0.15 ? roundedStep : labelStep;
};

export const crowdedTicks = (range, size, tickWidth) => {
  const rangeMax = Math.ceil(range.max);
  const numberOfSegments = rangeMax * range.labelStep;

  return size.height / numberOfSegments < tickWidth;
};

export const getDomainAndRangeByChartType = (domain, range, size, tickWidth, chartType) => {
  let { step, labelStep, min, max } = range || {};

  const crowded = crowdedTicks(range, size, tickWidth);

  if (!min) {
    min = 0;
  }

  if (!max || max < 0) {
    max = range.min + 1;
  }

  if (!labelStep || crowded) {
    labelStep = customLabelStep(range, size, tickWidth);
  }

  if (!step || step < labelStep) {
    if (labelStep <= 4) {
      step = 1;
    } else if (labelStep > 4 && labelStep < 10) {
      step = labelStep / 2;
    } else {
      step = labelStep / 3;
    }
  } else {
    step = labelStep;
  }

  switch (chartType) {
    // if chart is dot plot or line plot, we should ignore step and make sure that min & max are integer values
    case 'dotPlot':
    case 'linePlot': {
      const intMin = Math.round(min);
      const intMax = Math.round(max);

      return {
        domain: {
          ...domain,
          step: 1,
          labelStep: 1,
          min: 0,
          max: 1
        },
        range: {
          ...range,
          min: intMin,
          max: intMin === intMax ? intMin + 1 : intMax,
          labelStep,
          step: 1
        }
      };
    }
    default:
      return {
        domain: {
          ...domain,
          step: 1,
          labelStep: 1,
          min: 0,
          max: 1
        },
        range: {
          ...range,
          labelStep,
          step
        }
      };
  }
};

export const getGridLinesAndAxisByChartType = (range, chartType) => {
  switch (chartType) {
    case 'lineDot':
    case 'lineCross':
      return {
        verticalLines: undefined,
        horizontalLines: getTickValues(range),
        leftAxis: true
      };
    case 'dotPlot':
    case 'linePlot':
      return {
        verticalLines: [],
        horizontalLines: [],
        leftAxis: false
      };
    default:
      return {
        verticalLines: [],
        horizontalLines: getTickValues(range),
        leftAxis: true
      };
  }
};

export const getRotateAngle = barWidth => {
  if (barWidth < 30) {
    return 75;
  }

  if (barWidth < 40) {
    return 45;
  }

  if (barWidth < 60) {
    return 25;
  }

  return 0;
};

export const getTopPadding = barWidth => {
  if (barWidth < 30) {
    return 50;
  }

  if (barWidth < 40) {
    return 30;
  }

  if (barWidth < 60) {
    return 15;
  }

  return 0;
};
