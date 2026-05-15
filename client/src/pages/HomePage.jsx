import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  SimpleGrid,
  VStack,
  HStack,
  Icon,
  Flex,
  Badge,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const TileIcon = () => (
  <Box
    w={10}
    h={10}
    bg="brand.burgundy"
    borderRadius="md"
    border="2px solid"
    borderColor="brand.gold"
    display="flex"
    alignItems="center"
    justifyContent="center"
    fontSize="xl"
  >
    🀄
  </Box>
);

function FeatureCard({ icon, title, description }) {
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
    >
      <VStack align="start" spacing={3}>
        <Text fontSize="2xl">{icon}</Text>
        <Heading size="sm" color="brand.burgundy" fontFamily="heading">
          {title}
        </Heading>
        <Text fontSize="sm" color="gray.600">
          {description}
        </Text>
      </VStack>
    </Box>
  );
}

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <Box>
      {/* Hero */}
      <Box
        bg="brand.burgundy"
        color="white"
        py={20}
        px={4}
        position="relative"
        overflow="hidden"
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          opacity={0.05}
          backgroundImage="repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)"
          backgroundSize="20px 20px"
        />
        <Container maxW="4xl" position="relative">
          <VStack spacing={6} textAlign="center">
            <Badge
              bg="brand.gold"
              color="brand.charcoal"
              px={4}
              py={1}
              borderRadius="full"
              fontSize="xs"
              fontWeight="bold"
              letterSpacing="widest"
            >
              AMERICAN MAHJONG TOURNAMENT MANAGER
            </Badge>
            <Heading
              size="3xl"
              fontFamily="heading"
              color="brand.buttercup"
              lineHeight="shorter"
            >
              Mahjong Maven
            </Heading>
            <Text fontSize="xl" color="brand.goldLight" maxW="lg">
              Elegant tournament management for your American mahjong group.
              Create tournaments, seat players, track scores, and crown your
              champion.
            </Text>
            <HStack spacing={4} pt={2}>
              <Button
                size="lg"
                bg="brand.buttercup"
                color="brand.charcoal"
                fontWeight="bold"
                _hover={{ bg: "brand.buttercupLight" }}
                onClick={() => navigate("/tournaments/new")}
                px={8}
              >
                Start a Tournament
              </Button>
              <Button
                size="lg"
                variant="outline"
                borderColor="brand.goldLight"
                color="brand.goldLight"
                _hover={{ bg: "brand.burgundyLight", borderColor: "white" }}
                onClick={() => navigate("/tournaments")}
              >
                View Tournaments
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* How It Works */}
      <Container maxW="6xl" py={16}>
        <VStack spacing={12}>
          <VStack spacing={3} textAlign="center">
            <Heading size="xl" color="brand.burgundy" fontFamily="heading">
              How Mahjong Maven Works
            </Heading>
            <Text color="gray.500" maxW="md">
              Run a polished American mahjong tournament in four simple steps.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} w="full">
            <FeatureCard
              icon="🏆"
              title="Create Tournament"
              description="Set your tournament name, date, number of rounds, and scoring rules. Takes 30 seconds."
            />
            <FeatureCard
              icon="👥"
              title="Add Players"
              description="Enter player names one by one or paste a list. The app handles byes automatically for odd counts."
            />
            <FeatureCard
              icon="🀄"
              title="Generate Tables"
              description="One click seats 4 players per table and rotates them each round so everyone plays with different partners."
            />
            <FeatureCard
              icon="📊"
              title="Track Scores"
              description="Enter scores after each round. The live leaderboard updates instantly and you can print final results."
            />
          </SimpleGrid>

          {/* American Mahjong note */}
          <Box
            bg="brand.burgundy"
            color="white"
            borderRadius="xl"
            p={8}
            w="full"
          >
            <Flex
              direction={{ base: "column", md: "row" }}
              align="center"
              gap={6}
            >
              <Text fontSize="4xl">🀄</Text>
              <VStack align="start" spacing={2} flex={1}>
                <Heading size="md" color="brand.buttercup" fontFamily="heading">
                  Built for American Mahjong
                </Heading>
                <Text fontSize="sm" color="brand.goldLight" lineHeight="tall">
                  American mahjong uses the National Mah Jongg League card and
                  plays 4 players per table. Rounds typically run 45–60 minutes.
                  Mahjong Maven is designed for community groups of 16–28
                  players with automatic table rotation and bye tracking.
                </Text>
              </VStack>
              <Button
                size="md"
                bg="brand.gold"
                color="brand.charcoal"
                fontWeight="bold"
                _hover={{ bg: "brand.goldLight" }}
                onClick={() => navigate("/tournaments/new")}
                flexShrink={0}
              >
                Get Started
              </Button>
            </Flex>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
