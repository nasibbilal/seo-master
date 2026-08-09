export const openDirectAdLink = () => {
  try {
    if (typeof window !== 'undefined') {
      window.open('https://omg10.com/4/11537741', '_blank');
    }
  } catch (e) {
    console.error('Failed to open ad link:', e);
  }
};
