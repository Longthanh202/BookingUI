import React from "react";
import AppRouters from "./routes/AppRoutes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "react-datepicker/dist/react-datepicker.css";
import Toast from "./components/common/Toast";

const queryClient = new QueryClient();
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <AppRouters />
        <Toast />
      </div>
    </QueryClientProvider>
  );
}

export default App;
