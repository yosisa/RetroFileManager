import { createSelector } from 'reselect';
import { dismissNotification } from './actions';

export function dismissNotifications(store) {
  var timers = {};
  const fn = createSelector([
    (state) => state.notifications
  ], notifications => {
    var newTimers = {};
    notifications.forEach(item => {
      if (!item.dismissAfter) {
        return;
      }
      if (timers.hasOwnProperty(item.id)) {
        newTimers[item.id] = timers[item.id];
        return;
      }
      newTimers[item.id] = setTimeout(() => {
        store.dispatch(dismissNotification(item.id));
      }, item.dismissAfter);
    });
    Object.keys(timers).forEach(id => {
      if (!newTimers.hasOwnProperty(id)) {
        clearTimeout(timers[id]);
      }
    });
    timers = newTimers;
  });
  return () => {
    fn(store.getState());
  };
}
