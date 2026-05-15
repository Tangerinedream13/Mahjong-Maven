import {
  Box,
  Flex,
  Heading,
  Text,
  HStack,
  Button,
  Container,
} from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <Box bg="brand.burgundy" color="white" py={3} px={0} boxShadow="md">
      <Container maxW="7xl">
        <Flex align="center" justify="space-between">
          <Link to="/" style={{ textDecoration: "none" }}>
            <Flex align="baseline" gap={2}>
              <Heading size="lg" color="brand.buttercup" fontFamily="heading">
                Mahjong Maven
              </Heading>
              <Text fontSize="xs" color="brand.goldLight" letterSpacing="wider">
                TOURNAMENT MANAGER
              </Text>
            </Flex>
          </Link>

          <HStack spacing={3}>
            <Button
              as={Link}
              to="/tournaments"
              variant="ghost"
              color="white"
              size="sm"
              _hover={{ bg: "brand.burgundyDark" }}
            >
              Tournaments
            </Button>
            <Button
              as={Link}
              to="/leaderboard"
              variant="ghost"
              color="brand.goldLight"
              size="sm"
              _hover={{ bg: "brand.burgundyDark" }}
            >
              Leaderboard
            </Button>
            <Button
              size="sm"
              bg="brand.gold"
              color="brand.charcoal"
              fontWeight="bold"
              _hover={{ bg: "brand.goldLight" }}
              onClick={() => navigate("/tournaments/new")}
            >
              + New Tournament
            </Button>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
}
