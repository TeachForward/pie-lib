import { findSingleNode, selectedNode } from '../utils';

import React from 'react';
import Toolbar from './toolbar';
import classNames from 'classnames';
import debug from 'debug';
import injectSheet from 'react-jss';
import { primary } from '../../theme';

const log = debug('editable-html:plugins:toolbar:editor-and-toolbar');

export class RawEditorAndToolbar extends React.Component {
  render() {
    const {
      classes,
      children,
      value,
      plugins,
      onChange,
      onDone,
      focusedNode,
      readOnly
    } = this.props;

    const inFocus =
      value.isFocused || (focusedNode !== null && focusedNode !== undefined);
    const holderNames = classNames(
      classes.editorHolder,
      inFocus && classes.editorInFocus,
      readOnly && classes.readOnly
    );

    log(
      '[render] inFocus: ',
      inFocus,
      'value.isFocused:',
      value.isFocused,
      'focused node: ',
      focusedNode
    );

    return (
      <div className={classes.root}>
        <div className={holderNames}>
          <div className={classes.children}>{children}</div>
        </div>
        <Toolbar
          plugins={plugins}
          value={value}
          isFocused={inFocus}
          onChange={onChange}
          onDone={onDone}
        />
      </div>
    );
  }
}

const style = {
  root: {
    height: '100%',
    position: 'relative',
    padding: '0px',
    border: 'none',
    borderBottom: '0px solid #cccccc',
    borderRadius: '0px',
    cursor: 'text',
    '& [data-slate-editor="true"]': {
      overflow: 'auto',
      maxHeight: '500px'
    }
  },
  children: {
    padding: '7px',
    height: '100%'
  },
  editorHolder: {
    position: 'relative',
    height: '100%',
    padding: '0px',
    '&::before': {
      left: '0',
      right: '0',
      bottom: '0',
      height: '1px',
      content: '""',
      position: 'absolute',
      transition: 'background-color 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
      pointerEvents: 'none',
      backgroundColor: 'rgba(0, 0, 0, 0.42)'
    },
    '&::after': {
      left: '0',
      right: '0',
      bottom: '0',
      height: '1px',
      content: '""',
      position: 'absolute',
      transform: 'scaleX(0)',
      transition: `transform 200ms cubic-bezier(0.0, 0.0, 0.2, 1) 0ms, background-color 200ms linear`,
      backgroundColor: 'rgba(0, 0, 0, 0.42)'
    },
    '&:focus': {
      '&::after': {
        transform: 'scaleX(1)',
        backgroundColor: primary,
        height: '2px'
      }
    },
    '&:hover': {
      '&::after': {
        transform: 'scaleX(1)',
        backgroundColor: 'black',
        height: '2px'
      }
    }
  },

  readOnly: {
    // backgroundColor: 'rgba(0,0,0,0.05)',
    '&::before': {
      background: 'transparent',
      backgroundSize: '5px 1px',
      backgroundImage:
        'linear-gradient(to right, rgba(0, 0, 0, 0.42) 33%, transparent 0%)',
      backgroundRepeat: 'repeat-x',
      backgroundPosition: 'left top'
    },
    '&::after': {
      left: '0',
      right: '0',
      bottom: '0',
      height: '1px',
      content: '""',
      position: 'absolute',
      transform: 'scaleX(0)',
      transition: `transform 200ms cubic-bezier(0.0, 0.0, 0.2, 1) 0ms, background-color 0ms linear`,
      backgroundColor: 'rgba(0, 0, 0, 0)'
    },
    '&:hover': {
      '&::after': {
        transform: 'scaleX(0)',
        backgroundColor: 'black',
        height: '2px'
      }
    }
  },
  editorInFocus: {
    '&::after': {
      transform: 'scaleX(1)',
      backgroundColor: primary,
      height: '2px'
    },
    '&:hover': {
      '&::after': {
        backgroundColor: primary
      }
    }
  }
};

export default injectSheet(style)(RawEditorAndToolbar);
