import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Badge,
  SimpleGrid,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api/client";

function TournamentCard({ tournament }) {
  const navigate = useNavigate();

  const statusColor = {
    upcoming: "blue",
    active: "green",
    completed: "gray",
  };

  return (
    <Box
      bg="white"
      border="1px solid"
      borderColor="brand.goldLight"
      borderRadius="xl"
      p={6}
      boxShadow="sm"
      _hover={{ boxShadow: "md", borderColor: "brand.gold" }}
      transition="all 0.2s"
      cursor="pointer"
      onClick={() => navigate(`/tournaments/${tournament.id}`)}
    >
      <VStack align="start" spacing={3}>
        <Flex justify="space-between" w="full" align="start">
          <Heading size="md" color="brand.burgundy" fontFamily="heading" flex={1}>
            {tournament.name}
          </Heading>
          <Badge colorScheme={statusColor[tournament.status] || "gray"} ml={2}>
            {tournament.status}
          </Badge>
        </Flex>
        <Text fontSize="sm" color="gray.500">
          {new Date(tournament.date).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>
        <HStack spacing={4} fontSize="sm" color="gray.600">
          <Text>👥 {tournament.player_count ?? 0} players</Text>
          <Text>🔄 {tournament.rounds} rounds</Text>
          <Text>⏱ {tournament.round_minutes} min/round</Text>
        </HStack>
        <Button
          size="sm"
          variant="outline"
          w="full"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/tournaments/${tournament.id}`);
          }}
        >
          Manage →
        </Button>
      </VStack>
    </Box>
  );
}

export default function TournamentsPage() {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get("/tournaments")
      .then((res) => setTournaments(res.data))
      .catch(() => setError("Could not load tournaments. Is the server running?"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Container maxW="6xl" py={10}>
      <Flex justify="space-between" align="center" mb={8}>
        <VStack align="start" spacing={1}>
          <Heading size="xl" color="brand.burgundy" fontFamily="heading">
            Tournaments
          </Heading>
          <Text color="gray.500">All your Mahjong Maven events</Text>
        </VStack>
        <Button onClick={() => navigate("/tournaments/new")} size="md">
          + New Tournament
        </Button>
      </Flex>

      {loading && (
        <Flex justify="center" py={20}>
          <Spinner size="xl" color="brand.burgundy" />
        </Flex>
      )}

      {error && (
        <Alert status="warning" borderRadius="md" mb={6}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      {!loading && !error && tournaments.length === 0 && (
        <Box
          textAlign="center"
          py={20}
          border="2px dashed"
          borderColor="brand.goldLight"
          borderRadius="xl"
        >
          <Text fontSize="4xl" mb={4}>
            🀄
          </Text>
          <Heading size="md" color="brand.burgundy" fontFamily="heading" mb={2}>
            No tournaments yet
          </Heading>
          <Text color="gray.500" mb={6}>
            Create your first Mahjong Maven tournament to get started.
          </Text>
          <Button onClick={() => navigate("/tournaments/new")}>
            Create Tournament
          </Button>
        </Box>
      )}

      {!loading && tournaments.length > 0 && (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {tournaments.map((t) => (
            <TournamentCard key={t.id} tournament={t} />
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
}
