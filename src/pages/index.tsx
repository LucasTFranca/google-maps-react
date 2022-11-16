import { Flex, Box, HStack, Input, ButtonGroup, Button, IconButton, Text } from "@chakra-ui/react"
import { useJsApiLoader, GoogleMap, Autocomplete, DirectionsRenderer } from "@react-google-maps/api"
import { useMemo, useState, useRef } from "react"

import { FaLocationArrow, FaTimes } from 'react-icons/fa'

export default function Home() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_API_KEY,
    libraries: ["places"],
  })

  const center = useMemo(() => ({ lat: 44, lng: -80 }), [])

  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null)
  const [distance, setDistance] = useState('')
  const [duration, setDuration] = useState('')

  const orginRef = useRef<HTMLInputElement | null>(null)

  const destinationRef = useRef<HTMLInputElement | null>(null)

  if (!isLoaded) return <div>Loading...</div>

  async function calculateRoute() {
    if (orginRef?.current?.value === '' || destinationRef?.current?.value === '') return

    const directionsService = new google.maps.DirectionsService()
    const results = await directionsService.route({
      origin: orginRef?.current?.value || '',
      destination: destinationRef?.current?.value || '',
      travelMode: google.maps.TravelMode.DRIVING,
    })

    setDirectionsResponse(results)
    setDistance(results.routes[0].legs[0].distance?.text || '')
    setDuration(results.routes[0].legs[0].duration?.text || '')
  }

  function clearRoute() {
    setDirectionsResponse(null)
    setDistance('')
    setDuration('')
    orginRef.current!.value = ''
    destinationRef.current!.value = ''
  }

  return (
    <Flex
      position='relative'
      flexDirection='column'
      alignItems='center'
      h='100vh'
      w='100vw'
    >
      <Box position='absolute' left={0} top={0} h='100%' w='100%'>
        <GoogleMap
          zoom={10}
          center={ center }
          mapContainerStyle={{ height: "100vh", width: "100%" }}
          options={{
            zoomControl: false,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          }}
          onLoad={map => setMap(map)}
        >
          {
            directionsResponse && (
              <DirectionsRenderer directions={directionsResponse} />
            )
          }
        </GoogleMap>
      </Box>
      <Box
        p={4}
        borderRadius='lg'
        m={4}
        bgColor='white'
        shadow='base'
        minW='container.md'
        zIndex='1'
      >
        <HStack spacing={2} justifyContent='space-between'>
          <Box flexGrow={1}>
            <Autocomplete>
              <Input type='text' placeholder='Origin' ref={orginRef} />
            </Autocomplete>
          </Box>
          <Box flexGrow={1}>
            <Autocomplete>
              <Input
                type='text'
                placeholder='Destination'
                ref={destinationRef}
              />
            </Autocomplete>
          </Box>

          <ButtonGroup>
            <Button colorScheme='pink' type='submit' onClick={calculateRoute}>
              Calculate Route
            </Button>
            <IconButton
              aria-label='center back'
              icon={<FaTimes />}
              onClick={clearRoute}
            />
          </ButtonGroup>
        </HStack>
        <HStack spacing={4} mt={4} justifyContent='space-between'>
          <Text>Distance: {distance}</Text>
          <Text>Duration: {duration}</Text>
          <IconButton
            aria-label='center back'
            icon={<FaLocationArrow />}
            isRound
            onClick={() => map?.panTo(center)}
          />
        </HStack>
      </Box>
    </Flex>
  )
}
