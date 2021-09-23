const initialState = {
  data: [],
};

function rootReducer(state = initialState, action) {
  switch (action.type) {
    case "AddData":
      return { data: [...state.data, action.payload] };
    default:
      return state;
  }
}

export default rootReducer;
