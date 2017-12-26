const tooltip = (state = false, action) => {
  switch (action.type) {
    case 'TOGGLE_TOOLTIP':
      return action.toggle;
    default:
      return state;
  }
};

export default tooltip;
