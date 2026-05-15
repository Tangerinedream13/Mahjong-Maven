import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Divider,
  HStack,
  useToast,
  Flex,
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

export default function NewTournamentPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState({
    name: "",
    date: new Date().toISOString().slice(0, 10),
    rounds: 4,
    round_minutes: 45,
    location: "",
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast({
        title: "Tournament name is required.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setSaving(true);
    try {
      const res = await api.post("/tournaments", {
        ...form,
        rounds: Number(form.rounds),
        round_minutes: Number(form.round_minutes),
      });
      toast({
        title: "Tournament created!",
        description: `${form.name} is ready. Now add your players.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      navigate(`/tournaments/${res.data.id}/players`);
    } catch (err) {
      toast({
        title: "Could not save tournament.",
        description: "Make sure the server is running.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container maxW="2xl" py={10}>
      <VStack spacing={8} align="stretch">
        <VStack align="start" spacing={1}>
          <Heading size="xl" color="brand.burgundy" fontFamily="heading">
            New Tournament
          </Heading>
          <Text color="gray.500">
            Set up your American mahjong tournament details.
          </Text>
        </VStack>

        <Box
          bg="white"
          border="1px solid"
          borderColor="brand.goldLight"
          borderRadius="xl"
          p={8}
          boxShadow="sm"
        >
          <VStack spacing={6} align="stretch">
            <FormControl isRequired>
              <FormLabel color="brand.burgundy" fontWeight="semibold">
                Tournament Name
              </FormLabel>
              <Input
                placeholder="e.g. PEO Spring Mahjong 2025"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                focusBorderColor="brand.burgundy"
                size="lg"
              />
            </FormControl>

            <FormControl>
              <FormLabel color="brand.burgundy" fontWeight="semibold">
                Location
              </FormLabel>
              <Input
                placeholder="e.g. Community Center, Room 4"
                value={form.location}
                onChange={(e) => handleChange("location", e.target.value)}
                focusBorderColor="brand.burgundy"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel color="brand.burgundy" fontWeight="semibold">
                Tournament Date
              </FormLabel>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => handleChange("date", e.target.value)}
                focusBorderColor="brand.burgundy"
              />
            </FormControl>

            <Divider borderColor="brand.goldLight" />

            <HStack spacing={6} align="start">
              <FormControl>
                <FormLabel color="brand.burgundy" fontWeight="semibold">
                  Number of Rounds
                </FormLabel>
                <NumberInput
                  min={1}
                  max={12}
                  value={form.rounds}
                  onChange={(val) => handleChange("rounds", val)}
                  focusBorderColor="brand.burgundy"
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormHelperText>Most groups play 4–6 rounds</FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel color="brand.burgundy" fontWeight="semibold">
                  Minutes per Round
                </FormLabel>
                <NumberInput
                  min={15}
                  max={120}
                  step={5}
                  value={form.round_minutes}
                  onChange={(val) => handleChange("round_minutes", val)}
                  focusBorderColor="brand.burgundy"
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormHelperText>American mahjong: ~45 min</FormHelperText>
              </FormControl>
            </HStack>
          </VStack>
        </Box>

        <Flex justify="space-between">
          <Button
            variant="outline"
            onClick={() => navigate("/tournaments")}
            isDisabled={saving}
          >
            Cancel
          </Button>
          <Button
            size="lg"
            isLoading={saving}
            loadingText="Creating..."
            onClick={handleSubmit}
            px={10}
          >
            Create Tournament →
          </Button>
        </Flex>
      </VStack>
    </Container>
  );
}
