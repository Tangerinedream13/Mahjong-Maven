import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  SimpleGrid,
  Badge,
  Flex,
  Divider,
  Spinner,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/client";

function TableCard({ tableData, roundId, onScoreSaved }) {
  const toast = useToast();
  const [scores, setScores] = useState(
    Object.fromEntries(tableData.players.map((p) => [p.id, p.score ?? ""]))
  );
  const [saving, setSaving] = useState(false);

  const saveScores = async () => {
    setSaving(true);
    try {
      await api.post(`/rounds/${roundId}/scores`, {
        table_id: tableData.id,
        scores: Object.entries(scores).map(([player_id, score]) => ({
          player_id: Number(player_id),
          score: Number(score) || 0,
        })),
      });
      toast({ title: "Scores saved!", status: "success", duration: 2000 });
      onScoreSaved?.();
    } catch {
      toast({ title: "Could not save scores", status: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box
      bg="white"
      border="1px solid"
      borderColor="brand.goldLight"
      borderRadius="xl"
      p={5}
      boxShadow="sm"
    >
      <VStack align="stretch" spacing={3}>
        <Flex justify="space-between" align="center">
          <Heading size="sm" color="brand.burgundy" fontFamily="heading">
            Table {tableData.number}
          </Heading>
          <Badge bg="brand.gold" color="brand.charcoal" borderRadius="full" px={2}>
            {tableData.players.length} players
          </Badge>
        </Flex>
        <VStack align="stretch" spacing={2}>
          {tableData.players.map((p) => (
            <Flex key={p.id} align="center" justify="space-between" gap={3}>
              <Text fontSize="sm" flex={1} color="brand.charcoal">
                {p.name}
              </Text>
              <Box
                as="input"
                type="number"
                placeholder="Score"
                value={scores[p.id]}
                onChange={(e) =>
                  setScores((prev) => ({ ...prev, [p.id]: e.target.value }))
                }
                w="80px"
                border="1px solid"
                borderColor="brand.goldLight"
                borderRadius="md"
                px={2}
                py={1}
                fontSize="sm"
                textAlign="right"
                _focus={{ outline: "2px solid", outlineColor: "brand.burgundy" }}
              />
            </Flex>
          ))}
        </VStack>
        <Button size="sm" onClick={saveScores} isLoading={saving}>
          Save Scores
        </Button>
      </VStack>
    </Box>
  );
}

export default function TournamentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [tournament, setTournament] = useState(null);
  const [players, setPlayers] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingRound, setGeneratingRound] = useState(false);

  const load = () => {
    Promise.all([
      api.get(`/tournaments/${id}`),
      api.get(`/tournaments/${id}/players`),
      api.get(`/tournaments/${id}/rounds`),
      api.get(`/tournaments/${id}/standings`),
    ])
      .then(([tRes, pRes, rRes, sRes]) => {
        setTournament(tRes.data);
        setPlayers(pRes.data || []);
        setRounds(rRes.data || []);
        setStandings(sRes.data || []);
      })
      .catch(() => toast({ title: "Could not load tournament", status: "error" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const generateRound = async () => {
    setGeneratingRound(true);
    try {
      await api.post(`/tournaments/${id}/rounds/generate`);
      await load();
      toast({ title: "Round generated!", status: "success", duration: 2000 });
    } catch {
      toast({ title: "Could not generate round", status: "error" });
    } finally {
      setGeneratingRound(false);
    }
  };

  if (loading)
    return (
      <Flex justify="center" pt={20}>
        <Spinner size="xl" color="brand.burgundy" />
      </Flex>
    );

  const canGenerateRound = players.length >= 4 && rounds.length < (tournament?.rounds ?? 0);

  return (
    <Container maxW="6xl" py={10}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="start" wrap="wrap" gap={4}>
          <VStack align="start" spacing={1}>
            <Heading size="xl" color="brand.burgundy" fontFamily="heading">
              {tournament?.name}
            </Heading>
            <HStack spacing={3} fontSize="sm" color="gray.500">
              <Text>
                {new Date(tournament?.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
              {tournament?.location && <Text>· {tournament.location}</Text>}
            </HStack>
            <HStack spacing={3} mt={1}>
              <Badge colorScheme="purple">{players.length} players</Badge>
              <Badge colorScheme="blue">
                Round {rounds.length} of {tournament?.rounds}
              </Badge>
              <Badge colorScheme="orange">{tournament?.round_minutes} min/round</Badge>
            </HStack>
          </VStack>
          <HStack>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/tournaments/${id}/players`)}
            >
              Manage Players
            </Button>
            {canGenerateRound && (
              <Button
                size="sm"
                bg="brand.buttercup"
                color="brand.charcoal"
                fontWeight="bold"
                _hover={{ bg: "brand.buttercupLight" }}
                isLoading={generatingRound}
                loadingText="Seating tables..."
                onClick={generateRound}
              >
                Generate Round {rounds.length + 1}
              </Button>
            )}
          </HStack>
        </Flex>

        {/* Standings */}
        {standings.length > 0 && (
          <Box
            bg="white"
            border="1px solid"
            borderColor="brand.goldLight"
            borderRadius="xl"
            p={6}
            boxShadow="sm"
          >
            <Heading size="md" color="brand.burgundy" fontFamily="heading" mb={4}>
              Standings
            </Heading>
            <TableContainer>
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th color="brand.burgundy" w="10">Rank</Th>
                    <Th color="brand.burgundy">Player</Th>
                    <Th color="brand.burgundy" isNumeric>Total Score</Th>
                    <Th color="brand.burgundy" isNumeric>Rounds Played</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {standings.map((s, i) => (
                    <Tr
                      key={s.player_id}
                      bg={i === 0 ? "brand.buttercup" : i < 3 ? "brand.cream" : undefined}
                    >
                      <Td fontWeight={i < 3 ? "bold" : "normal"}>
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                      </Td>
                      <Td fontWeight={i < 3 ? "semibold" : "normal"}>{s.name}</Td>
                      <Td isNumeric fontWeight="bold">{s.total_score}</Td>
                      <Td isNumeric>{s.rounds_played}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* Rounds */}
        {rounds.length > 0 && (
          <VStack align="stretch" spacing={4}>
            <Heading size="md" color="brand.burgundy" fontFamily="heading">
              Rounds
            </Heading>
            <Accordion allowMultiple defaultIndex={[rounds.length - 1]}>
              {rounds.map((round) => (
                <AccordionItem
                  key={round.id}
                  border="1px solid"
                  borderColor="brand.goldLight"
                  borderRadius="xl"
                  mb={3}
                  overflow="hidden"
                >
                  <AccordionButton
                    bg="brand.burgundy"
                    color="white"
                    _hover={{ bg: "brand.burgundyDark" }}
                    px={6}
                    py={4}
                  >
                    <Flex flex={1} align="center" justify="space-between">
                      <Heading size="sm" fontFamily="heading">
                        Round {round.number}
                      </Heading>
                      <Badge
                        bg={round.completed ? "brand.gold" : "whiteAlpha.300"}
                        color={round.completed ? "brand.charcoal" : "white"}
                      >
                        {round.completed ? "Scores entered" : "In progress"}
                      </Badge>
                    </Flex>
                    <AccordionIcon ml={4} />
                  </AccordionButton>
                  <AccordionPanel bg="brand.cream" p={6}>
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                      {(round.tables || []).map((t) => (
                        <TableCard
                          key={t.id}
                          tableData={t}
                          roundId={round.id}
                          onScoreSaved={load}
                        />
                      ))}
                    </SimpleGrid>
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </VStack>
        )}

        {rounds.length === 0 && players.length >= 4 && (
          <Box
            textAlign="center"
            py={16}
            border="2px dashed"
            borderColor="brand.goldLight"
            borderRadius="xl"
          >
            <Text fontSize="3xl" mb={4}>🀄</Text>
            <Heading size="md" color="brand.burgundy" fontFamily="heading" mb={2}>
              Ready to play!
            </Heading>
            <Text color="gray.500" mb={6}>
              {players.length} players are registered. Generate Round 1 to seat the tables.
            </Text>
            <Button
              size="lg"
              bg="brand.buttercup"
              color="brand.charcoal"
              fontWeight="bold"
              _hover={{ bg: "brand.buttercupLight" }}
              isLoading={generatingRound}
              onClick={generateRound}
            >
              Generate Round 1
            </Button>
          </Box>
        )}

        {players.length < 4 && (
          <Box
            textAlign="center"
            py={16}
            border="2px dashed"
            borderColor="brand.goldLight"
            borderRadius="xl"
          >
            <Text fontSize="3xl" mb={4}>👥</Text>
            <Heading size="md" color="brand.burgundy" fontFamily="heading" mb={2}>
              Add players first
            </Heading>
            <Text color="gray.500" mb={6}>
              You need at least 4 players to start. You have {players.length} so far.
            </Text>
            <Button onClick={() => navigate(`/tournaments/${id}/players`)}>
              Add Players →
            </Button>
          </Box>
        )}
      </VStack>
    </Container>
  );
}
