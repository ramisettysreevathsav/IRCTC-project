const explicitlySet = (builder, asyncThunk, stateKey) => {
  builder
    .addCase(asyncThunk.pending, (state) => {
      state[stateKey] = 'loading';
      state.error = null;
    })
    .addCase(asyncThunk.fulfilled, (state, action) => {
      state[stateKey] = 'succeeded';
      state.message = action.payload.data;
    })
    .addCase(asyncThunk.rejected, (state, action) => {
      state[stateKey] = 'failed';
      state.error = action.payload || action.error.message;
    });
      
}
export default explicitlySet;