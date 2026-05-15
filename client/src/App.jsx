import { Routes, Route } from "react-router-dom";
import { Box } from "@chakra-ui/react";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import TournamentsPage from "./pages/TournamentsPage";
import NewTournamentPage from "./pages/NewTournamentPage";
import TournamentDetailPage from "./pages/TournamentDetailPage";
import AddPlayersPage from "./pages/AddPlayersPage";

export default function App() {
  return (
    <Box minH="100vh" bg="brand.cream">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tournaments" element={<TournamentsPage />} />
        <Route path="/tournaments/new" element={<NewTournamentPage />} />
        <Route path="/tournaments/:id" element={<TournamentDetailPage />} />
        <Route path="/tournaments/:id/players" element={<AddPlayersPage />} />
      </Routes>
    </Box>
  );
}
