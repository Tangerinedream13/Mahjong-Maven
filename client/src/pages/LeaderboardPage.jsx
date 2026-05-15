import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Flex,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Select,
  Badge,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import api from "../api/client";

const MEDAL = ["🥇", "🥈", "🥉"];

export default function LeaderboardPage() {
  const [allTime, setAllTime] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [selectedTid, setSelectedTid] = useState("");
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [standingsLoading, setStandingsLoading] = useState(false);

  useEffect(() => {
    Promise.all([api.get("/leaderboard"), api.get("/tournaments")])
      .then(([lRes, tRes]) => {
        setAllTime(lRes.data || []);
        setTournaments(tRes.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedTid) { setStandings([]); return; }
    setStandingsLoading(true);
    api.get(`/tournaments/${selectedTid}/standings`)
      .then((res) => setStandings(res.data || []))
      .finally(() => setStandingsLoading(false));
  }, [selectedTid]);

  if (loading)
    return (
      <Flex justify="center" pt={20}>
        <Spinner size="xl" color="brand.burgundy" />
      </Flex>
    );

  return (
    <Container maxW="4xl" py={10}>
      <VStack spacing={10} align="stretch">

        {/* All-time */}
        <Box>
          <VStack align="start" spacing={1} mb={6}>
            <Heading size="xl" color="brand.burgundy" fontFamily="heading">
              Leaderboard
            </Heading>
            <Text color="gray.500">All-time rankings across every tournament</Text>
          </VStack>

          <Box
            bg="white"
            border="1px solid"
            borderColor="brand.goldLight"
            borderRadius="xl"
            boxShadow="sm"
            overflow="hidden"
          >
            <TableContainer>
              <Table>
                <Thead bg="brand.burgundy">
                  <Tr>
                    <Th color="white" w="12">Rank</Th>
                    <Th color="white">Player</Th>
                    <Th color="white" isNumeric>Total Score</Th>
                    <Th color="white" isNumeric>Tournaments</Th>
                    <Th color="white" isNumeric>Rounds</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {allTime.map((p, i) => (
                    <Tr
                      key={p.name}
                      bg={i === 0 ? "brand.buttercup" : i < 3 ? "brand.cream" : undefined}
                      _hover={{ bg: i === 0 ? "brand.buttercup" : "gray.50" }}
                    >
                      <Td fontWeight={i < 3 ? "bold" : "normal"} fontSize="lg">
                        {i < 3 ? MEDAL[i] : i + 1}
                      </Td>
                      <Td fontWeight={i < 3 ? "semibold" : "normal"}>{p.name}</Td>
                      <Td isNumeric fontWeight="bold">
                        <Text color={p.total_score >= 0 ? "green.600" : "red.500"}>
                          {p.total_score > 0 ? "+" : ""}{p.total_score}
                        </Text>
                      </Td>
                      <Td isNumeric>{p.tournaments_played}</Td>
                      <Td isNumeric>{p.rounds_played}</Td>
                    </Tr>
                  ))}
                  {allTime.length === 0 && (
                    <Tr>
                      <Td colSpan={5} textAlign="center" py={10} color="gray.400">
                        No scores recorded yet
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
        </Box>

        {/* Per-tournament */}
        <Box>
          <HStack justify="space-between" align="center" mb={4}>
            <Heading size="md" color="brand.burgundy" fontFamily="heading">
              By Tournament
            </Heading>
            <Select
              placeholder="Choose a tournament…"
              value={selectedTid}
              onChange={(e) => setSelectedTid(e.target.value)}
              maxW="280px"
              size="sm"
              borderColor="brand.goldLight"
              _focus={{ borderColor: "brand.burgundy" }}
            >
              {tournaments.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </Select>
          </HStack>

          {selectedTid && (
            <Box
              bg="white"
              border="1px solid"
              borderColor="brand.goldLight"
              borderRadius="xl"
              boxShadow="sm"
              overflow="hidden"
            >
              {standingsLoading ? (
                <Flex justify="center" py={10}>
                  <Spinner color="brand.burgundy" />
                </Flex>
              ) : (
                <TableContainer>
                  <Table>
                    <Thead bg="brand.burgundy">
                      <Tr>
                        <Th color="white" w="12">Rank</Th>
                        <Th color="white">Player</Th>
                        <Th color="white" isNumeric>Score</Th>
                        <Th color="white" isNumeric>Rounds</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {standings.map((s, i) => (
                        <Tr
                          key={s.player_id}
                          bg={i === 0 ? "brand.buttercup" : i < 3 ? "brand.cream" : undefined}
                          _hover={{ bg: i === 0 ? "brand.buttercup" : "gray.50" }}
                        >
                          <Td fontWeight={i < 3 ? "bold" : "normal"} fontSize="lg">
                            {i < 3 ? MEDAL[i] : i + 1}
                          </Td>
                          <Td fontWeight={i < 3 ? "semibold" : "normal"}>{s.name}</Td>
                          <Td isNumeric fontWeight="bold">
                            <Text color={s.total_score >= 0 ? "green.600" : "red.500"}>
                              {s.total_score > 0 ? "+" : ""}{s.total_score}
                            </Text>
                          </Td>
                          <Td isNumeric>{s.rounds_played}</Td>
                        </Tr>
                      ))}
                      {standings.length === 0 && (
                        <Tr>
                          <Td colSpan={4} textAlign="center" py={10} color="gray.400">
                            No scores recorded for this tournament yet
                          </Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          )}

          {!selectedTid && (
            <Box
              textAlign="center"
              py={10}
              border="2px dashed"
              borderColor="brand.goldLight"
              borderRadius="xl"
              color="gray.400"
            >
              Select a tournament above to see its standings
            </Box>
          )}
        </Box>

      </VStack>
    </Container>
  );
}
