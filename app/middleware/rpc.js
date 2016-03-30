import memoize from 'lodash/memoize';

const grpc = require('remote').require('grpc');
const rfm = grpc.load('./rfm-pb/rfm.proto').rfm;

export const CALL_RPC = Symbol('Call RPC');

export default store => next => action => {
  const request = action[CALL_RPC];
  if (typeof request === 'undefined') {
    return next(action);
  }

  const { server, method, params } = request;
  const client = getClient(server);

  function actionWith(data) {
    const newAction = Object.assign({}, action, data);
    delete newAction[CALL_RPC];
    return newAction;
  }

  client[method](params, (error, response) => {
    if (error) {
      next(actionWith({error}));
    } else {
      next(actionWith({response}));
    }
  });
}

const getClient = memoize(addr => {
  return new rfm.FS(addr, grpc.credentials.createInsecure());
});
