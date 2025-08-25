import { createSlice } from '@reduxjs/toolkit';
import api from '../utils/api';

const initialState = {
  isSpinning: false,
  winner: null,
  history: [],
  angle: 0,
  bet: { color: '', amount: 0 },
  loading: false,
  error: null,
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setBet(state, action) {
      state.bet = action.payload;
    },
    spinStart(state) {
      state.isSpinning = true;
      state.winner = null;
    },
    spinSuccess(state, action) {
      state.isSpinning = false;
      state.winner = action.payload.winningColor;
      state.angle = action.payload.finalAngle;
      state.history.unshift({
        time: new Date().toLocaleTimeString(),
        winner: action.payload.winningColor,
        won: action.payload.wonAmount,
      });
      if (state.history.length > 5) state.history.pop();
    },
    spinFailure(state, action) {
      state.isSpinning = false;
      state.error = action.payload;
    },
    setHistory(state, action) {
      state.history = action.payload;
    },
    updateAngle(state, action) {
      state.angle = action.payload;
    },
  },
});

export const { setBet, spinStart, spinSuccess, spinFailure, setHistory, updateAngle } = gameSlice.actions;

export const spinWheel = (betData) => async (dispatch, getState) => {
  dispatch(spinStart());
  try {
    const response = await api.post('/game/spin', betData);
    dispatch(spinSuccess(response.data));
    return response.data;
  } catch (error) {
    dispatch(spinFailure(error.response?.data?.message || 'Spin failed'));
    throw error;
  }
};

export const fetchGameHistory = (userId) => async (dispatch) => {
  try {
    const response = await api.get('/game/history', { params: { userId } });
    const formattedHistory = response.data.history.map(item => ({
      time: new Date(item.spinTime).toLocaleTimeString(),
      winner: item.winningColor,
      won: item.wonAmount,
      isForced: item.isForcedWin,
    }));
    dispatch(setHistory(formattedHistory));
  } catch (error) {
    console.error('Failed to fetch game history:', error);
  }
};

export default gameSlice.reducer;