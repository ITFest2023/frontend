import {GoogleMap, MarkerF, useJsApiLoader, Autocomplete, DirectionsRenderer} from "@react-google-maps/api";
import useSVGPin from "../hooks/useSVGPin.jsx";
import {useRef, useState} from "react";
import {useGeolocation} from "@uidotdev/usehooks";
import {useQuery} from "@tanstack/react-query";

const libraries = ["places"]

export default function Home({}) {
    const {isLoaded} = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_API_KEY,
        libraries
    })

    const {pin} = useSVGPin()
    const [map, setMap] = useState(/** @type google.maps.Map  */(null))
    const [directionsResponse, setDirectionsResponse] = useState(null)
    /** @type React.MutableRefObject<HTMLInputElement> */
    const destinationRef = useRef();

    const [autocomplete, setAutocomplete] = useState()

    const onLoad = (autocompleteInstance) => {
        setAutocomplete(autocompleteInstance);
    };

    const onPlaceChanged = () => {
        if (autocomplete !== null) {
            const place = autocomplete.getPlace();
            const latitude = place.geometry.location.lat();
            const longitude = place.geometry.location.lng();
            console.log('Latitude:', latitude, 'Longitude:', longitude);
            // Here you can handle the lat and long values, e.g., setting them to state, sending to an API, etc.
        } else {
            console.log('Autocomplete is not loaded yet!');
        }
    };
    
    const parkingSpotsQuery = useQuery({
        queryKey: ["parkingSpots"],
        queryFn: async () => {
            const response = await fetch(import.meta.env.VITE_API_URL + "spot/fetch")
            const data = await response.json()
            //
            // const center = {lat: 45.7652305, lng: 21.2298339}
            //
            // // Get Random location with lat and lng, based on center with a maximum of m meters distance from the center
            // const getRandomLocation = (center, m) => {
            //     const x0 = center.lat;
            //     const y0 = center.lng
            //     const rd = m / 111300 //about 111300 meters in one degree
            //
            //     const u = Math.random();
            //     const v = Math.random();
            //
            //     const w = rd * Math.sqrt(u);
            //     const t = 2 * Math.PI * v;
            //
            //     return {lat: w * Math.cos(t) + x0, lng: w * Math.sin(t) + y0}
            // }
            //
            // const data = [
            //     {
            //         "uuid": "0751928e-312e-4e76-80e7-924078d92fb2",
            //         "freeSpot": false,
            //         "battery": 23.0,
            //         "lat": 0.0,
            //         "lng": 0.0,
            //         "lastTimeReq": null,
            //         "status": "ONLINE"
            //     },
            //     {
            //         "uuid": "0751928e-312e-4e76-80e7-924078d92fb2",
            //         "freeSpot": true,
            //         "battery": 16.0,
            //         "lat": 0.0,
            //         "lng": 0.0,
            //         "lastTimeReq": null,
            //         "status": "UNREGISTERED"
            //     },
            //     {
            //         "uuid": "0751928e-312e-4e76-80e7-924078d92fb2",
            //         "freeSpot": true,
            //         "battery": 16.0,
            //         "lat": 0.0,
            //         "lng": 0.0,
            //         "lastTimeReq": null,
            //         "status": "REGISTERED"
            //     },
            //     {
            //         "uuid": "0751928e-312e-4e76-80e7-924078d92fb2",
            //         "freeSpot": true,
            //         "battery": 16.0,
            //         "lat": 0.0,
            //         "lng": 0.0,
            //         "lastTimeReq": null,
            //         "status": "OFFLINE"
            //     }
            // ]
            //
            // for (let location of data) {
            //     let loct = getRandomLocation(center, 50)
            //     location.lat = loct.lat
            //     location.lng = loct.lng
            // }

            return data
        }
    })

    const userLocation = useGeolocation()

    const calculateRoute = () => {

        if (destinationRef.current.value === '') {
            return
        }

        console.log(destinationRef.current.value)

        const directionsService = new google.maps.DirectionsService()

        directionsService.route({
            origin: {lat: userLocation.latitude, lng: userLocation.longitude},
            destination: destinationRef.current.value,
            travelMode: google.maps.TravelMode.DRIVING
        }, (result, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
                setDirectionsResponse(result)
                console.log(result)
            }
        })
    }

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
                        center={{lat: userLocation.latitude, lng: userLocation.longitude}}
                        zoom={18}
                        mapContainerStyle={{height: "100dvh", width: "100dvw", position: "absolute", left: 0, top: 0, zIndex: -11}}
                        // options={{
                        //     zoomControl: false,
                        //     streetViewControl: false,
                        //     fullscreenControl: false,
                        //     mapTypeControl: false
                        // }}
                        onLoad={(lMap) => setMap(lMap)}>
                        {parkingSpotsQuery.isSuccess && parkingSpotsQuery.data.map((spot, index) => {
                            return (
                                <MarkerF key={index} position={{lat: spot.lat, lng: spot.lng}} options={{
                                    icon: {
                                        url: pin(spot.freeSpot, spot.status),
                                        scaledSize: new window.google.maps.Size(30, 30)
                                    }
                                }}/>
                            )
                        })}

                        {directionsResponse && (
                            <DirectionsRenderer directions={directionsResponse}/>
                        )}
                    </GoogleMap>
                </div>
                {/*<div className={"p-4 rounded-xl m-4 bg-gray-700 z-10 "}>*/}
                {/*    <div className={"text-2xl w-auto text-gray-400 text-center"}>*/}
                {/*        <label htmlFor={"destination"} className={""}>Destination</label>*/}
                {/*        <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>*/}
                {/*            <input type="text" className={"text-black w-80 rounded-xl"}  id={"destination"} placeholder={"Destination"} ref={destinationRef}/>*/}
                {/*        </Autocomplete>*/}
                {/*        <input type="submit" onClick={calculateRoute}/>*/}
                {/*    </div>*/}
                {/*</div>*/}
            </div>
        </>
    )
}