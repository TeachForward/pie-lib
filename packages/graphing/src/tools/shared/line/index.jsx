import React from 'react';
import isEqual from 'lodash/isEqual';
import { BasePoint } from '../point';
import { types, utils, gridDraggable, trig } from '@pie-lib/plot';
import PropTypes from 'prop-types';
import { disabled, correct, incorrect } from '../styles';
import ReactDOM from 'react-dom';
import MarkLabel from '../../../mark-label';
import isEmpty from 'lodash/isEmpty';

export const lineTool = (type, Component) => () => ({
  type,
  Component,
  addPoint: (point, mark) => {
    if (mark && isEqual(mark.root, point)) {
      return mark;
    }

    if (!mark) {
      return {
        type,
        building: true,
        from: point
      };
    }

    if (isEqual(point, mark.from)) {
      return { ...mark };
    }

    return { ...mark, building: false, to: point };
  }
});

export const lineToolComponent = Component => {
  return class LineToolComponent extends React.Component {
    static propTypes = {
      ...types.ToolPropTypeFields,
      graphProps: types.GraphPropsType.isRequired
    };

    constructor(props) {
      super(props);
      this.state = {};
    }

    startDrag = () => this.setState({ mark: { ...this.props.mark } });

    stopDrag = () => {
      const { onChange } = this.props;
      const update = { ...this.state.mark };

      this.setState({ mark: undefined }, () => {
        if (!isEqual(this.props.mark, update)) {
          onChange(this.props.mark, update);
        }
      });
    };

    changeMark = ({ from, to }) => {
      const mark = { ...this.state.mark, from, to };

      this.setState({ mark });
    };

    changeMarkProps = ({ from, to }) => {
      const { onChange, mark } = this.props;
      let update = { ...mark, ...this.state.mark };

      if (from) {
        update = { ...update, from };
      }

      if (to) {
        update = { ...update, to };
      }

      if (!isEqual(mark, update)) {
        onChange(mark, update);
      }
    };

    render() {
      const { graphProps, onClick, labelNode, labelModeEnabled } = this.props;
      const mark = this.state.mark ? this.state.mark : this.props.mark;

      return (
        <Component
          disabled={mark.disabled}
          correctness={mark.correctness}
          from={mark.from}
          to={mark.to}
          graphProps={graphProps}
          onChange={this.changeMark}
          changeMarkProps={this.changeMarkProps}
          onClick={onClick}
          onDragStart={this.startDrag}
          onDragStop={this.stopDrag}
          labelNode={labelNode}
          labelModeEnabled={labelModeEnabled}
        />
      );
    }
  };
};

const dragOpts = () => ({
  bounds: (props, { domain, range }) => {
    const area = utils.lineToArea(props.from, props.to);
    return utils.bounds(area, domain, range);
  },
  anchorPoint: props => {
    const { from } = props;
    return from;
  },
  fromDelta: (props, delta) => {
    const { from, to } = props;
    return {
      from: utils.point(from).add(utils.point(delta)),
      to: utils.point(to).add(utils.point(delta))
    };
  }
});

const equalPoints = (p1, p2) => p1 && p2 && isEqual({ x: p1.x, y: p1.y }, { x: p2.x, y: p2.y });

