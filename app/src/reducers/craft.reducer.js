const craft = (state = {}, action) => {
  switch (action.type) {
    case 'SELECT_CRAFT':
      return action.craft;
    default:
      return state;
  }
};

export default craft;
