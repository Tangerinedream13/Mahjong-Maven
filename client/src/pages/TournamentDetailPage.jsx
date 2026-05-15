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
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
} from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
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
                inputMode="numeric"
                placeholder="Score"
                value={scores[p.id]}
                onChange={(e) =>
                  setScores((prev) => ({ ...prev, [p.id]: e.target.value }))
                }
                w="90px"
                border="1px solid"
                borderColor="brand.goldLight"
                borderRadius="md"
                px={3}
                py={2}
                fontSize="md"
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
  const [addingRound, setAddingRound] = useState(false);
  const [resetting, setResetting] = useState(false);
  const { isOpen: isResetOpen, onOpen: onResetOpen, onClose: onResetClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const cancelResetRef = useRef();
  const cancelDeleteRef = useRef();
  const [editFields, setEditFields] = useState({ name: "", date: "", location: "" });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const openEdit = () => {
    setEditFields({
      name: tournament?.name ?? "",
      date: tournament?.date?.slice(0, 10) ?? "",
      location: tournament?.location ?? "",
    });
    onEditOpen();
  };

  const saveTournament = async () => {
    setSaving(true);
    try {
      await api.patch(`/tournaments/${id}`, editFields);
      onEditClose();
      await load();
      toast({ title: "Tournament updated!", status: "success", duration: 2000 });
    } catch {
      toast({ title: "Could not save changes", status: "error" });
    } finally {
      setSaving(false);
    }
  };

  const deleteTournament = async () => {
    setDeleting(true);
    try {
      await api.delete(`/tournaments/${id}`);
      navigate("/tournaments");
    } catch {
      toast({ title: "Could not delete tournament", status: "error" });
      setDeleting(false);
    }
  };

  const addAnotherRound = async () => {
    setAddingRound(true);
    try {
      await api.patch(`/tournaments/${id}`, { rounds: (tournament.rounds ?? 0) + 1 });
      await api.post(`/tournaments/${id}/rounds/generate`);
      await load();
      toast({ title: "Another round added!", status: "success", duration: 2000 });
    } catch {
      toast({ title: "Could not add another round", status: "error" });
    } finally {
      setAddingRound(false);
    }
  };

  const resetTournament = async () => {
    setResetting(true);
    try {
      await api.delete(`/tournaments/${id}/reset`);
      onResetClose();
      await load();
      toast({ title: "Tournament reset to Round 1", status: "success", duration: 2000 });
    } catch {
      toast({ title: "Could not reset tournament", status: "error" });
    } finally {
      setResetting(false);
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
        <Flex direction={{ base: "column", md: "row" }} justify="space-between" align="start" gap={4}>
          <VStack align="start" spacing={1}>
            <Heading size={{ base: "lg", md: "xl" }} color="brand.burgundy" fontFamily="heading">
              {tournament?.name}
            </Heading>
            <VStack align="start" spacing={0} fontSize="sm" color="gray.500">
              <Text>
                {new Date(tournament?.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
              {tournament?.location && <Text>{tournament.location}</Text>}
            </VStack>
            <HStack spacing={2} mt={1} wrap="wrap">
              <Badge colorScheme="purple">{players.length} players</Badge>
              <Badge colorScheme="blue">
                Round {rounds.length} of {tournament?.rounds}
              </Badge>
              <Badge colorScheme="orange">{tournament?.round_minutes} min/round</Badge>
            </HStack>
          </VStack>
          <Flex wrap="wrap" gap={2} flexShrink={0}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/tournaments/${id}/players`)}
            >
              Manage Players
            </Button>
            <Button variant="outline" size="sm" onClick={openEdit}>
              Edit
            </Button>
            <Button variant="outline" size="sm" colorScheme="red" onClick={onDeleteOpen}>
              Delete
            </Button>
            {rounds.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                colorScheme="red"
                onClick={onResetOpen}
              >
                Start Over
              </Button>
            )}
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
            {!canGenerateRound && rounds.length > 0 && rounds.length >= (tournament?.rounds ?? 0) && players.length >= 4 && (
              <Button
                size="sm"
                bg="brand.buttercup"
                color="brand.charcoal"
                fontWeight="bold"
                _hover={{ bg: "brand.buttercupLight" }}
                isLoading={addingRound}
                loadingText="Adding round..."
                onClick={addAnotherRound}
              >
                + Play Another Round
              </Button>
            )}
          </Flex>
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

      {/* Edit modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color="brand.burgundy" fontFamily="heading">Edit Tournament</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel fontSize="sm">Name</FormLabel>
                <Input
                  value={editFields.name}
                  onChange={(e) => setEditFields((f) => ({ ...f, name: e.target.value }))}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Date</FormLabel>
                <Input
                  type="date"
                  value={editFields.date}
                  onChange={(e) => setEditFields((f) => ({ ...f, date: e.target.value }))}
                />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm">Location</FormLabel>
                <Input
                  value={editFields.location}
                  onChange={(e) => setEditFields((f) => ({ ...f, location: e.target.value }))}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onEditClose}>Cancel</Button>
            <Button isLoading={saving} onClick={saveTournament}>Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete confirmation */}
      <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelDeleteRef} onClose={onDeleteClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold" color="brand.burgundy" fontFamily="heading">
              Delete Tournament?
            </AlertDialogHeader>
            <AlertDialogBody>
              This will permanently delete <strong>{tournament?.name}</strong> and all its players, rounds, and scores. This cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelDeleteRef} onClick={onDeleteClose}>Cancel</Button>
              <Button colorScheme="red" onClick={deleteTournament} isLoading={deleting} ml={3}>
                Yes, Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <AlertDialog isOpen={isResetOpen} leastDestructiveRef={cancelResetRef} onClose={onResetClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold" color="brand.burgundy" fontFamily="heading">
              Start Over?
            </AlertDialogHeader>
            <AlertDialogBody>
              This will delete all rounds and scores for this tournament. Players will stay. You'll be back at Round 1.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelResetRef} onClick={onResetClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={resetTournament} isLoading={resetting} ml={3}>
                Yes, Start Over
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
}
