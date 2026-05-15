import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Input,
  Textarea,
  Flex,
  Tag,
  TagLabel,
  TagCloseButton,
  Divider,
  Alert,
  AlertIcon,
  useToast,
  Spinner,
  Badge,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/client";

export default function AddPlayersPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [tournament, setTournament] = useState(null);
  const [players, setPlayers] = useState([]);
  const [newName, setNewName] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [showBulk, setShowBulk] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/tournaments/${id}`),
      api.get(`/tournaments/${id}/players`),
    ])
      .then(([tRes, pRes]) => {
        setTournament(tRes.data);
        setPlayers(pRes.data || []);
      })
      .catch(() =>
        toast({ title: "Could not load tournament", status: "error" })
      )
      .finally(() => setLoading(false));
  }, [id]);

  const addOne = async () => {
    const name = newName.trim();
    if (!name) return;
    try {
      const res = await api.post(`/tournaments/${id}/players`, { name });
      setPlayers((prev) => [...prev, res.data]);
      setNewName("");
    } catch {
      toast({ title: "Could not add player", status: "error" });
    }
  };

  const addBulk = async () => {
    const names = bulkText
      .split("\n")
      .map((n) => n.trim())
      .filter(Boolean);
    if (!names.length) return;
    try {
      const res = await api.post(`/tournaments/${id}/players/bulk`, { names });
      setPlayers((prev) => [...prev, ...res.data]);
      setBulkText("");
      setShowBulk(false);
      toast({
        title: `Added ${res.data.length} players`,
        status: "success",
        duration: 2000,
      });
    } catch {
      toast({ title: "Could not add players", status: "error" });
    }
  };

  const removePlayer = async (playerId) => {
    try {
      await api.delete(`/tournaments/${id}/players/${playerId}`);
      setPlayers((prev) => prev.filter((p) => p.id !== playerId));
    } catch {
      toast({ title: "Could not remove player", status: "error" });
    }
  };

  const tableCount = Math.floor(players.length / 4);
  const remainder = players.length % 4;

  if (loading)
    return (
      <Flex justify="center" pt={20}>
        <Spinner size="xl" color="brand.burgundy" />
      </Flex>
    );

  return (
    <Container maxW="2xl" py={10}>
      <VStack spacing={8} align="stretch">
        <VStack align="start" spacing={1}>
          <Text color="brand.gold" fontWeight="bold" fontSize="sm" letterSpacing="wider">
            {tournament?.name}
          </Text>
          <Heading size="xl" color="brand.burgundy" fontFamily="heading">
            Add Players
          </Heading>
          <Text color="gray.500">
            American mahjong seats 4 players per table.
          </Text>
        </VStack>

        {players.length > 0 && (
          <Box
            bg="brand.burgundy"
            color="white"
            borderRadius="lg"
            p={4}
            fontSize="sm"
          >
            <HStack justify="space-between">
              <Text>
                <strong>{players.length}</strong> players →{" "}
                <strong>{tableCount}</strong> full table
                {tableCount !== 1 ? "s" : ""}
              </Text>
              {remainder > 0 ? (
                <Badge bg="brand.gold" color="brand.charcoal">
                  {4 - remainder} more for a full table
                </Badge>
              ) : players.length >= 4 ? (
                <Badge colorScheme="green">Perfect seating!</Badge>
              ) : null}
            </HStack>
          </Box>
        )}

        <Box
          bg="white"
          border="1px solid"
          borderColor="brand.goldLight"
          borderRadius="xl"
          p={6}
          boxShadow="sm"
        >
          <VStack spacing={4} align="stretch">
            <Heading size="sm" color="brand.burgundy" fontFamily="heading">
              Add a Player
            </Heading>
            <HStack>
              <Input
                placeholder="Player name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addOne()}
                focusBorderColor="brand.burgundy"
              />
              <Button onClick={addOne} flexShrink={0}>
                Add
              </Button>
            </HStack>

            <Button
              variant="ghost"
              size="sm"
              color="brand.burgundy"
              onClick={() => setShowBulk(!showBulk)}
            >
              {showBulk ? "↑ Hide" : "↓ Paste a list of names"}
            </Button>

            {showBulk && (
              <VStack align="stretch" spacing={2}>
                <Textarea
                  placeholder={"One name per line:\nSusan\nMargaret\nDorothy"}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  rows={6}
                  focusBorderColor="brand.burgundy"
                />
                <Button onClick={addBulk} size="sm">
                  Add All Names
                </Button>
              </VStack>
            )}
          </VStack>
        </Box>

        {players.length > 0 && (
          <Box
            bg="white"
            border="1px solid"
            borderColor="brand.goldLight"
            borderRadius="xl"
            p={6}
            boxShadow="sm"
          >
            <VStack align="stretch" spacing={3}>
              <Heading size="sm" color="brand.burgundy" fontFamily="heading">
                Player Roster ({players.length})
              </Heading>
              <Flex wrap="wrap" gap={2}>
                {players.map((p) => (
                  <Tag
                    key={p.id}
                    size="lg"
                    bg="brand.cream"
                    border="1px solid"
                    borderColor="brand.goldLight"
                    borderRadius="full"
                  >
                    <TagLabel color="brand.burgundy">{p.name}</TagLabel>
                    <TagCloseButton
                      onClick={() => removePlayer(p.id)}
                      color="brand.burgundy"
                    />
                  </Tag>
                ))}
              </Flex>
            </VStack>
          </Box>
        )}

        {players.length < 4 && players.length > 0 && (
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            You need at least 4 players to generate tables.
          </Alert>
        )}

        <Flex justify="space-between">
          <Button
            variant="outline"
            onClick={() => navigate(`/tournaments/${id}`)}
          >
            ← Back
          </Button>
          <Button
            isDisabled={players.length < 4}
            size="lg"
            px={10}
            onClick={() => navigate(`/tournaments/${id}`)}
          >
            Done — View Tournament →
          </Button>
        </Flex>
      </VStack>
    </Container>
  );
}
