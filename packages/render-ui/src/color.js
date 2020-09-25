import green from '@material-ui/core/colors/green';
import orange from '@material-ui/core/colors/orange';
import pink from '@material-ui/core/colors/pink';
import indigo from '@material-ui/core/colors/indigo';

export const defaults = {
  TEXT: 'black',
  DISABLED: 'grey',
  CORRECT: green[500],
  INCORRECT: orange[500],
  PRIMARY: indigo[500],
  PRIMARY_LIGHT: indigo[200],
  PRIMARY_DARK: indigo[800],
  SECONDARY: pink.A400,
  SECONDARY_LIGHT: pink[200],
  SECONDARY_DARK: pink[900],
  BACKGROUND: 'rgba(255,255,255,0)'
};

Object.freeze(defaults);

export const v = prefix => (...args) => {
  const fallback = args.pop();
  return args.reduceRight((acc, v) => {
    return `var(--${prefix}-${v}, ${acc})`;
  }, fallback);
};

const pv = v('pie');

export const text = () => pv('text', defaults.TEXT);
export const disabled = () => pv('disabled', defaults.DISABLED);
export const correct = () => pv('correct', defaults.CORRECT);
export const incorrect = () => pv('incorrect', defaults.INCORRECT);

export const primary = () => pv('primary', defaults.PRIMARY);
export const primaryLight = () => pv('primary-light', defaults.PRIMARY_LIGHT);
export const primaryDark = () => pv('primary-dark', defaults.PRIMARY_DARK);
export const primaryText = () => pv('primary-text', 'text', defaults.TEXT);

export const secondary = () => pv('secondary', defaults.SECONDARY);
export const secondaryLight = () => pv('secondary-light', defaults.SECONDARY_LIGHT);
export const secondaryDark = () => pv('secondary-dark', defaults.SECONDARY_DARK);

export const secondaryText = () => pv('secondary-text', 'text', defaults.TEXT);
export const background = () => pv('background', defaults.BACKGROUND);
