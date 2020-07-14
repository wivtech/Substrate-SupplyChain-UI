import React from 'react';

import { darkTheme, lightTheme } from 'themes/styles';

const themes = {
  darkTheme,
  lightTheme,
};

const ThemeContext = React.createContext({
  theme: themes.lightTheme,
  toggle: () => {},
});

ThemeContext.displayName = 'ThemeContext';

export { ThemeContext, themes };
