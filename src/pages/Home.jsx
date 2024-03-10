import React, {useEffect, useRef, useState} from "react";
import {Autocomplete, DirectionsRenderer, GoogleMap, InfoWindow, MarkerF, useJsApiLoader} from "@react-google-maps/api";
import useSVGPin from "../hooks/useSVGPin.jsx";
import {useGeolocation} from "@uidotdev/usehooks";
import {useQuery} from "@tanstack/react-query";
import useRouteFinder from "../hooks/useRouteFinder.jsx";

const libraries = ["places"];

export default function Home({}) {
    const {isLoaded} = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_API_KEY,
        libraries
    })

    const userLocation = useGeolocation()
    const {pin} = useSVGPin()
    const [map, setMap] = useState(null);
    const [directionsResponse, setDirectionsResponse] = useState(null);
    const destinationRef = useRef();
    const [center, setCenter] = useState({lat: 0, lng: 0});
    const [autocomplete, setAutocomplete] = useState();

    const [targetLocation, setTargetLocation] = useState({lat: 0, lng: 0})

    const [scoredParkingSpotsS, setScoredParkingSpotsS] = useState([])

    // access the target state and calculateBestTarget function from useRouteFinder

    const {target, calculateBestTarget} = useRouteFinder()

    useEffect(() => {
        if (userLocation.latitude && userLocation.longitude && center.lat === 0 && center.lng === 0) {
            setCenter({lat: userLocation.latitude, lng: userLocation.longitude})
        }
    }, [userLocation]);

    const onDragEnd = () => {
        setCenter({lat: map.getCenter().lat(), lng: map.getCenter().lng()})
    }

    const onLoad = (autocompleteInstance) => {
        setAutocomplete(autocompleteInstance);
    };

    const onPlaceChanged = () => {
        if (autocomplete !== null) {
            const place = autocomplete.getPlace();
            const latitude = place.geometry.location.lat();
            const longitude = place.geometry.location.lng();
            map.setCenter({lat: latitude, lng: longitude})
            setTargetLocation({lat: latitude, lng: longitude})
        } else {
            console.log('Autocomplete is not loaded yet!');
        }
    };

    const parkingSpotsQuery = useQuery({
        queryKey: ["parkingSpots"],
        queryFn: async () => {
            const response = await fetch(import.meta.env.VITE_API_URL + "spot/fetch")
            return await response.json()
        },
        refetchIntervalInBackground: true,
        refetchInterval: 1000
    });


    const calculateRoute = () => {
        if (destinationRef.current.value === '') {
            return;
        }

        const parkingSpots = parkingSpotsQuery.data;

        calculateBestTarget(parkingSpots,
            {lat: userLocation.latitude, lng: userLocation.longitude},
            targetLocation,
        )
    };

    useEffect(() => {

        if (target) {

            const directionsService = new google.maps.DirectionsService()

            directionsService.route({
                    origin: {lat: userLocation.latitude, lng: userLocation.longitude},
                    destination: {lat: target.lat, lng: target.lng},
                    travelMode: google.maps.TravelMode.DRIVING
                }, (result, status) => {
                    if (status === google.maps.DirectionsStatus.OK) {
                        console.log("Result before", result)
                        result.routes = result.routes.slice(0, 1)
                        result.geocoded_waypoints = result.geocoded_waypoints.slice(0, 1)

                        console.log("Result after", result)
                        setDirectionsResponse(result)
                    } else {
                        console.error(`error fetching directions ${result}`)
                    }
                }
            )
        }
    }, [target]);

    const [activeMarker, setActiveMarker] = useState(null);
    const [selectedSpot, setSelectedSpot] = useState(null);

    const onMarkerClick = (spot) => {
        setSelectedSpot(spot);
    };

    const onInfoWindowClose = () => {
        setSelectedSpot(null);
    };

    if (!isLoaded) {
        return (
            <div>
                Loading...
            </div>
        )
    }

    if (userLocation.loading) {
        return (
            <div>
                Loading Location...
            </div>
        )
    }

    return (
        <>
            <div className="flex relative flex-col items-center h-[100dvh] w-[100dvw]">
                <div className="absolute left-0 top-0 h-full w-full">
                    <GoogleMap
                        center={center}
                        zoom={18}
                        options={{
                            zoomControl: false,
                            streetViewControl: false,
                            fullscreenControl: false,
                            mapTypeControl: false
                        }}
                        mapContainerStyle={{height: "100dvh", width: "100dvw", position: "absolute", left: 0, top: 0}}
                        onLoad={(lMap) => setMap(lMap)}
                        onDragEnd={onDragEnd}>
                        {parkingSpotsQuery.isSuccess && parkingSpotsQuery.data && parkingSpotsQuery.data.map((spot, index) => {
                            return (
                                <MarkerF
                                    key={spot.key}
                                    position={{lat: spot.lat, lng: spot.lng}}
                                    onClick={() => onMarkerClick(spot)}
                                    icon={{
                                        url: pin(spot.freeSpot, spot.status),
                                        scaledSize: new window.google.maps.Size(30, 30)
                                    }}
                                />
                            )
                        })}
                        {selectedSpot && (
                            <InfoWindow
                                position={{lat: selectedSpot.lat, lng: selectedSpot.lng}}
                                onCloseClick={onInfoWindowClose}
                            >
                                <div>
                                    <h4>{selectedSpot.uuid}</h4>
                                </div>
                            </InfoWindow>
                        )}
                        {directionsResponse && (
                            <DirectionsRenderer directions={directionsResponse}/>
                        )}
                    </GoogleMap>
                </div>
                <div className={"p-4 rounded-xl m-4 bg-gray-700 z-10"}>
                    <div className={"text-2xl w-auto text-gray-400 text-center"}>
                        <label htmlFor={"destination"} className={""}>Destination</label>
                        <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
                            <input type="text" className={"text-black w-80 rounded-xl"} id={"destination"} placeholder={"Destination"} ref={destinationRef}/>
                        </Autocomplete>
                        <input type="submit" onClick={calculateRoute}/>
                    </div>
                </div>
            </div>
        </>
    )
}