export const lineBase = (Comp, opts) => {
  const DraggableComp = gridDraggable(dragOpts())(Comp);

  const FromPoint = opts && opts.from ? opts.from : BasePoint;
  const ToPoint = opts && opts.to ? opts.to : BasePoint;

  class LineBase extends React.Component {
    static propTypes = {
      graphProps: types.GraphPropsType,
      from: types.PointType,
      to: types.PointType,
      onChange: PropTypes.func,
      onDragStart: PropTypes.func,
      onDragStop: PropTypes.func,
      onClick: PropTypes.func,
      correctness: PropTypes.string,
      disabled: PropTypes.bool,
      labelNode: PropTypes.object,
      labelModeEnabled: PropTypes.bool,
      changeMarkProps: PropTypes.func
    };

    onChangePoint = point => {
      // because point.from.label and point.to.label can be different
      if (!equalPoints(point.from, point.to)) {
        this.props.onChange(point);
      }
    };

    dragComp = ({ from: draggedFrom, to: draggedTo }) => {
      const { from, to, onChange } = this.props;

      if (from.label) {
        draggedFrom.label = from.label;
      }

      if (to.label) {
        draggedTo.label = to.label;
      }

      onChange({ from: draggedFrom, to: draggedTo });
    };

    dragFrom = draggedFrom => {
      const { from, to } = this.props;

      if (from.label) {
        draggedFrom.label = from.label;
      }

      if (!equalPoints(draggedFrom, to)) {
        this.onChangePoint({ from: draggedFrom, to: to });
      }
    };

    dragTo = draggedTo => {
      const { from, to } = this.props;

      if (to.label) {
        draggedTo.label = to.label;
      }

      if (!equalPoints(from, draggedTo)) {
        this.onChangePoint({ from: from, to: draggedTo });
      }
    };

    labelChange = (point, type) => {
      const { changeMarkProps } = this.props;
      const update = { ...point };

      if (!point.label || isEmpty(point.label)) {
        delete update.label;
      }

      changeMarkProps({ [type]: update });
    };

    clickPoint = (point, type) => {
      const { changeMarkProps, from, to } = this.props;

      changeMarkProps({ from, to, [type]: { label: '', ...point } });

      if (this.input[type]) {
        this.input[type].focus();
      }
    };

    // IMPORTANT, do not remove
    input = {};

    render() {
      const {
        graphProps,
        onDragStart,
        onDragStop,
        from,
        to,
        disabled,
        correctness,
        onClick,
        labelNode,
        labelModeEnabled
      } = this.props;
      const common = { graphProps, onDragStart, onDragStop, disabled, correctness, onClick };
      const angle = to ? trig.toDegrees(trig.angle(from, to)) : 0;

      let fromLabelNode = null;
      let toLabelNode = null;

      if (labelNode) {
        if (from && from.hasOwnProperty('label')) {
          fromLabelNode = ReactDOM.createPortal(
            <MarkLabel
              inputRef={r => (this.input.from = r)}
              disabled={!labelModeEnabled}
              mark={from}
              graphProps={graphProps}
              onChange={label => this.labelChange({ ...from, label }, 'from')}
            />,
            labelNode
          );
        }

        if (to && to.hasOwnProperty('label')) {
          toLabelNode = ReactDOM.createPortal(
            <MarkLabel
              inputRef={r => (this.input.to = r)}
              disabled={!labelModeEnabled}
              mark={to}
              graphProps={graphProps}
              onChange={label => this.labelChange({ ...to, label }, 'to')}
            />,
            labelNode
          );
        }
      }

      return (
        <g>
          {to && <DraggableComp from={from} to={to} onDrag={this.dragComp} {...common} />}

          <FromPoint
            x={from.x}
            y={from.y}
            onDrag={this.dragFrom}
            {...common}
            onClick={labelModeEnabled ? () => this.clickPoint(from, 'from') : common.onClick}
          />
          {fromLabelNode}

          {to && (
            <ToPoint
              x={to.x}
              y={to.y}
              angle={angle} //angle + 45}
              onDrag={this.dragTo}
              {...common}
              onClick={labelModeEnabled ? () => this.clickPoint(to, 'to') : common.onClick}
            />
          )}
          {toLabelNode}
        </g>
      );
    }
  }

  return LineBase;
};

export const styles = {
  line: theme => ({
    fill: 'transparent',
    stroke: theme.palette.primary.light,
    strokeWidth: 3,
    transition: 'stroke 200ms ease-in, stroke-width 200ms ease-in',
    '&:hover': {
      strokeWidth: 6,
      stroke: theme.palette.primary.dark
    }
  }),
  arrow: theme => ({
    fill: `var(--point-bg, ${theme.palette.secondary.main})`
  }),
  disabledArrow: () => ({
    ...disabled()
  }),
  disabled: () => ({
    ...disabled('stroke'),
    strokeWidth: 2
  }),
  correct: (theme, key) => ({
    ...correct(key)
  }),
  incorrect: (theme, key) => ({
    ...incorrect(key)
  })
};
