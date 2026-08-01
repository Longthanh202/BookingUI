import React, { useState } from "react";
import AppRouters from "./routes/AppRoutes";
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import "react-datepicker/dist/react-datepicker.css";

const queryClient = new QueryClient();
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <AppRouters />
      </div>
    </QueryClientProvider>
  );
}

export default App;
