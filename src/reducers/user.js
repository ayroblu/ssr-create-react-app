import { SET, RESET } from '../types/user'

const initialState = {
  email: 'ben@ben.com'
}

export default function reducer(state=initialState, action) {
  switch (action.type) {
    case SET:
      return {...state, ...action.payload}
    case RESET:
      return {...initialState}
    default:
      return state
  }
}

