import { configureStore } from "@reduxjs/toolkit";
import onlineDemoReducer from "../features/onlineDemo/onlineDemoSlice";
import offlineDemoReducer from "../features/offlineDemo/offlineDemoSlice";
import oneToOneReducer from "../features/oneToOne/oneToOneSlice";
import liveClassesReducer from "../features/liveClasses/liveClassesSlice";

export const store = configureStore({
  reducer: {
    onlineDemo: onlineDemoReducer,
    offlineDemo: offlineDemoReducer,
    oneToOne: oneToOneReducer, 
    liveClasses: liveClassesReducer,
  },
});
