import {
  Box,
  Flex,
  Heading,
  Text,
  HStack,
  Button,
  Container,
  IconButton,
  VStack,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerBody,
  useDisclosure,
} from "@chakra-ui/react";
import { Link, useNavigate } from "react-router-dom";

function HamburgerIcon() {
  return (
    <Box>
      <Box w="20px" h="2px" bg="white" mb="4px" />
      <Box w="20px" h="2px" bg="white" mb="4px" />
      <Box w="20px" h="2px" bg="white" />
    </Box>
  );
}

export default function Navbar() {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const navLinks = [
    { label: "Tournaments", to: "/tournaments" },
    { label: "Leaderboard", to: "/leaderboard" },
  ];

  return (
    <Box bg="brand.burgundy" color="white" py={3} px={0} boxShadow="md">
      <Container maxW="7xl">
        <Flex align="center" justify="space-between">
          <Link to="/" style={{ textDecoration: "none" }}>
            <Flex align="baseline" gap={2}>
              <Heading size="lg" color="brand.buttercup" fontFamily="heading">
                Mahjong Maven
              </Heading>
              <Text fontSize="xs" color="brand.goldLight" letterSpacing="wider"
                display={{ base: "none", sm: "block" }}>
                TOURNAMENT MANAGER
              </Text>
            </Flex>
          </Link>

          {/* Desktop nav */}
          <HStack spacing={3} display={{ base: "none", md: "flex" }}>
            {navLinks.map((l) => (
              <Button
                key={l.to}
                as={Link}
                to={l.to}
                variant="ghost"
                color="white"
                size="sm"
                _hover={{ bg: "brand.burgundyDark" }}
              >
                {l.label}
              </Button>
            ))}
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

          {/* Mobile hamburger */}
          <IconButton
            display={{ base: "flex", md: "none" }}
            aria-label="Menu"
            icon={<HamburgerIcon />}
            variant="ghost"
            color="white"
            _hover={{ bg: "brand.burgundyDark" }}
            onClick={onOpen}
          />
        </Flex>
      </Container>

      {/* Mobile drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg="brand.burgundy" color="white">
          <DrawerCloseButton color="white" />
          <DrawerBody pt={12}>
            <VStack spacing={4} align="stretch">
              {navLinks.map((l) => (
                <Button
                  key={l.to}
                  as={Link}
                  to={l.to}
                  variant="ghost"
                  color="white"
                  size="lg"
                  justifyContent="flex-start"
                  _hover={{ bg: "brand.burgundyDark" }}
                  onClick={onClose}
                >
                  {l.label}
                </Button>
              ))}
              <Button
                size="lg"
                bg="brand.gold"
                color="brand.charcoal"
                fontWeight="bold"
                _hover={{ bg: "brand.goldLight" }}
                onClick={() => { navigate("/tournaments/new"); onClose(); }}
              >
                + New Tournament
              </Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}
