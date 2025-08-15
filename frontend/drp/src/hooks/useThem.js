import { useSelector } from 'react-redux';

const colorPalettes = {
  dark: {
    orange: '#FF6B35',
    blueGray: '#1e202b',
    darkerBlueGray: '#171a23',
    darkestBlueGray: '#171a23',
    textColor: '#d6d7d7',
    textSecondary: '#9ca3af',
    red: '#ff5722',
    green: '#4CAF50',
  },
  light: {
    orange: '#FF6B35',
    blueGray: '#f2f4f8',
    darkerBlueGray: '#e6e9ef',
    darkestBlueGray: '#d8dce4',
    textColor: '#1e202b',
    textSecondary: '#4b5563',
    red: '#e53935',
    green: '#43A047',
  }
};

export const useTheme = () => {
  const isDarkMode = useSelector(state => state.theme.isDarkMode);
  const colors = colorPalettes[isDarkMode ? 'dark' : 'light'];
  
  return {
    colors,
    isDarkMode,
  };
};
