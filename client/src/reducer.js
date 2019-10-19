export default function reducer(state, { type, payload }) {
  console.log(type, payload);
  switch (type) {
    case 'LOGIN_USER':
      return {
        ...state,
        currentUser: payload,
      };
    default:
      return state;
  }
}
