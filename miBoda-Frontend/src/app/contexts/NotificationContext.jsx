import { createContext, useEffect, useMemo, useReducer } from "react";
import axios from "axios";

const reducer = (state, action) => {
  switch (action.type) {
    case "LOAD_NOTIFICATIONS": {
      return { ...state, notifications: action.payload };
    }

    case "DELETE_NOTIFICATION": {
      return { ...state, notifications: action.payload };
    }

    case "CLEAR_NOTIFICATIONS": {
      return { ...state, notifications: action.payload };
    }

    default:
      return state;
  }
};

const NotificationContext = createContext({
  notifications: [],
  deleteNotification: () => {},
  clearNotifications: () => {},
  getNotifications: () => {},
  createNotification: () => {}
});

export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, { notifications: [] });

  const deleteNotification = async (notificationID) => {
    try {
      const res = await axios.post("/api/notification/delete", { id: notificationID });
      dispatch({ type: "DELETE_NOTIFICATION", payload: res.data });
    } catch (e) {
      console.error(e);
    }
  };

  const clearNotifications = async () => {
    try {
      const res = await axios.post("/api/notification/delete-all");
      dispatch({ type: "CLEAR_NOTIFICATIONS", payload: res.data });
    } catch (e) {
      console.error(e);
    }
  };

  const getNotifications = async () => {
    try {
      const res = await axios.get("/api/notification");
      const list = Array.isArray(res.data) ? res.data : [];
      dispatch({ type: "LOAD_NOTIFICATIONS", payload: list });
    } catch (e) {
      dispatch({ type: "LOAD_NOTIFICATIONS", payload: [] });
    }
  };

  const createNotification = async (notification) => {
    try {
      const res = await axios.post("/api/notification/add", { notification });
      dispatch({ type: "CREATE_NOTIFICATION", payload: res.data });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    getNotifications();
  }, []);

  const value = useMemo(
    () => ({
      getNotifications,
      deleteNotification,
      clearNotifications,
      createNotification,
      notifications: state.notifications
    }),
    [state.notifications]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
